// File path: code_tutor2/backend/src/config/database.config.js

import mongoose from "mongoose";
import logger from "../services/backendLogger.js";

// Import models
import "../models/User.model.js";
import "../models/Course.model.js";

const MONGO_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  writeConcern: { w: "majority" },
  autoIndex: false, // Désactive la création automatique des index
};

/**
 * Supprime et recrée une collection
 */
async function resetCollection(db, collectionName) {
  try {
    await db.collection(collectionName).drop();
    logger.info("Database", `Dropped collection: ${collectionName}`);
  } catch (error) {
    if (!error.message.includes("ns not found")) {
      throw error;
    }
  }

  try {
    await db.createCollection(collectionName);
    logger.info("Database", `Created collection: ${collectionName}`);
  } catch (error) {
    if (!error.message.includes("Collection already exists")) {
      throw error;
    }
  }
}

/**
 * Initialise les collections et les index
 */
async function initializeDatabase() {
  let connection = null;

  try {
    logger.info("Database", "Starting database initialization");

    // Configuration mongoose
    mongoose.set("strictQuery", true);

    // Vérification de l'URI
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    // Connexion à MongoDB
    connection = await mongoose.connect(mongoURI, MONGO_OPTIONS);
    logger.info("Database", "Connected to MongoDB");

    // Setup des handlers de connexion
    connection.connection.on("error", (error) => {
      logger.error("Database", "Connection error", { error: error.message });
    });

    connection.connection.on("disconnected", () => {
      logger.warn("Database", "Disconnected from MongoDB");
    });

    connection.connection.on("reconnected", () => {
      logger.info("Database", "Reconnected to MongoDB");
    });

    // Reset des collections
    const collections = ["users", "courses"];
    for (const collectionName of collections) {
      await resetCollection(connection.connection.db, collectionName);
    }

    // Création des nouveaux index
    logger.info("Database", "Creating indexes");
    for (const [modelName, model] of Object.entries(connection.models)) {
      try {
        logger.debug("Database", `Creating indexes for ${modelName}`);
        await model.createIndexes();
        logger.info("Database", `Created indexes for ${modelName}`);
      } catch (error) {
        logger.error("Database", `Failed to create indexes for ${modelName}`, {
          error: error.message,
        });
        throw error;
      }
    }

    // Vérification finale
    logger.info("Database", "Initialization completed", {
      database: connection.connection.name,
      host: connection.connection.host,
      port: connection.connection.port,
    });

    return connection;
  } catch (error) {
    logger.error("Database", "Initialization failed", {
      error: error.message,
      stack: error.stack,
      uri: process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"),
    });

    if (connection) {
      try {
        await connection.connection.close();
        logger.info("Database", "Connection closed after error");
      } catch (closeError) {
        logger.error("Database", "Error closing connection", {
          error: closeError.message,
        });
      }
    }

    throw error;
  }
}

// Gestionnaire de nettoyage
async function cleanup(signal) {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info("Database", `Connection closed (${signal})`);
    }
  } catch (error) {
    logger.error("Database", `Cleanup error (${signal})`, {
      error: error.message,
    });
    throw error;
  }
}

// Setup des handlers de processus
process.on("SIGINT", () => cleanup("SIGINT").then(() => process.exit(0)));
process.on("SIGTERM", () => cleanup("SIGTERM").then(() => process.exit(0)));

export default initializeDatabase;
