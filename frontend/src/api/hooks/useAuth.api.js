// File path: frontend/src/api/hooks/useAuth.api.js

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import logger from "@/services/frontendLogger";

const AUTH_ENDPOINTS = {
  STATUS: "/auth/status",
  LOGOUT: "/auth/logout",
};

// Fetcher personnalisé avec gestion des erreurs
const fetcher = async (url) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Auth request failed");
    return response.json();
  } catch (error) {
    logger.error("Auth API", "Request failed", { error });
    throw error;
  }
};

// Hook pour le statut d'authentification
export const useAuthStatus = () => {
  return useSWR(AUTH_ENDPOINTS.STATUS, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    onError: (error) => {
      logger.error("Auth API", "Status check failed", { error });
    },
  });
};

// Hook pour la déconnexion
export const useAuthLogout = () => {
  return useSWRMutation(AUTH_ENDPOINTS.LOGOUT, async (url) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    } catch (error) {
      logger.error("Auth API", "Logout failed", { error });
      throw error;
    }
  });
};
