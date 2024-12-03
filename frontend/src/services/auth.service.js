// File path: code_tutor2/frontend/src/services/auth.service.js

import logger from "./frontendLogger";

class AuthService {
  constructor() {
    // Initialize URLs from environment variables with strict validation
    const apiUrl = import.meta.env.VITE_API_URL;
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!apiUrl || !frontendUrl || !backendUrl) {
      const error = "Missing required environment variables";
      logger.error("AuthService", error, {
        apiUrl,
        frontendUrl,
        backendUrl,
      });
      throw new Error(error);
    }

    this.apiUrl = apiUrl;
    this.frontendUrl = frontendUrl;
    this.backendUrl = backendUrl;
  }

  initiateGithubAuth() {
    try {
      const authUrl = `${this.backendUrl}/api/auth/github`;

      logger.info("AuthService", "GitHub auth initiated", {
        authUrl,
        frontendUrl: this.frontendUrl,
        backendUrl: this.backendUrl,
      });

      window.location.href = authUrl;
    } catch (error) {
      logger.error("AuthService", "GitHub auth initiation failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  handleAuthError(error) {
    const errorTypes = {
      401: "Authentication failed",
      403: "Access denied",
      404: "Service not found",
      500: "Server error",
      default: "Authentication error occurred",
    };

    const status = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.error || errorTypes[status] || errorTypes.default;

    logger.error("AuthService", "Authentication error", {
      status,
      message: errorMessage,
      originalError: error.message,
      stack: error.stack,
    });

    return {
      error: errorMessage,
      status,
      timestamp: new Date().toISOString(),
      details: error.response?.data,
    };
  }

  getAuthEndpoints() {
    return {
      LOGIN: `${this.backendUrl}/api/auth/github`,
      CALLBACK: `${this.backendUrl}/api/auth/github/callback`,
      STATUS: `${this.apiUrl}/auth/status`,
      LOGOUT: `${this.apiUrl}/auth/logout`,
    };
  }

  async validateAuthState() {
    try {
      const response = await fetch(`${this.apiUrl}/auth/status`, {
        credentials: "include",
        headers: {},
      });

      if (!response.ok) {
        throw new Error(`Auth status check failed: ${response.status}`);
      }

      const data = await response.json();

      logger.debug("AuthService", "Auth state validated", {
        isAuthenticated: data.isAuthenticated,
        statusCode: response.status,
      });

      return data;
    } catch (error) {
      logger.error("AuthService", "Auth validation failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

export default new AuthService();
