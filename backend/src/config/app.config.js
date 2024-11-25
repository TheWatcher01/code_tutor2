// File path : code_tutor2/backend/src/config/app.config.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import logger from "../services/backendLogger.js";

const initializeApp = (app) => {
  logger.info("Initializing application configuration");

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", process.env.CORS_ORIGIN],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "data:", "https:"],
        },
      },
    })
  );

  // CORS configuration for session support
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      methods: process.env.CORS_METHODS.split(","),
      allowedHeaders: process.env.CORS_ALLOWED_HEADERS.split(","),
      credentials: true,
      maxAge: 86400, // 24 hours
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Request logging
  app.use((req, res, next) => {
    logger.debug("Incoming request", {
      method: req.method,
      path: req.path,
      ip: req.ip,
      authenticated: req.isAuthenticated(),
    });
    next();
  });

  // Error handling
  app.use((err, req, res, next) => {
    logger.error("Global error handler", {
      error: err.message,
      stack: err.stack,
      path: req.path,
    });

    const statusCode = err.status || 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message;

    res.status(statusCode).json({ error: message });
  });

  logger.info("Application configuration completed");
};

export default initializeApp;
