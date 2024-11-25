// File path: code_tutor2/frontend/src/services/auth.service.js

import api from "../lib/axiosConfig";
import logger from "./frontendLogger";

class AuthService {
  constructor() {
    // Store base URL for GitHub auth
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  }

  async checkAuthStatus() {
    try {
      const response = await api.get("/auth/status");
      logger.info("AuthService", "Auth status check", {
        isAuthenticated: response.data.isAuthenticated,
      });
      return response.data;
    } catch (error) {
      logger.error("AuthService", "Auth status check failed", error);
      return { isAuthenticated: false };
    }
  }

  async logout() {
    try {
      await api.post("/auth/logout");
      logger.info("AuthService", "Logout successful");
      return true;
    } catch (error) {
      logger.error("AuthService", "Logout failed", error);
      throw error;
    }
  }

  initiateGithubAuth() {
    try {
      // Redirect to backend GitHub auth endpoint
      window.location.replace(`${this.baseUrl}/auth/github`);
      logger.info("AuthService", "GitHub auth initiated");
    } catch (error) {
      logger.error("AuthService", "GitHub auth failed", error);
      throw error;
    }
  }

  handleAuthError(error) {
    const defaultError = "Authentication error occurred";
    logger.error("AuthService", defaultError, error);

    return {
      error: error.response?.data?.error || defaultError,
      status: error.response?.status || 500,
    };
  }
}

export default new AuthService();
