// File path : code_tutor2/backend/src/services/user.service.js

import logger from "./backendLogger.js";
import User from "../models/User.model.js";

class UserService {
  async findOrCreateUser(profile) {
    try {
      logger.info("Looking up user by GitHub ID", { githubId: profile.id });

      let user = await User.findOne({ githubId: profile.id });

      if (!user) {
        logger.info("Creating new user from GitHub profile");

        user = await User.create({
          githubId: profile.id,
          email: profile.emails?.[0]?.value,
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
          provider: "github",
        });

        logger.info("New user created successfully", { userId: user.id });
      } else {
        logger.debug("Existing user found", { userId: user.id });
        await user.updateLastLogin();
      }

      return user;
    } catch (error) {
      logger.error("Error in findOrCreateUser", {
        error: error.message,
        githubId: profile.id,
      });
      throw error;
    }
  }

  async validateSession(sessionId) {
    try {
      logger.debug("Validating session", { sessionId });

      // Validate the session by checking expiration time and user status
      // TODO: Implement actual session validation logic

      return true;
    } catch (error) {
      logger.error("Error validating session", {
        error: error.message,
        sessionId,
      });
      return false;
    }
  }

  async revokeSession(sessionId) {
    try {
      logger.info("Revoking session", { sessionId });

      // Remove session from store and invalidate any associated tokens
      // TODO: Implement actual session revocation logic

      return true;
    } catch (error) {
      logger.error("Error revoking session", {
        error: error.message,
        sessionId,
      });
      throw error;
    }
  }
}

export default new UserService();
