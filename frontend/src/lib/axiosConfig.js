// File path: code_tutor2/frontend/src/lib/axiosConfig.js

import axios from "axios";
import logger from "../services/frontendLogger";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
});

// Log for request configuration
api.interceptors.request.use(
  (config) => {
    logger.debug("[Axios] Request Initiated", {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data,
      withCredentials: config.withCredentials,
      headers: config.headers,
      baseURL: config.baseURL,
      timeout: config.timeout,
    });
    return config;
  },
  (error) => {
    logger.error("[Axios] Request Error", {
      message: error.message,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

// Log for response data
api.interceptors.response.use(
  (response) => {
    logger.debug("[Axios] Response Received", {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      headers: response.headers,
      data: response.data,
      cookies: document.cookie,
    });
    return response;
  },
  (error) => {
    // Log error details
    logger.error("[Axios] Response Error", {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      cookies: document.cookie,
    });

    // Redirect logic for unauthorized errors
    if (error.response?.status === 401) {
      logger.warn("[Axios] Unauthorized - Redirecting to Home");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
