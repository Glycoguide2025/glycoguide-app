import { auth, ConfigParams, requiresAuth } from "express-openid-connect";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.AUTH0_DOMAIN) {
  throw new Error("Environment variable AUTH0_DOMAIN not provided");
}

if (!process.env.AUTH0_CLIENT_ID) {
  throw new Error("Environment variable AUTH0_CLIENT_ID not provided");
}

if (!process.env.AUTH0_CLIENT_SECRET) {
  throw new Error("Environment variable AUTH0_CLIENT_SECRET not provided");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
    pruneSessionInterval: false,
  });
  return session({
    secret: process.env.AUTH0_CLIENT_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: 'auto', // Auto-detect based on connection
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  // Setup session middleware BEFORE Auth0
  app.use(getSession());

  // Use Replit dev domain or fallback to published domain
  const baseURL = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "https://glycoguide.replit.dev";

  console.log('[AUTH0] Setting up Auth0 with baseURL:', baseURL);

  const config: ConfigParams = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_CLIENT_SECRET!,
    baseURL,
    clientID: process.env.AUTH0_CLIENT_ID!,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    idpLogout: true,
    routes: {
      login: "/api/login",
      logout: "/api/logout",
      callback: "/api/callback",
    },
    afterCallback: async (req, res, session) => {
      const user = session.user;
      
      if (user && user.sub) {
        // Upsert user to database
        await storage.upsertUser({
          id: user.sub,
          email: user.email,
          firstName: user.given_name || user.name?.split(' ')[0] || '',
          lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: user.picture || null,
        });

        // Load user plan from database
        try {
          const dbUser = await storage.getUser(user.sub);
          if (dbUser) {
            session.user.plan = dbUser.subscriptionTier || 'free';
            session.user.planTier = dbUser.subscriptionTier || 'free';
            session.user.subscriptionTier = dbUser.subscriptionTier || 'free';
          }
        } catch (error) {
          console.error('[AUTH0] Failed to load user plan:', error);
          session.user.plan = 'free';
          session.user.planTier = 'free';
          session.user.subscriptionTier = 'free';
        }
      }

      return session;
    },
  };

  app.use(auth(config));

  // Extend req to include user info for compatibility
  app.use((req, res, next) => {
    if (req.oidc.isAuthenticated()) {
      const oidcUser = req.oidc.user;
      // Create a user object compatible with existing middleware
      (req as any).user = {
        id: oidcUser?.sub,
        email: oidcUser?.email,
        name: oidcUser?.name,
        plan: oidcUser?.plan || 'free',
        planTier: oidcUser?.planTier || 'free',
        subscriptionTier: oidcUser?.subscriptionTier || 'free',
      };
      (req as any).isAuthenticated = () => true;
    } else {
      (req as any).isAuthenticated = () => false;
    }
    next();
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Support both Auth0 and JWT authentication
  const isAuth0Authenticated = req.oidc && req.oidc.isAuthenticated();
  const isJWTAuthenticated = (req as any).user && (req as any).isAuthenticated?.();
  
  if (!isAuth0Authenticated && !isJWTAuthenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
