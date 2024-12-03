// File path: code_tutor2/frontend/src/services/auth.service.js

import logger from "./frontendLogger";

class AuthService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  }

  initiateGithubAuth() {
    try {
      const authUrl = `${this.baseUrl}/auth/github`;
      window.location.replace(authUrl);
      logger.info("AuthService", "GitHub auth initiated", { authUrl });
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
      timestamp: new Date().toISOString(),
    };
  }

  // Utilitaire pour générer les URLs d'API auth
  getAuthEndpoints() {
    return {
      LOGIN: `${this.baseUrl}/auth/github`,
      CALLBACK: `${this.baseUrl}/auth/github/callback`,
      STATUS: `${this.baseUrl}/auth/status`,
      LOGOUT: `${this.baseUrl}/auth/logout`,
    };
  }
}

export default new AuthService();
