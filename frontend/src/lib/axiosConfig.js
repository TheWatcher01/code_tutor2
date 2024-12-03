// File path: code_tutor2/frontend/src/lib/axiosConfig.js

import axios from "axios";
import logger from "../services/frontendLogger";

// Configuration constants
const CONFIG = {
  baseURL: import.meta.env.VITE_API_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 10000,
  retries: 2,
  retryDelay: 1000,
  maxRedirects: 5,
};

// Create axios instance with enhanced config
const api = axios.create({
  baseURL: CONFIG.baseURL,
  timeout: CONFIG.timeout,
  withCredentials: true,
  maxRedirects: CONFIG.maxRedirects,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  // Cookie configuration
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Request timing tracking
const requestTiming = new Map();

// Request interceptor with enhanced error handling and retry logic
api.interceptors.request.use(
  (config) => {
    // Track request start time
    requestTiming.set(config.url, {
      startTime: Date.now(),
      retryCount: 0,
    });

    // Add security headers in production
    if (process.env.NODE_ENV === "production") {
      config.headers["Strict-Transport-Security"] =
        "max-age=31536000; includeSubDomains";
      config.headers["X-Content-Type-Options"] = "nosniff";
      config.headers["X-Frame-Options"] = "SAMEORIGIN";
    }

    // Log request details
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

// Response interceptor with timing tracking and retry logic
api.interceptors.response.use(
  (response) => {
    const timing = requestTiming.get(response.config.url);
    const duration = timing ? Date.now() - timing.startTime : null;
    requestTiming.delete(response.config.url);

    logger.debug("[Axios] Response Received", {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      duration: `${duration}ms`,
      headers: response.headers,
      data: response.data,
    });

    return response;
  },
  async (error) => {
    const config = error.config;
    const timing = requestTiming.get(config?.url);

    // Enhanced error logging
    logger.error("[Axios] Response Error", {
      message: error.message,
      url: config?.url,
      method: config?.method?.toUpperCase(),
      status: error.response?.status,
      duration: timing ? `${Date.now() - timing.startTime}ms` : null,
      retryCount: timing?.retryCount || 0,
    });

    // Retry logic for specific errors
    if (config && timing && timing.retryCount < CONFIG.retries) {
      const shouldRetry = [408, 429, 500, 502, 503, 504].includes(
        error.response?.status
      );

      if (shouldRetry) {
        timing.retryCount++;
        const delay = timing.retryCount * CONFIG.retryDelay;

        logger.warn("[Axios] Retrying request", {
          url: config.url,
          attempt: timing.retryCount,
          delay: `${delay}ms`,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    // Cleanup timing data
    requestTiming.delete(config?.url);

    // Handle specific error cases
    switch (error.response?.status) {
      case 401:
        logger.warn("[Axios] Unauthorized - Redirecting to login");
        // Use window.location.replace for cleaner navigation
        window.location.replace("/");
        break;

      case 403:
        logger.warn("[Axios] Forbidden - Access denied");
        break;

      case 429:
        logger.warn("[Axios] Rate limited - Too many requests");
        break;
    }

    return Promise.reject(error);
  }
);

// Cleanup timing data periodically
setInterval(() => {
  const now = Date.now();
  for (const [url, timing] of requestTiming.entries()) {
    if (now - timing.startTime > CONFIG.timeout * 2) {
      requestTiming.delete(url);
      logger.warn("[Axios] Cleaned up stale request timing", { url });
    }
  }
}, 60000);

export default api;
