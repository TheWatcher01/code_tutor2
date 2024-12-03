// Authentication routes for the application

import { Router } from "express";
import passport from "passport";
import logger from "../services/backendLogger.js";

const router = Router();

// Returns the current authentication status and user info
router.get("/status", (req, res) => {
  logger.debug("[Auth] Status check", { 
    isAuthenticated: req.isAuthenticated(),
    userId: req.user?.id 
  });
  res.json({ 
    isAuthenticated: req.isAuthenticated(),
    user: req.user 
  });
});

// Initiates GitHub OAuth authentication flow
router.get("/github", 
  (req, res, next) => {
    logger.info("[Auth] Starting GitHub auth", { sessionId: req.sessionID });
    next();
  },
  passport.authenticate("github", { scope: ["user:email"] })
);

// Handles the GitHub OAuth callback
router.get("/github/callback",
  (req, res, next) => {
    logger.info("[Auth] GitHub callback received", { 
      code: !!req.query.code,
      sessionId: req.sessionID 
    });
    next();
  },
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed`,
    // Redirect to frontend callback page on success
    successRedirect: `${process.env.FRONTEND_URL}/auth/github/callback`,
  })
);

// Handles user logout and session cleanup
router.post("/logout", (req, res) => {
  logger.info("[Auth] Logout request", { userId: req.user?.id });
  req.logout(() => {
    logger.info("[Auth] Logout successful");
    res.json({ success: true });
  });
});

export default router;
