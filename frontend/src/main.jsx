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

// Signal handlers for graceful shutdown
const handleShutdown = async (signal) => {
  try {
    logger.info("Shutdown", `Received ${signal} signal, starting cleanup...`);

    // Cleanup tasks
    // 1. Cancel any pending network requests
    if (window.navigator.serviceWorker) {
      const registration =
        await window.navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        logger.info("Shutdown", "Service worker unregistered");
      }
    }

    // 2. Close any open WebSocket connections
    if (window.WebSocket) {
      const sockets = Array.from(document.querySelectorAll("*"))
        .filter((el) => el._socket instanceof WebSocket)
        .map((el) => el._socket);

      sockets.forEach((socket) => {
        socket.close(1000, "Application shutting down");
        logger.info("Shutdown", "WebSocket connection closed");
      });
    }

    // 3. Clear any application storage if needed
    try {
      localStorage.removeItem("app_logs");
      sessionStorage.clear();
      logger.info("Shutdown", "Storage cleared");
    } catch (error) {
      logger.warn("Shutdown", "Error clearing storage", { error });
    }

    // 4. Log final shutdown message
    logger.info("Shutdown", "Cleanup completed successfully");

    // 5. Allow time for final logs to be written
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch (error) {
    logger.error("Shutdown", "Error during cleanup", { error });
  }
};

// Register global shutdown handlers
if (import.meta.env.DEV) {
  // Handle beforeunload event
  window.addEventListener("beforeunload", () => handleShutdown("BEFOREUNLOAD"));

  // Handle Vite HMR and shutdown events
  if (import.meta.hot) {
    import.meta.hot.on("vite:beforeUpdate", () => handleShutdown("HMR_UPDATE"));
    import.meta.hot.on("vite:beforeFullReload", () =>
      handleShutdown("HMR_RELOAD")
    );
    import.meta.hot.on("vite:beforeClose", async () => {
      await handleShutdown("VITE_CLOSE");
    });
  }
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
