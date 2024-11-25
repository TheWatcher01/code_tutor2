// File path: code_tutor2/backend/src/config/session.config.js

import session from "express-session";
import MongoStore from "connect-mongo";
import logger from "../services/backendLogger.js";

const initializeSession = (app) => {
  logger.info("Initializing session configuration");

  // Session store configuration
  const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60, // Session TTL (1 day)
    crypto: {
      secret: process.env.SESSION_SECRET,
    },
  });

  // Log session store events
  sessionStore.on("create", (sessionId) => {
    logger.debug("New session created", { sessionId });
  });

  sessionStore.on("touch", (sessionId) => {
    logger.debug("Session touched/updated", { sessionId });
  });

  sessionStore.on("destroy", (sessionId) => {
    logger.debug("Session destroyed", { sessionId });
  });

  // Session middleware configuration
  const sessionConfig = {
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    name: "code.tutor.sid", // Custom session ID cookie name
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset cookie maxAge on each response
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiry (1 day)
    },
  };

  // Apply session middleware
  app.use(session(sessionConfig));

  // Session monitoring middleware
  app.use((req, res, next) => {
    if (req.session) {
      // Log session activity on each request
      logger.debug("Session activity", {
        sessionId: req.sessionID,
        path: req.path,
        authenticated: req.isAuthenticated(),
        userId: req.user?.id,
      });
    }
    next();
  });

  logger.info("Session configuration completed");
};

export default initializeSession;
