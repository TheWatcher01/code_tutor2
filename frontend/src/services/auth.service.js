// File path: code_tutor2/frontend/src/services/auth.service.js

import api from "../lib/axiosConfig";
import logger from "./frontendLogger";

class AuthService {
  async checkAuthStatus() {
    try {
      logger.debug("AuthService", "Checking authentication status");
      const response = await api.get("/auth/status");
      logger.info("AuthService", "Auth status retrieved", {
        isAuthenticated: response.data.isAuthenticated,
      });
      return response.data;
    } catch (error) {
      logger.error("AuthService", "Failed to check auth status", error);
      throw error;
    }
  }

  async logout() {
    try {
      logger.info("AuthService", "Initiating logout");
      const response = await api.post("/auth/logout");
      logger.info("AuthService", "Logout successful");
      return response.data;
    } catch (error) {
      logger.error("AuthService", "Logout failed", error);
      throw error;
    }
  }

  // Initiate GitHub OAuth flow
  initiateGithubAuth() {
    try {
      logger.info("AuthService", "Initiating GitHub authentication");
      // Store current path for redirect after auth
      sessionStorage.setItem("redirectPath", window.location.pathname);
      // Redirect to GitHub auth endpoint
      window.location.href = `${api.defaults.baseURL}/auth/github`;
    } catch (error) {
      logger.error("AuthService", "Failed to initiate GitHub auth", error);
      throw error;
    }
  }

  // Handle authentication error
  handleAuthError(error) {
    logger.error("AuthService", "Authentication error", error);

    if (error.response?.status === 401) {
      return {
        error: "Authentication required. Please log in.",
        status: 401,
      };
    }

    if (error.response?.status === 403) {
      return {
        error: "Access denied. Insufficient permissions.",
        status: 403,
      };
    }

    return {
      error: "An unexpected error occurred. Please try again later.",
      status: error.response?.status || 500,
    };
  }

  // Get redirect path after authentication
  getRedirectPath() {
    const path = sessionStorage.getItem("redirectPath");
    sessionStorage.removeItem("redirectPath"); // Clean up
    return path || "/playground"; // Default to playground if no path stored
  }

  // Check if current path is public
  isPublicPath(path) {
    const publicPaths = ["/", "/login", "/auth/callback"];
    return publicPaths.includes(path);
  }
}

export default new AuthService();
