// File path: code_tutor2/backend/src/config/passport.config.js

import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import logger from "../services/backendLogger.js";
import User from "../models/User.model.js";

const initializePassport = () => {
  logger.info("Initializing Passport configuration");

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    logger.debug("Serializing user session", { userId: user.id });
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      logger.debug("Deserializing user session", { userId: id });
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      logger.error("Error deserializing user", { error: error.message });
      done(error);
    }
  });

  // Configure GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          logger.info("Processing GitHub authentication", {
            githubId: profile.id,
          });

          // Find or create user
          let user = await User.findOne({ githubId: profile.id });

          if (!user) {
            logger.info("Creating new user from GitHub profile", {
              githubId: profile.id,
            });

            user = await User.create({
              githubId: profile.id,
              email: profile.emails?.[0]?.value,
              username: profile.username,
              displayName: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              provider: "github",
            });

            logger.info("Successfully created new user", { userId: user.id });
          } else {
            logger.info("Found existing user", { userId: user.id });
          }

          return done(null, user);
        } catch (error) {
          logger.error("GitHub authentication error", {
            error: error.message,
            stack: error.stack,
          });
          return done(error);
        }
      }
    )
  );

  logger.info("Passport configuration completed");
};

export default initializePassport;
