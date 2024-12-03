// File path: code_tutor2/backend/src/config/session.config.js

import session from "express-session";
import MongoStore from "connect-mongo";
import logger from "../services/backendLogger.js";

const initializeSession = (app) => {
  logger.info("[Session Config] Starting initialization");

  // Validation des variables d'environnement
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
    // Configuration du store MongoDB
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

    // Monitoring des sessions
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

    // Configuration principale de la session
    const sessionConfig = {
      store,
      secret: process.env.SESSION_SECRET,
      name: "code_tutor.sid", // Nom fixe du cookie
      resave: false,
      saveUninitialized: false,
      proxy: true, // Important pour nginx
      cookie: {
        secure: true, // Toujours true avec nginx/https
        httpOnly: true,
        sameSite: "none", // Important pour le cross-domain
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
        domain: "code-tutor.dev31.tech", // Domaine explicite
      },
    };

    // Trust proxy pour nginx
    app.set("trust proxy", 1);

    // Log de la configuration
    logger.debug("[Session Config] Session configuration", {
      cookieName: sessionConfig.name,
      cookieSecure: sessionConfig.cookie.secure,
      cookieDomain: sessionConfig.cookie.domain,
      environment: process.env.NODE_ENV,
    });

    // Application du middleware session
    app.use(session(sessionConfig));

    // Middleware de monitoring
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
