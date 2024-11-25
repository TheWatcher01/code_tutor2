// File path : code_tutor2/backend/src/app.js

import express from "express";
import logger from "./services/backendLogger.js";
import initializeApp from "./config/app.config.js";
import initializePassport from "./config/passport.config.js";
import initializeSession from "./config/session.config.js";
import initializeDatabase from "./config/database.config.js";
import authRoutes from "./routes/auth.routes.js";
import mongoose from "mongoose";
import { createServer } from "http";

const app = express();
const port = 3000;
let server = null;

// Function to check if port is available
const isPortAvailable = async (port) => {
  return new Promise((resolve) => {
    const testServer = createServer()
      .listen(port, () => {
        testServer.close();
        resolve(true);
      })
      .on("error", () => {
        resolve(false);
      });
  });
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info("Server", `${signal} received. Starting graceful shutdown...`);

  try {
    // Close HTTP Server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info("Server", "HTTP server closed");
    }

    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info("Database", "MongoDB connection closed");
    }

    logger.info("Server", "Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Server", "Error during shutdown", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Initialize database and start server
const startServer = async () => {
  try {
    logger.info("Server", "Starting application initialization");

    // Check if port is available
    const portAvailable = await isPortAvailable(port);
    if (!portAvailable) {
      logger.error(
        "Server",
        `Port ${port} is already in use. Please stop the other server first.`
      );
      process.exit(1);
    }

    // Initialize MongoDB connection, collections and indexes
    await initializeDatabase();

    // Initialize Express configurations
    initializeApp(app);
    initializeSession(app);
    initializePassport();

    // Routes
    app.use("/api/auth", authRoutes);

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });

    // Start server
    server = app.listen(port, () => {
      logger.info("Server", "Server started successfully", {
        port,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
      });
    });

    // Handle server errors
    server.on("error", (error) => {
      logger.error("Server", "Server error occurred", {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    // Setup signal handlers for graceful shutdown
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGQUIT", () => gracefulShutdown("SIGQUIT"));

    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
      logger.error("Server", "Uncaught exception", {
        error: error.message,
        stack: error.stack,
      });
      gracefulShutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Server", "Unhandled rejection", {
        reason,
        promise,
      });
      gracefulShutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    logger.error("Server", "Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Start the application
startServer();
