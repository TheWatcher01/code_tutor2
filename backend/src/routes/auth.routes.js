// File path: code_tutor2/backend/src/routes/auth.routes.js

import { Router } from "express";
import passport from "passport";
import logger from "../services/backendLogger.js";

// Creating a new router instance
const router = Router();

// Route to check authentication status
router.get("/status", (req, res) => {
  const sessionData = req.session;
  const isAuth = req.isAuthenticated();

  // Logging the status check
  logger.debug("[Auth] Status check", {
    isAuthenticated: isAuth,
    userId: req.user?.id,
    sessionID: req.sessionID,
    sessionData: {
      cookie: sessionData?.cookie,
      passport: !!sessionData?.passport,
    },
  });

  // Responding with detailed information
  res.json({
    isAuthenticated: isAuth,
    user: isAuth
      ? {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName,
          avatarUrl: req.user.avatarUrl,
          provider: req.user.provider,
        }
      : null,
  });
});

// Route to start GitHub authentication
router.get(
  "/github",
  (req, res, next) => {
    logger.info("[Auth] Starting GitHub authentication", {
      sessionID: req.sessionID,
      cookies: req.headers.cookie,
      userAgent: req.headers["user-agent"],
    });
    next();
  },
  passport.authenticate("github", {
    scope: ["user:email"],
    session: true,
  })
);

// Route to handle GitHub authentication callback
router.get(
  "/github/callback",
  (req, res, next) => {
    logger.info("[Auth] GitHub callback received", {
      code: !!req.query.code,
      sessionID: req.sessionID,
      cookies: req.headers.cookie,
      userAgent: req.headers["user-agent"],
    });
    next();
  },
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed`,
    session: true,
  }),
  async (req, res) => {
    // Ensure the session is saved before redirecting
    req.session.save((err) => {
      if (err) {
        logger.error("[Auth] Session save error", {
          error: err.message,
          userId: req.user?.id,
          sessionID: req.sessionID,
        });
        return res.redirect(`${process.env.FRONTEND_URL}?error=session_error`);
      }

      logger.info("[Auth] Authentication successful, session saved", {
        user: req.user?.id,
        sessionID: req.sessionID,
        isAuthenticated: req.isAuthenticated(),
      });

      res.redirect(`${process.env.FRONTEND_URL}/auth/github/callback`);
    });
  }
);

// Route to handle user logout
router.post("/logout", (req, res) => {
  const userId = req.user?.id;
  const sessionID = req.sessionID;

  logger.info("[Auth] Logout request", {
    userId,
    sessionID,
  });

  if (!req.isAuthenticated()) {
    logger.warn("[Auth] Logout requested for unauthenticated session", {
      sessionID,
    });
    return res.status(400).json({ error: "Not authenticated" });
  }

  req.logout((err) => {
    if (err) {
      logger.error("[Auth] Logout error", {
        error: err.message,
        userId,
        sessionID,
      });
      return res.status(500).json({ error: "Logout failed" });
    }

    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        logger.error("[Auth] Session destruction error", {
          error: sessionErr.message,
          userId,
          sessionID,
        });
      }

      logger.info("[Auth] Logout successful", {
        userId,
        sessionID,
      });

      res.json({ success: true });
    });
  });
});

export default router;
