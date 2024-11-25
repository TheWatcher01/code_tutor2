// File path: code_tutor2/backend/src/config/session.config.js

import session from "express-session";
import MongoStore from "connect-mongo";
import logger from "../services/backendLogger.js";

const initializeSession = (app) => {
  logger.info("[Session Config] Starting initialization");

  const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60
  });

  // Log les événements de session
  store.on("create", (sessionId) => 
    logger.debug("[Session Store] Session created", { sessionId }));
  store.on("destroy", (sessionId) => 
    logger.debug("[Session Store] Session destroyed", { sessionId }));

  const sessionConfig = {
    store,
    secret: process.env.SESSION_SECRET,
    name: process.env.SESSION_COOKIE_NAME,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  };

  logger.debug("[Session Config] Session configuration", {
    cookieName: sessionConfig.name,
    cookieSecure: sessionConfig.cookie.secure
  });

  app.use(session(sessionConfig));

  // Log middleware de session
  app.use((req, res, next) => {
    logger.debug("[Session Config] Session middleware", {
      sessionID: req.sessionID,
      isNewSession: req.session.isNew
    });
    next();
  });

  logger.info("[Session Config] Initialization completed");
};

export default initializeSession;
