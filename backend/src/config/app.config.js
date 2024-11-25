// File path : code_tutor2/backend/src/config/app.config.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import logger from "../services/backendLogger.js";

const initializeApp = (app) => {
  logger.info("[App Config] Starting initialization");

  // Configuration CORS simplifiée
  const corsConfig = {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  };

  logger.debug("[App Config] CORS configuration", corsConfig);
  app.use(cors(corsConfig));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Log chaque requête
  app.use((req, res, next) => {
    logger.debug("[App Config] Request received", {
      method: req.method,
      path: req.path,
      cookies: req.cookies,
      sessionID: req.sessionID
    });
    next();
  });

  logger.info("[App Config] Initialization completed");
};

export default initializeApp;
