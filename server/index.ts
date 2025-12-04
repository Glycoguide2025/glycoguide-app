import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { sanitizeInput, validateRequest, errorLogger } from "./middleware/security";
import { apiBoundary } from "./middleware/apiBoundary";
import { apiError } from "./middleware/apiError";
import { jwtAuth } from "./middleware/jwtAuth";
import devLoginRoutes from "./routes/dev-login";
import { verifyEnvironment } from "./utils/verifyEnvironment";
import { seedProductionMeals } from "./seed-production-meals";
import { seedProductionEducation } from "./seed-production-education";
import path from "path";

const app = express();

// Stage 17.1: Log ALL requests before CORS
app.use((req, res, next) => {
  if (req.path.startsWith('/api/export')) {
    console.log('[PRE-CORS EXPORT REQUEST]', {
      method: req.method,
      path: req.path,
      origin: req.headers.origin,
      contentType: req.headers['content-type'],
      hasCookie: !!req.headers.cookie
    });
  }
  next();
});

// CORS Configuration with cross-subdomain support
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5000',
      'https://glycoguide.app',
      'https://www.glycoguide.app',
      'https://education.glycoguide.app',
      'https://2c92c586-67af-4e5c-a36d-a0f7feff7182-00-3tqj0z9nwu1nb.kirk.replit.dev'
    ];
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list or patterns
    if (allowedOrigins.includes(origin) || 
        /\.replit\.dev$/.test(origin) || 
        /\.replit\.app$/.test(origin) ||
        /\.glycoguide\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now to fix the issue
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Stage 8 RC Hardening: Helmet security headers
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "img-src": ["'self'", "data:", "https:"],
    "script-src": ["'self'", "'unsafe-inline'", "https://js.stripe.com"], // Vite dev + Stripe
    "connect-src": ["'self'", "https:", "wss:"], // websockets + APIs
    "frame-src": ["'self'", "https://js.stripe.com", "https://*.stripe.com"], // Stripe payment iframes
  },
}));
app.use(helmet.hsts());        // HTTPS strict transport
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));

// Stage 17.1: API Boundary - Enforce JSON responses on /api/* routes
app.use(apiBoundary);

// Stage 17.1: Cookie parser for JWT token extraction
app.use(cookieParser());

// Stage 17.1: JWT Authentication - Validate JWT tokens and set req.user
app.use(jwtAuth);

// Rate-limit public forms
const tightRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, message: 'Too many requests, try again later' });

// Input validation and sanitization
app.use(validateRequest);

// Stripe webhook needs raw body for signature verification
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// All other routes use JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(sanitizeInput);

// Serve generated images and assets
app.use('/attached_assets', express.static(path.resolve(process.cwd(), 'attached_assets')));

// Serve content files (educational HTML articles)
app.use('/content', express.static(path.resolve(process.cwd(), 'content')));

// Serve public static assets (images, fonts, etc.) - MUST come before Vite wildcard handler
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Explicit route for BM article (belts & suspenders)
app.get('/content/BM_Why_It_Matters.html', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'content', 'BM_Why_It_Matters.html'));
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    // Only capture response for non-304 responses to avoid performance overhead
    if (res.statusCode !== 304) {
      capturedJsonResponse = bodyJson;
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      // Only log response body for non-304 and errors, and keep it brief
      if (capturedJsonResponse && res.statusCode !== 304) {
        const preview = JSON.stringify(capturedJsonResponse).slice(0, 50);
        logLine += ` :: ${preview}${JSON.stringify(capturedJsonResponse).length > 50 ? '...' : ''}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Observability status endpoint
app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    version: process.env.BUILD_VERSION ?? "dev",
    builtAt: process.env.BUILD_TIME ?? new Date().toISOString(),
  });
});

// Debug endpoint for session + plan verification
app.get("/api/_debug/whoami", (req, res) => {
  res.json({ 
    userId: (req as any).user?.id, 
    plan: (req as any).user?.plan, 
    ts: Date.now() 
  });
});

// Stage 17.1: Development login routes (guarded by ENABLE_DEV_LOGIN)
app.use(devLoginRoutes);

(async () => {
  // Verify all required environment variables before starting
  const envCheck = verifyEnvironment();
  if (!envCheck.valid) {
    console.error('\n❌ FATAL: Missing required environment variables. Server cannot start.');
    console.error('📋 Configure these secrets in your Deployment settings.\n');
    process.exit(1);
  }
  
  const server = await registerRoutes(app);

  // Stage 17.1: API Error Handler - JSON-only error responses
  app.use(errorLogger);
  app.use(apiError);

  // Setup production or development mode BEFORE starting the server
  if (app.get("env") === "development") {
    // Development: Setup Vite HMR
    await setupVite(app, server);
  } else {
    // Production: Static assets + SPA fallback
    const distPath = path.resolve(process.cwd(), "dist", "public");
    
    // Static assets with caching
    app.use(express.static(distPath, { maxAge: "1y", index: false }));
    
    // SPA fallback: everything else -> index.html
    app.get("*", (req, res) => {
      // Don't hijack API routes or static asset routes
      if (req.path.startsWith("/api") || req.path.startsWith("/export") || req.path.startsWith("/billing") || req.path.startsWith("/attached_assets") || req.path.startsWith("/content")) {
        return res.status(404).json({ error: "Not found" });
      }
      
      // Prevent caching of index.html to ensure users get latest JS
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const indexPath = path.resolve(distPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('[PRODUCTION ERROR] Failed to serve index.html:', {
            error: err.message,
            code: (err as any).code,
            path: indexPath,
            exists: require('fs').existsSync(indexPath)
          });
          res.status(500).send('Application error - please contact support');
        }
      });
    });
    
    // Auto-seed production meals if table is empty
    await seedProductionMeals();
    
    // Auto-seed production education content if table is empty
    await seedProductionEducation();
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
