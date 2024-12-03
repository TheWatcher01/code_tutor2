// File path : code_tutor2/backend/src/routes/auth.routes.js

import { Router } from "express";
import passport from "passport";
import logger from "../services/backendLogger.js";

const router = Router();

// Auth status
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

// GitHub auth init
router.get("/github", 
  (req, res, next) => {
    logger.info("[Auth] Starting GitHub auth", { sessionId: req.sessionID });
    next();
  },
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub callback
// GitHub callback
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
    // Rediriger vers la page callback frontend
    successRedirect: `${process.env.FRONTEND_URL}/auth/github/callback`,
  })
);

// Logout
router.post("/logout", (req, res) => {
  logger.info("[Auth] Logout request", { userId: req.user?.id });
  req.logout(() => {
    logger.info("[Auth] Logout successful");
    res.json({ success: true });
  });
});

export default router;
