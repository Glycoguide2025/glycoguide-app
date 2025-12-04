import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function addNewUserToSendGrid(email: string, firstName: string) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not found - skipping SendGrid contact add");
    return;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contacts: [{ email, first_name: firstName }],
      }),
    });

    if (!response.ok) {
      console.error("SendGrid contact add failed:", await response.text());
    } else {
      console.log(`✓ Added ${email} to SendGrid Welcome Series`);
    }
  } catch (error) {
    console.error("SendGrid error:", error);
  }
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  // CRITICAL FIX: Session cookie configuration
  // Production (HTTPS) requires secure: true, Development (HTTP) requires secure: false
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  
  const cookieConfig: session.CookieOptions = {
    httpOnly: true, // Secure - prevent XSS attacks
    secure: isProduction, // Production=true (HTTPS), Development=false (HTTP)
    sameSite: 'lax', // Lax works for same-origin requests
    maxAge: sessionTtl,
    path: '/',
  };
  
  // Don't set domain - let it default to current hostname
  // This avoids cross-subdomain issues
  
  // DEBUG: Log cookie configuration at startup
  console.log('[COOKIE CONFIG v3 - SECURE FIX]', {
    isProduction,
    cookieConfig: JSON.stringify(cookieConfig),
    timestamp: new Date().toISOString()
  });
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: true, // CRITICAL: Save session on every request (prevents mobile logout)
    saveUninitialized: false,
    store: sessionStore,
    cookie: cookieConfig,
    name: 'glycoguide.sid',
    rolling: true, // Refresh session expiry on every request
    proxy: true, // CRITICAL: Trust Replit's proxy to properly handle HTTPS
    unset: 'keep', // Keep session in store even if unset
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password || !(await comparePasswords(password, user.password))) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      return done(null, user);
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: any, done) => {
    try {
      // Handle invalid/legacy session data gracefully
      if (!id || typeof id !== 'string') {
        return done(null, null);
      }
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (error) {
      console.log('Session deserialization error (clearing session):', error);
      done(null, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
      });

      // Send Welcome Email using dynamic template
      if (user.email) {
        try {
          console.log(`📧 Attempting to send welcome email to ${user.email}...`);
          const { sendWelcomeEmail } = await import('./lib/mail.js');
          console.log(`📧 sendWelcomeEmail function imported successfully`);
          
          const emailResult = await sendWelcomeEmail(user.email, user.firstName || "there");
          console.log(`📧 Email result:`, emailResult);
          
          if (emailResult.ok) {
            console.log(`✅ Welcome email sent successfully to ${user.email}`);
          } else {
            console.error(`❌ Welcome email failed for ${user.email}:`, emailResult.error);
          }
        } catch (error) {
          console.error(`❌ Error sending welcome email:`, error);
        }
        
        // Also add to SendGrid automation (for follow-up emails if configured)
        await addNewUserToSendGrid(user.email, user.firstName || "");
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        console.log('[LOGIN SUCCESS]', {
          userId: user.id,
          email: user.email,
          sessionID: req.sessionID,
          setCookieHeader: res.getHeader('Set-Cookie')
        });
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
        }
        
        res.clearCookie('glycoguide.sid', {
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
        });
        
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    res.json(req.user);
  });

  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(200).json({ message: "If an account exists, a reset email has been sent" });
      }

      const resetToken = randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      await storage.updateUser(user.id, {
        resetToken,
        resetTokenExpiry,
      });

      // Send password reset email using path-based token (mobile-friendly)
      // Use FRONTEND_URL for production, fallback to request host
      const resetUrl = `${process.env.FRONTEND_URL || 'https://' + req.get('host')}/reset-password/${resetToken}`;
      
      console.log(`🔗 RESET URL BEING SENT: ${resetUrl}`);
      console.log(`🔗 TOKEN: ${resetToken}`);
      
      try {
        const { sendPasswordResetEmail } = await import('./lib/mail.js');
        const emailResult = await sendPasswordResetEmail(
          email,
          user.firstName || "there",
          resetUrl
        );
        
        if (emailResult.ok) {
          console.log(`✅ Password reset email sent to ${email} with URL: ${resetUrl}`);
        } else {
          console.error(`❌ Password reset email failed for ${email}:`, emailResult.error);
        }
      } catch (error) {
        console.error(`❌ Error sending password reset email:`, error);
      }

      res.status(200).json({ message: "If an account exists, a reset email has been sent" });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      console.log('🔐 Password reset attempt:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        tokenPreview: token?.substring(0, 8) + '...',
        hasPassword: !!password 
      });
      
      if (!token || !password) {
        console.error('❌ Missing token or password');
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 6) {
        console.error('❌ Password too short');
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const user = await storage.getUserByResetToken(token);
      
      if (!user) {
        console.error('❌ No user found for token');
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        console.error('❌ Token expired:', { expiry: user.resetTokenExpiry });
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await hashPassword(password);
      
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });

      console.log('✅ Password reset successful for user:', user.email);
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error('💥 Reset password error:', error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
}

export const isAuthenticated = (req: any, res: any, next: any) => {
  const isAuth = req.isAuthenticated();
  if (!isAuth) {
    console.error('[isAuthenticated] Authentication failed', {
      hasUser: !!req.user,
      hasSession: !!req.session,
      sessionID: req.sessionID,
      method: req.method,
      path: req.path,
      cookies: Object.keys(req.cookies || {}),
      headers: {
        cookie: req.headers.cookie ? 'present' : 'missing',
        authorization: req.headers.authorization ? 'present' : 'missing'
      }
    });
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log('[isAuthenticated] Success', {
    userId: req.user?.id,
    method: req.method,
    path: req.path
  });
  next();
};
