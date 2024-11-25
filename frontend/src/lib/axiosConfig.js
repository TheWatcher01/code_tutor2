// File path: code_tutor2/frontend/src/lib/axiosConfig.js

import axios from "axios";
import logger from "../services/frontendLogger";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    logger.debug("[Axios] Request", {
      method: config.method?.toUpperCase(),
      url: config.url,
      withCredentials: config.withCredentials,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    logger.error("[Axios] Request Error", {
      error: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    logger.debug("[Axios] Response", {
      status: response.status,
      headers: response.headers,
      cookies: document.cookie
    });
    return response;
  },
  (error) => {
    logger.error("[Axios] Response Error", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      cookies: document.cookie
    });

    if (error.response?.status === 401) {
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
