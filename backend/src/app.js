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

const initialize = async () => {
  try {
    logger.info("[Server] Starting initialization");

    // Trust proxy pour Nginx
    app.set("trust proxy", 1);

    // 1. Database initialization
    await initializeDatabase();
    logger.info("[Server] Database initialized");

    // 2. Express middleware
    initializeApp(app);
    logger.info("[Server] Core middleware initialized");

    // 3. Session initialization
    await initializeSession(app);
    logger.info("[Server] Session initialized");

    // 4. Passport configuration
    app.use(passport.initialize());
    app.use(passport.session());
    initializePassport();
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

// Start the Express server and set up graceful shutdown
const startServer = async () => {
  try {
    // Initialize all components before starting server
    await initialize();

    // Start listening on configured port
    const server = app.listen(port, () => {
      logger.info("Server", "Server is running", {
        port,
        mode: process.env.NODE_ENV || "development",
        url: `http://localhost:${port}`,
      });
    });

    // Handle graceful shutdown on SIGTERM and SIGINT signals
    const shutdown = async (signal) => {
      try {
        // Close HTTP server and database connections
        await new Promise((resolve) => server.close(resolve));
        await mongoose.connection.close();
        logger.info("Server", "Cleanup completed");
        process.exit(0);
      } catch (err) {
        logger.error("Server", "Error during cleanup");
        process.exit(1);
      }
    };

    // Register signal handlers for graceful shutdown
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Server", "Failed to start server", { error: error.message });
    process.exit(1);
  }
};

startServer();

export default app;
