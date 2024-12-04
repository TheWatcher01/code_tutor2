// File path: frontend/src/api/hooks/useAuth.api.js

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import logger from "@/services/frontendLogger";

// Defining endpoints for authentication API
const AUTH_ENDPOINTS = {
  STATUS: "/auth/status",
  LOGOUT: "/auth/logout",
};

// Custom fetcher function for handling authentication API requests
const fetcher = async (url) => {
  try {
    // Logging the authentication request
    logger.debug("Auth API", "Making auth request", { url });

    // Constructing the request with necessary headers and credentials
    const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    });

    // Checking if the request was successful
    if (!response.ok) {
      throw new Error(`Auth request failed with status: ${response.status}`);
    }

    // Parsing the response data
    const data = await response.json();

    // Logging the successful authentication request
    logger.debug("Auth API", "Auth request successful", {
      url,
      status: response.status,
      isAuthenticated: data.isAuthenticated,
      hasUser: !!data.user,
    });

    // Returning the parsed data
    return data;
  } catch (error) {
    // Logging the error if the request fails
    logger.error("Auth API", "Request failed", {
      url,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Hook to use for checking authentication status
export const useAuthStatus = () => {
  return useSWR(AUTH_ENDPOINTS.STATUS, fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    dedupingInterval: 1000,
    onSuccess: (data) => {
      // Logging the successful status check
      logger.info("Auth API", "Status check successful", {
        isAuthenticated: data.isAuthenticated,
        userId: data.user?.id,
      });
    },
    onError: (error) => {
      // Logging the error if the status check fails
      logger.error("Auth API", "Status check failed", {
        error: error.message,
        stack: error.stack,
      });
    },
  });
};

// Hook to use for initiating logout
export const useAuthLogout = () => {
  return useSWRMutation(AUTH_ENDPOINTS.LOGOUT, async (url) => {
    try {
      // Logging the logout initiation
      logger.debug("Auth API", "Initiating logout");

      // Constructing the logout request
      const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      // Checking if the logout request was successful
      if (!response.ok) {
        throw new Error(`Logout failed with status: ${response.status}`);
      }

      // Parsing the logout response data
      const data = await response.json();

      // Logging the successful logout
      logger.info("Auth API", "Logout successful");

      // Returning the parsed data
      return data;
    } catch (error) {
      // Logging the error if the logout fails
      logger.error("Auth API", "Logout failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  });
};
