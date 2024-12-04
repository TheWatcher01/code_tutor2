// File path: code_tutor2/frontend/src/services/auth.service.js

import logger from "./frontendLogger";

class AuthService {
  constructor() {
    // Initialize API, frontend, and backend URLs from environment variables with strict validation to ensure all necessary URLs are provided.
    const apiUrl = import.meta.env.VITE_API_URL;
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Check for the presence of required environment variables and log an error if any are missing.
    if (!apiUrl || !frontendUrl || !backendUrl) {
      const error = "Missing required environment variables";
      logger.error("AuthService", error, {
        apiUrl,
        frontendUrl,
        backendUrl,
      });
      throw new Error(error);
    }

    // Assign validated URLs to instance properties for later use.
    this.apiUrl = apiUrl;
    this.frontendUrl = frontendUrl;
    this.backendUrl = backendUrl;
  }

  // Initiates the GitHub authentication process by redirecting the user to the GitHub auth URL.
  initiateGithubAuth() {
    try {
      const authUrl = `${this.backendUrl}/api/auth/github`;

      // Log the initiation of GitHub authentication along with relevant URLs.
      logger.info("AuthService", "GitHub auth initiated", {
        authUrl,
        frontendUrl: this.frontendUrl,
        backendUrl: this.backendUrl,
      });

      // Redirect the user to the GitHub authentication page.
      window.location.href = authUrl;
    } catch (error) {
      // Log any errors that occur during the initiation of GitHub authentication.
      logger.error("AuthService", "GitHub auth initiation failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  // Handles authentication errors by categorizing them based on status codes and logging detailed error information.
  handleAuthError(error) {
    const errorTypes = {
      401: "Authentication failed",
      403: "Access denied",
      404: "Service not found",
      500: "Server error",
      default: "Authentication error occurred",
    };

    // Determine the status code from the error response or default to 500.
    const status = error.response?.status || 500;
    // Extract the error message from the response or use a default message based on the status code.
    const errorMessage =
      error.response?.data?.error || errorTypes[status] || errorTypes.default;

    // Log the authentication error with detailed information for debugging.
    logger.error("AuthService", "Authentication error", {
      status,
      message: errorMessage,
      originalError: error.message,
      stack: error.stack,
    });

    // Return a structured error object containing relevant details.
    return {
      error: errorMessage,
      status,
      timestamp: new Date().toISOString(),
      details: error.response?.data,
    };
  }

  // Returns the endpoints for authentication-related actions.
  getAuthEndpoints() {
    return {
      LOGIN: `${this.backendUrl}/api/auth/github`,
      CALLBACK: `${this.backendUrl}/api/auth/github/callback`,
      STATUS: `${this.apiUrl}/auth/status`,
      LOGOUT: `${this.apiUrl}/auth/logout`,
    };
  }

  // Validates the current authentication state by checking the user's authentication status.
  async validateAuthState() {
    try {
      // Fetch the authentication status from the API.
      const response = await fetch(`${this.apiUrl}/auth/status`, {
        credentials: "include",
        headers: {},
      });

      // Throw an error if the response is not OK (status code not in the range 200-299).
      if (!response.ok) {
        throw new Error(`Auth status check failed: ${response.status}`);
      }

      // Parse the response data to check the authentication state.
      const data = await response.json();

      // Log the validated authentication state for debugging purposes.
      logger.debug("AuthService", "Auth state validated", {
        isAuthenticated: data.isAuthenticated,
        statusCode: response.status,
      });

      // Return the parsed authentication state data.
      return data;
    } catch (error) {
      // Log any errors that occur during the authentication state validation process.
      logger.error("AuthService", "Auth validation failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

// Export a singleton instance of AuthService for use throughout the application.
export default new AuthService();
