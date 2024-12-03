// File path: code_tutor2/backend/src/config/session.config.js

import session from "express-session";
import MongoStore from "connect-mongo";
import logger from "../services/backendLogger.js";

const initializeSession = (app) => {
  logger.info("[Session Config] Starting initialization");

  // Validate environment variables
  if (
    !process.env.MONGODB_URI ||
    !process.env.SESSION_SECRET ||
    !process.env.SESSION_COOKIE_NAME
  ) {
    const error =
      "Missing required environment variables for session configuration";
    logger.error("[Session Config] Initialization failed", { error });
    throw new Error(error);
  }

  try {
    // Configure MongoDB store
    const store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60,
      autoRemove: "native",
      collectionName: "sessions",
      touchAfter: 24 * 3600,
      mongoOptions: {
        enableUtf8Validation: true,
        serverSelectionTimeoutMS: 5000,
      },
    });

    // Session monitoring
    store.on("create", (sessionId) => {
      logger.debug("[Session Store] Session created", {
        id: sessionId?.substring(0, 8),
      });
    });

    store.on("destroy", (sessionId) => {
      logger.debug("[Session Store] Session destroyed", {
        id: sessionId?.substring(0, 8),
      });
    });

    store.on("error", (error) => {
      logger.error("[Session Store] Store error", {
        error: error.message,
        name: error.name,
      });
    });

    // Main session configuration
    const sessionConfig = {
      store,
      secret: process.env.SESSION_SECRET,
      name: "code_tutor.sid", // Fixed cookie name
      resave: false,
      saveUninitialized: false,
      proxy: true, // Required for nginx
      cookie: {
        secure: true, // Always true with nginx/https
        httpOnly: true,
        sameSite: "none", // Required for cross-domain
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
        domain: "code-tutor.dev31.tech", // Explicit domain
      },
    };

    // Trust proxy for nginx
    app.set("trust proxy", 1);

    // Log configuration
    logger.debug("[Session Config] Session configuration", {
      cookieName: sessionConfig.name,
      cookieSecure: sessionConfig.cookie.secure,
      cookieDomain: sessionConfig.cookie.domain,
      environment: process.env.NODE_ENV,
    });

    // Apply session middleware
    app.use(session(sessionConfig));

    // Monitoring middleware
    app.use((req, res, next) => {
      logger.debug("[Session Config] Session middleware", {
        sessionID: req.sessionID?.substring(0, 8),
        isNewSession: req.session.isNew,
        hasCookie: !!req.headers.cookie,
      });
      next();
    });

    logger.info("[Session Config] Initialization completed", {
      store: "MongoDB",
      env: process.env.NODE_ENV,
    });
  } catch (error) {
    logger.error("[Session Config] Fatal error during initialization", {
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    throw error;
  }
};

export default initializeSession;
