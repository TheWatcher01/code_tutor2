// File path : code_tutor2/backend/src/app.js

import express from "express";
import logger from "./services/backendLogger.js";
import passport from "passport";
import initializeApp from "./config/app.config.js";
import initializePassport from "./config/passport.config.js";
import initializeSession from "./config/session.config.js";
import initializeDatabase from "./config/database.config.js";
import authRoutes from "./routes/auth.routes.js";
import mongoose from "mongoose";

const app = express();
const port = process.env.PORT || 3000;

// Initialize Express application
const initialize = async () => {
  try {
    logger.info("[Server] Starting initialization");

    // 1. Database
    await initializeDatabase();
    logger.info("[Server] Database initialized");

    // 2. Express middleware & CORS
    initializeApp(app);
    logger.info("[Server] Core middleware initialized");

    // 3. Initialize session BEFORE passport
    await initializeSession(app);
    logger.info("[Server] Session initialized");

    // 4. Initialize passport and its middleware
    app.use(passport.initialize());
    app.use(passport.session());
    initializePassport(); // Don't pass app as parameter
    logger.info("[Server] Passport initialized");

    // 5. Routes
    app.use("/api/auth", authRoutes);
    logger.info("[Server] Routes mounted");

    return app;
  } catch (error) {
    logger.error("[Server] Initialization failed", { error: error.message });
    throw error;
  }
};

// Start the server
const startServer = async () => {
  try {
    await initialize();

    const server = app.listen(port, () => {
      logger.info("Server", "Server is running", {
        port,
        mode: process.env.NODE_ENV || "development",
        url: `http://localhost:${port}`,
      });
    });

    const shutdown = async (signal) => {
      try {
        await new Promise((resolve) => server.close(resolve));
        await mongoose.connection.close();
        logger.info("Server", "Cleanup completed");
        process.exit(0);
      } catch (err) {
        logger.error("Server", "Error during cleanup");
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Server", "Failed to start server", { error: error.message });
    process.exit(1);
  }
};

startServer();

export default app;
