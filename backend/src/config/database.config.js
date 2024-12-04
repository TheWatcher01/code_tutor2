// File path: code_tutor2/backend/src/config/database.config.js

import mongoose from "mongoose";
import logger from "../services/backendLogger.js";

import "../models/User.model.js";
import "../models/Course.model.js";

// MongoDB connection options
const MONGO_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  writeConcern: { w: "majority" },
  autoIndex: process.env.NODE_ENV === "development",
};

// Function to verify a collection in the database
async function verifyCollection(db, collectionName) {
  try {
    await db.createCollection(collectionName);
    logger.info("Database", `Verified collection: ${collectionName}`);
  } catch (error) {
    if (!error.message.includes("Collection already exists")) {
      logger.error("Database", `Error verifying collection ${collectionName}`, {
        error: error.message,
      });
      throw error;
    }
    logger.debug("Database", `Collection ${collectionName} already exists`);
  }
}

// Function to reset a development collection in the database
async function resetDevCollection(db, collectionName) {
  if (
    process.env.NODE_ENV !== "development" ||
    !process.env.DB_RESET_ON_STARTUP
  ) {
    logger.warn(
      "Database",
      "Reset attempted in non-development mode or DB_RESET_ON_STARTUP not set"
    );
    return;
  }

  try {
    await db.collection(collectionName).drop();
    logger.info(
      "Database",
      `Dropped development collection: ${collectionName}`
    );
    await db.createCollection(collectionName);
    logger.info(
      "Database",
      `Recreated development collection: ${collectionName}`
    );
  } catch (error) {
    if (!error.message.includes("ns not found")) {
      logger.error(
        "Database",
        `Error resetting development collection ${collectionName}`,
        {
          error: error.message,
        }
      );
      throw error;
    }
  }
}

// Function to handle the initialization of the database
async function handleDatabaseInit(connection) {
  const isDev = process.env.NODE_ENV === "development";
  const shouldReset = isDev && process.env.DB_RESET_ON_STARTUP === "true";
  const collections = ["users", "courses", "sessions"];

  for (const collectionName of collections) {
    if (shouldReset) {
      await resetDevCollection(connection.connection.db, collectionName);
    } else {
      await verifyCollection(connection.connection.db, collectionName);
    }
  }

  logger.info("Database", "Verifying indexes");
  for (const [modelName, model] of Object.entries(connection.models)) {
    try {
      await model.createIndexes();
      logger.info("Database", `Verified indexes for ${modelName}`);
    } catch (error) {
      logger.error("Database", `Failed to verify indexes for ${modelName}`, {
        error: error.message,
      });
      throw error;
    }
  }
}

// Function to initialize the database
async function initializeDatabase() {
  let connection = null;

  try {
    logger.info("Database", "Starting database initialization", {
      environment: process.env.NODE_ENV,
      resetEnabled: process.env.DB_RESET_ON_STARTUP === "true",
    });

    mongoose.set("strictQuery", true);

    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    connection = await mongoose.connect(mongoURI, MONGO_OPTIONS);
    logger.info("Database", "Connected to MongoDB");

    connection.connection.on("error", (error) => {
      logger.error("Database", "Connection error", { error: error.message });
    });

    connection.connection.on("disconnected", () => {
      logger.warn("Database", "Disconnected from MongoDB");
    });

    connection.connection.on("reconnected", () => {
      logger.info("Database", "Reconnected to MongoDB");
    });

    await handleDatabaseInit(connection);

    logger.info("Database", "Initialization completed", {
      database: connection.connection.name,
      host: connection.connection.host,
      port: connection.connection.port,
      environment: process.env.NODE_ENV,
      collections: Object.keys(connection.connection.collections),
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

// Function to handle cleanup on process signals
async function cleanup(signal) {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.info("Database", `Starting cleanup (${signal})`);
      await mongoose.connection.close();
      logger.info("Database", `Connection closed (${signal})`);
    }
  } catch (error) {
    logger.error("Database", `Cleanup error (${signal})`, {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Handle cleanup on process signals
process.on("SIGINT", () => cleanup("SIGINT").then(() => process.exit(0)));
process.on("SIGTERM", () => cleanup("SIGTERM").then(() => process.exit(0)));

export default initializeDatabase;
