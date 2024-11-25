// File path : code_tutor2/backend/src/services/backendLogger.js

import winston from "winston";
import path from "path";

class BackendLogger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.LOG_LEVELS = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
      trace: 5,
    };
    this.logger = this.createLogger();
  }

  createLogger() {
    const logDir = path.join(process.cwd(), "logs");

    // Ensure logs directory exists
    require("fs").mkdirSync(logDir, { recursive: true });

    return winston.createLogger({
      level: this.isDevelopment ? "trace" : "info",
      levels: this.LOG_LEVELS,
      format: this.getLogFormat(),
      transports: this.getTransports(logDir),
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, "exceptions.log"),
          maxsize: 5242880, // 5MB
          maxFiles: 2,
          format: this.getLogFormat(),
        }),
      ],
    });
  }

  getLogFormat() {
    return winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      winston.format.metadata({
        fillExcept: ["timestamp", "level", "message"],
      }),
      winston.format.printf(this.formatLogMessage.bind(this))
    );
  }

  formatLogMessage({ timestamp, level, message, metadata = {}, stack }) {
    let log = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (Object.keys(metadata).length > 0 && metadata.constructor === Object) {
      try {
        log += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
      } catch (error) {
        log += `\nMetadata: [Error serializing metadata: ${error.message}]`;
      }
    }

    if (this.isDevelopment && stack) {
      log += `\nStack: ${stack}`;
    }

    return log;
  }

  getTransports(logDir) {
    const transports = [
      // Error log
      new winston.transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error",
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: this.getLogFormat(),
      }),
      // Combined log
      new winston.transports.File({
        filename: path.join(logDir, "combined.log"),
        maxsize: 5242880,
        maxFiles: 5,
        format: this.getLogFormat(),
      }),
    ];

    // Console transport in development
    if (this.isDevelopment) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              let line = `[${timestamp}] [${level}]: ${message}`;
              if (Object.keys(meta).length > 0) {
                line += ` ${JSON.stringify(meta)}`;
              }
              return line;
            })
          ),
        })
      );
    }

    return transports;
  }

  // Request logging middleware
  requestLogger(req, res, next) {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    this.logger.http(`Incoming request [${requestId}]`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?.id,
    });

    res.on("finish", () => {
      const duration = Date.now() - start;
      const message = `Request completed [${requestId}]`;
      const meta = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
      };

      if (res.statusCode >= 400) {
        this.logger.error(message, meta);
      } else {
        this.logger.info(message, meta);
      }
    });

    next();
  }

  // Main logging methods with context support
  error(context, message, meta = {}) {
    this.logger.error(`[${context}] ${message}`, meta);
  }

  warn(context, message, meta = {}) {
    this.logger.warn(`[${context}] ${message}`, meta);
  }

  info(context, message, meta = {}) {
    this.logger.info(`[${context}] ${message}`, meta);
  }

  debug(context, message, meta = {}) {
    this.logger.debug(`[${context}] ${message}`, meta);
  }

  http(context, message, meta = {}) {
    this.logger.http(`[${context}] ${message}`, meta);
  }

  trace(context, message, meta = {}) {
    if (this.isDevelopment) {
      this.logger.log("trace", `[${context}] ${message}`, meta);
    }
  }
}

// Add custom colors for log levels
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
  trace: "gray",
});

export default new BackendLogger();
