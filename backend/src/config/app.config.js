// File path: code_tutor2/backend/src/config/app.config.js

// Importing necessary modules
import express from "express";
import logger from "../services/backendLogger.js";

// Function to initialize the application
const initializeApp = (app) => {
  // Logging the start of initialization
  logger.info("[App Config] Starting initialization");

  // Using express middleware to parse JSON and URL encoded data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Using express middleware to log request details
  app.use((req, res, next) => {
    logger.debug("[App Config] Request received", {
      method: req.method,
      path: req.path,
      cookies: req.cookies,
      sessionID: req.sessionID,
    });
    next();
  });

  // Logging the completion of initialization
  logger.info("[App Config] Initialization completed");
};

// Exporting the initializeApp function
export default initializeApp;
