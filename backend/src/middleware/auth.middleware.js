// File path : code_tutor2/backend/src/middleware/auth.middleware.js

import logger from "../services/backendLogger.js";

// Middleware to check if user is authenticated before allowing access to protected routes
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

// Global error handler for authentication-related errors
export const handleAuthError = (err, req, res, next) => {
  logger.error("Authentication error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    user: req.user?.id,
  });

  // Return detailed error in development, generic message in production
  res.status(500).json({
    error: "Authentication error occurred",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
};

// Middleware to validate session integrity and clean up invalid sessions
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

    // Destroy invalid session if it exists
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

// Rate limiting middleware to prevent brute force attacks on authentication routes
export const authRateLimiter = (req, res, next) => {
  // Configure rate limiting parameters
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

  // Initialize or get attempt counter for current session
  req.session.authAttempts = req.session.authAttempts || {
    count: 0,
    resetTime: Date.now() + WINDOW_MS,
  };

  // Reset counter if time window has expired
  if (Date.now() > req.session.authAttempts.resetTime) {
    req.session.authAttempts.count = 0;
    req.session.authAttempts.resetTime = Date.now() + WINDOW_MS;
  }

  // Check if maximum attempts exceeded
  if (req.session.authAttempts.count >= MAX_ATTEMPTS) {
    logger.warn("Rate limit exceeded for authentication", {
      ip: req.ip,
      attempts: req.session.authAttempts.count,
    });

    return res.status(429).json({
      error: "Too many authentication attempts. Please try again later.",
    });
  }

  // Increment attempt counter and continue
  req.session.authAttempts.count++;
  next();
};
