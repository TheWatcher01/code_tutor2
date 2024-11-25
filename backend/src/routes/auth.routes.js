// File path : code_tutor2/backend/src/routes/auth.routes.js

import { Router } from "express";
import passport from "passport";
import logger from "../services/backendLogger.js";

const router = Router();

// Middleware to log auth attempts
const logAuthAttempt = (req, res, next) => {
  logger.info("Authentication attempt", {
    path: req.path,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
  next();
};

// Initialize GitHub authentication
router.get(
  "/github",
  logAuthAttempt,
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub callback route
router.get(
  "/github/callback",
  logAuthAttempt,
  passport.authenticate("github", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res) => {
    logger.info("Successful GitHub authentication", { userId: req.user.id });
    res.redirect(`${process.env.CORS_ORIGIN}/playground`);
  }
);

// Check authentication status
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    logger.debug("Auth status check - Authenticated", { userId: req.user.id });
    res.json({
      isAuthenticated: true,
      user: req.user,
    });
  } else {
    logger.debug("Auth status check - Not authenticated");
    res.json({
      isAuthenticated: false,
    });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  if (req.user) {
    logger.info("User logout", { userId: req.user.id });
    req.logout((err) => {
      if (err) {
        logger.error("Error during logout", { error: err.message });
        return res.status(500).json({ error: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  } else {
    logger.debug("Logout attempted without active session");
    res.json({ message: "No active session" });
  }
});

export default router;
