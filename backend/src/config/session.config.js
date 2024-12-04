// File path: code_tutor2/backend/src/config/session.config.js

// Importing necessary modules
import session from "express-session";
import MongoStore from "connect-mongo";
import logger from "../services/backendLogger.js";

// Function to initialize session management
const initializeSession = (app) => {
  logger.info("[Session Config] Starting initialization");

  try {
    // Creating a new MongoDB session store
    const store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 24 * 60 * 60,
      autoRemove: "interval",
      autoRemoveInterval: 60,
      touchAfter: 24 * 3600,
      collectionName: "sessions",
      crypto: {
        secret: process.env.SESSION_SECRET
      },
      mongoOptions: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    });

    // Handling store errors
    store.on("error", (error) => {
      logger.error("[Session Store] Store error", {
        error: error.message,
        name: error.name,
      });
    });

    // Configuring session settings
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

    // Using the session middleware
    app.use(session(sessionConfig));

    // Logging session initialization details
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
    // Handling initialization errors
    logger.error("[Session Config] Fatal error during initialization", {
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
    throw error;
  }
};

// Exporting the session initialization function
export default initializeSession;
