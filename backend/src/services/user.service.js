// File path : code_tutor2/backend/src/services/user.service.js

// Import required dependencies
import logger from "./backendLogger.js";
import User from "../models/User.model.js";

// Service class to handle user-related operations
class UserService {
  // Find existing user by GitHub ID or create new user from GitHub profile
  async findOrCreateUser(profile) {
    try {
      logger.info("Looking up user by GitHub ID", { githubId: profile.id });

      // Try to find user with matching GitHub ID
      let user = await User.findOne({ githubId: profile.id });

      if (!user) {
        // If user doesn't exist, create new user with GitHub profile data
        logger.info("Creating new user from GitHub profile");

        user = await User.create({
          githubId: profile.id,
          email: profile.emails?.[0]?.value, // Get first email if available
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value, // Get first photo URL if available
          provider: "github",
        });

        logger.info("New user created successfully", { userId: user.id });
      } else {
        // If user exists, update their last login timestamp
        logger.debug("Existing user found", { userId: user.id });
        await user.updateLastLogin();
      }

      return user;
    } catch (error) {
      // Log error details and re-throw for handling upstream
      logger.error("Error in findOrCreateUser", {
        error: error.message,
        githubId: profile.id,
      });
      throw error;
    }
  }

  // Validate user session by checking expiration and status
  async validateSession(sessionId) {
    try {
      logger.debug("Validating session", { sessionId });

      // Validate the session by checking expiration time and user status
      // TODO: Implement actual session validation logic
      // Should check:
      // - Session existence in store
      // - Session expiration timestamp
      // - Associated user account status
      // - Any security flags or restrictions

      return true;
    } catch (error) {
      // Log validation error and return false to indicate invalid session
      logger.error("Error validating session", {
        error: error.message,
        sessionId,
      });
      return false;
    }
  }

  // Revoke user session and invalidate associated tokens
  async revokeSession(sessionId) {
    try {
      logger.info("Revoking session", { sessionId });

      // Remove session from store and invalidate any associated tokens
      // TODO: Implement actual session revocation logic
      // Should handle:
      // - Remove session from storage
      // - Invalidate any access/refresh tokens
      // - Clear related cache entries
      // - Log session termination

      return true;
    } catch (error) {
      // Log revocation error and re-throw for handling upstream
      logger.error("Error revoking session", {
        error: error.message,
        sessionId,
      });
      throw error;
    }
  }
}

// Export singleton instance of UserService
export default new UserService();
