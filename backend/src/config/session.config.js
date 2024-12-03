// File path: code_tutor2/backend/src/config/session.config.js

import session from "express-session";
import MongoStore from "connect-mongo";
import logger from "../services/backendLogger.js";

const initializeSession = (app) => {
  logger.info("[Session Config] Starting initialization");

  try {
    const store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60,
      autoRemove: "native",
      touchAfter: 24 * 3600,
      collectionName: "sessions",
      mongoOptions: {
        serverSelectionTimeoutMS: 5000,
      },
    });

    store.on("error", (error) => {
      logger.error("[Session Store] Store error", {
        error: error.message,
        name: error.name,
      });
    });

    const sessionConfig = {
      secret: process.env.SESSION_SECRET,
      name: "code_tutor.sid",
      resave: false,
      rolling: true,
      saveUninitialized: false,
      proxy: true,
      store,
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        domain: ".code-tutor.dev31.tech",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      },
    };

    app.use(session(sessionConfig));

    logger.info("[Session Config] Session initialized with store", {
      store: "MongoDB",
      env: process.env.NODE_ENV,
      cookieSettings: {
        secure: sessionConfig.cookie.secure,
        sameSite: sessionConfig.cookie.sameSite,
        domain: sessionConfig.cookie.domain,
      },
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
