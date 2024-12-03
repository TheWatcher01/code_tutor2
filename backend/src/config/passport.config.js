// File path: code_tutor2/backend/src/config/passport.config.js

import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import logger from "../services/backendLogger.js";
import User from "../models/User.model.js";

const initializePassport = () => {
  logger.info("[Passport] Starting passport initialization");

  // Store only user ID in session for efficiency
  passport.serializeUser((user, done) => {
    logger.debug("[Passport] Serializing user", { userId: user.id });
    done(null, user.id);
  });

  // Retrieve full user object from database using stored ID
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      logger.debug("[Passport] Deserializing user", { 
        userId: id,
        found: !!user 
      });
      done(null, user);
    } catch (error) {
      logger.error("[Passport] Deserialize error", { error: error.message });
      done(error);
    }
  });

  // Configure GitHub OAuth2 authentication strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        passReqToCallback: true,
        proxy: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          logger.info("[Passport] GitHub auth callback", {
            githubId: profile.id,
            email: profile.emails?.[0]?.value
          });

          // Find existing user or create new one
          let user = await User.findOne({ githubId: profile.id });

          if (!user) {
            // Create new user with GitHub profile data
            user = await User.create({
              githubId: profile.id,
              email: profile.emails?.[0]?.value,
              username: profile.username,
              displayName: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              provider: "github"
            });
            logger.info("[Passport] New user created", { userId: user.id });
          }

          logger.info("[Passport] Authentication successful", { userId: user.id });
          return done(null, user);
        } catch (error) {
          logger.error("[Passport] Auth error", { error: error.message });
          return done(error);
        }
      }
    )
  );

  logger.info("[Passport] Initialization completed");
};

export default initializePassport;
