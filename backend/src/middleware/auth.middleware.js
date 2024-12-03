// File path : code_tutor2/backend/src/middleware/auth.middleware.js

import logger from "../services/backendLogger.js";

export const isAuthenticated = (req, res, next) => {
  logger.debug("Checking authentication status", {
    path: req.path,
    isAuthenticated: req.isAuthenticated(),
    sessionID: req.sessionID,
  });

  if (req.isAuthenticated()) {
    return next();
  }

  logger.warn("Unauthorized access attempt", {
    path: req.path,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.status(401).json({ error: "Unauthorized access" });
};

export const handleAuthError = (err, req, res, next) => {
  logger.error("Authentication error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    user: req.user?.id,
  });

  res.status(500).json({
    error: "Authentication error occurred",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
};

export const sessionChecker = (req, res, next) => {
  logger.debug("Session check middleware", {
    hasSession: !!req.session,
    sessionID: req.sessionID,
    path: req.path,
  });

  if (!req.session || !req.session.passport) {
    logger.warn("Invalid session detected", {
      path: req.path,
      ip: req.ip,
    });

    // Clean up invalid session if it exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          logger.error("Error destroying invalid session", {
            error: err.message,
            sessionID: req.sessionID,
          });
        }
      });
    }

    return res.status(401).json({ error: "Invalid session" });
  }

  next();
};

// Implements rate limiting for authentication routes to prevent brute force attacks
export const authRateLimiter = (req, res, next) => {
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

  req.session.authAttempts = req.session.authAttempts || {
    count: 0,
    resetTime: Date.now() + WINDOW_MS,
  };

  // Reset attempt counter if time window has expired
  if (Date.now() > req.session.authAttempts.resetTime) {
    req.session.authAttempts.count = 0;
    req.session.authAttempts.resetTime = Date.now() + WINDOW_MS;
  }

  if (req.session.authAttempts.count >= MAX_ATTEMPTS) {
    logger.warn("Rate limit exceeded for authentication", {
      ip: req.ip,
      attempts: req.session.authAttempts.count,
    });

    return res.status(429).json({
      error: "Too many authentication attempts. Please try again later.",
    });
  }

  req.session.authAttempts.count++;
  next();
};
