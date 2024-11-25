// File path: /code_tutor2/frontend/src/main.jsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import logger from "@/services/frontendLogger";
import "./index.css";

// Validate environment variables
const requiredEnvVars = ["VITE_API_URL", "VITE_GITHUB_CLIENT_ID"];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  const error = `Missing required environment variables: ${missingEnvVars.join(
    ", "
  )}`;
  logger.error("Startup", error);
  throw new Error(error);
}

// Initialize application
const initializeApp = async () => {
  try {
    logger.info("Startup", "Initializing application", {
      environment: import.meta.env.MODE,
      apiUrl: import.meta.env.VITE_API_URL,
      version: import.meta.env.VITE_APP_VERSION || "development",
    });

    const rootElement = document.getElementById("root");

    if (!rootElement) {
      throw new Error("Failed to find root element");
    }

    // Create React root and render app
    const root = createRoot(rootElement);

    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    logger.info("Startup", "Application mounted successfully");

    // Register service worker in production
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js");
        logger.info("Startup", "Service worker registered");
      } catch (error) {
        logger.error("Startup", "Service worker registration failed", error);
      }
    }
  } catch (error) {
    logger.error("Startup", "Application failed to initialize", {
      error: error.message,
      stack: error.stack,
    });

    // Display error UI
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; font-family: system-ui;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
              Erreur de démarrage
            </h1>
            <p style="color: #666;">
              L'application n'a pas pu démarrer. Veuillez réessayer plus tard.
            </p>
          </div>
        </div>
      `;
    }

    throw error;
  }
};

// Start the application
initializeApp();
