// File path: code_tutor2/backend/src/config/app.config.js

import express from "express";
import logger from "../services/backendLogger.js";

const initializeApp = (app) => {
  logger.info("[App Config] Starting initialization");

  // Base middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Log each request
  app.use((req, res, next) => {
    logger.debug("[App Config] Request received", {
      method: req.method,
      path: req.path,
      cookies: req.cookies,
      sessionID: req.sessionID,
    });
    next();
  });

  logger.info("[App Config] Initialization completed");
};

export default initializeApp;
