// File path: frontend/src/api/hooks/useAuth.api.js

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import logger from "@/services/frontendLogger";

const AUTH_ENDPOINTS = {
  STATUS: "/auth/status",
  LOGOUT: "/auth/logout",
};

const fetcher = async (url) => {
  try {
    logger.debug("Auth API", "Making auth request", { url });

    const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Auth request failed with status: ${response.status}`);
    }

    const data = await response.json();

    logger.debug("Auth API", "Auth request successful", {
      url,
      status: response.status,
      isAuthenticated: data.isAuthenticated,
      hasUser: !!data.user,
    });

    return data;
  } catch (error) {
    logger.error("Auth API", "Request failed", {
      url,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const useAuthStatus = () => {
  return useSWR(AUTH_ENDPOINTS.STATUS, fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    dedupingInterval: 1000,
    onSuccess: (data) => {
      logger.info("Auth API", "Status check successful", {
        isAuthenticated: data.isAuthenticated,
        userId: data.user?.id,
      });
    },
    onError: (error) => {
      logger.error("Auth API", "Status check failed", {
        error: error.message,
        stack: error.stack,
      });
    },
  });
};

export const useAuthLogout = () => {
  return useSWRMutation(AUTH_ENDPOINTS.LOGOUT, async (url) => {
    try {
      logger.debug("Auth API", "Initiating logout");

      const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status: ${response.status}`);
      }

      const data = await response.json();

      logger.info("Auth API", "Logout successful");

      return data;
    } catch (error) {
      logger.error("Auth API", "Logout failed", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  });
};
