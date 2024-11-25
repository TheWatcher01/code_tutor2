// File path: code_tutor2/frontend/src/lib/axiosConfig.js

import axios from "axios";
import logger from "../services/frontendLogger";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    logger.debug("API Request", {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
    });
    return config;
  },
  (error) => {
    logger.error("API Request Error", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    logger.debug("API Response", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    logger.error("API Response Error", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      error: error.message,
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      logger.warn("Authentication required", { path: error.config?.url });
      // You might want to redirect to login or refresh token here
    }

    if (error.response?.status === 403) {
      logger.warn("Forbidden access", { path: error.config?.url });
    }

    if (!error.response) {
      logger.error("Network/Server error", { error: error.message });
    }

    return Promise.reject(error);
  }
);

export default api;
