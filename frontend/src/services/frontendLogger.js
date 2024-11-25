// /src/services/frontendLogger.js

const LOG_LEVELS = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

class FrontendLogger {
  constructor() {
    this.debugMode = import.meta.env.MODE === "development";
  }

  _formatMessage(level, context, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, context, message, data };

    if (this.debugMode) {
      const formattedMessage = `[${timestamp}] [${level}] [${context}] ${message}`;
      console.groupCollapsed(formattedMessage);
      if (data) console.log("Data:", data);
      console.trace("Stack trace");
      console.groupEnd();
    }

    this._persistLog(logEntry);
    return logEntry;
  }

  debug(context, message, data = null) {
    if (this.debugMode) {
      return this._formatMessage(LOG_LEVELS.DEBUG, context, message, data);
    }
  }

  info(context, message, data = null) {
    return this._formatMessage(LOG_LEVELS.INFO, context, message, data);
  }

  warn(context, message, data = null) {
    return this._formatMessage(LOG_LEVELS.WARN, context, message, data);
  }

  error(context, message, error = null) {
    const errorData = error
      ? {
          message: error.message,
          stack: error.stack,
        }
      : null;
    return this._formatMessage(LOG_LEVELS.ERROR, context, message, errorData);
  }

  _persistLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem("app_logs") || "[]");
      logs.push(logEntry);
      localStorage.setItem("app_logs", JSON.stringify(logs.slice(-1000)));
    } catch (error) {
      console.error("Error persisting log:", error);
    }
  }

  getLogs() {
    return JSON.parse(localStorage.getItem("app_logs") || "[]");
  }

  clearLogs() {
    localStorage.removeItem("app_logs");
  }
}

export default new FrontendLogger();
