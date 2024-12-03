// File path : code_tutor2/backend/src/services/backendLogger.js

import winston from "winston";
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";
import { v4 as uuidv4 } from "uuid";
import callsites from "callsites";

class BackendLogger {
  constructor() {
    // Environment variables with defaults
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.config = {
      logLevel:
        process.env.$LOG_LEVEL || (this.isDevelopment ? "trace" : "info"),
      logDir: process.env.$LOG_DIR || path.join(process.cwd(), "logs"),
      maxSize: process.env.$LOG_MAX_SIZE || "5m",
      maxFiles: process.env.$LOG_MAX_FILES || "5",
      appName: process.env.$APP_NAME || "code_tutor2",
      logRetention: process.env.$LOG_RETENTION || "14d",
      slowRequestThreshold: parseInt(
        process.env.$SLOW_REQUEST_THRESHOLD || "1000"
      ),
      metricsInterval: parseInt(process.env.$METRICS_INTERVAL || "300000"),
      memoryThreshold: parseInt(process.env.$MEMORY_THRESHOLD || "500"), // MB
      errorAlertThreshold: parseInt(process.env.$ERROR_ALERT_THRESHOLD || "10"),
      maxStackSize: parseInt(process.env.$MAX_STACK_SIZE || "50"),
      compressOldLogs: process.env.$COMPRESS_OLD_LOGS === "true",
      logFormat: process.env.$LOG_FORMAT || "json",
      includeTrace: process.env.$INCLUDE_TRACE === "true",
      alertWebhook: process.env.$ALERT_WEBHOOK,
    };

    this.LOG_LEVELS = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
      trace: 5,
      metrics: 6,
      performance: 7,
    };

    // Performance metrics with expanded tracking
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      slowRequests: 0,
      averageResponseTime: 0,
      lastErrors: [],
      memoryUsage: {
        history: [],
        peak: 0,
      },
      endpointStats: new Map(),
      userStats: new Map(),
    };

    this.logger = this.createLogger();
    this.startMetricsReporting();
    this.setupMemoryMonitoring();
  }

  // Gets calling file and function info
  getCallerInfo() {
    const sites = callsites();
    const caller = sites[2]; // Skip logger methods
    return {
      file: path.relative(process.cwd(), caller.getFileName() || "unknown"),
      function: caller.getFunctionName() || "anonymous",
      line: caller.getLineNumber(),
    };
  }

  setupMemoryMonitoring() {
    setInterval(() => {
      const used = process.memoryUsage();
      const memoryUsageMB = Math.round(used.heapUsed / 1024 / 1024);

      this.metrics.memoryUsage.history.push({
        timestamp: new Date(),
        usage: memoryUsageMB,
      });

      // Keep last 100 readings
      if (this.metrics.memoryUsage.history.length > 100) {
        this.metrics.memoryUsage.history.shift();
      }

      // Update peak memory
      if (memoryUsageMB > this.metrics.memoryUsage.peak) {
        this.metrics.memoryUsage.peak = memoryUsageMB;
      }

      // Alert on high memory usage
      if (memoryUsageMB > this.config.memoryThreshold) {
        this.warn("Memory", "High memory usage detected", {
          current: memoryUsageMB,
          threshold: this.config.memoryThreshold,
          peak: this.metrics.memoryUsage.peak,
        });
      }
    }, 60000); // Every minute
  }

  // Enhanced middleware for request logging
  requestLogger(req, res, next) {
    const start = Date.now();
    const correlationId = uuidv4();
    req.correlationId = correlationId;

    // Update request metrics
    this.metrics.requestCount++;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;

    if (!this.metrics.endpointStats.has(endpoint)) {
      this.metrics.endpointStats.set(endpoint, {
        count: 0,
        totalTime: 0,
        errors: 0,
        lastAccessed: null,
      });
    }

    const logContext = {
      correlationId,
      method: req.method,
      url: req.url,
      endpoint,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?.id,
      sessionId: req.sessionID,
      requestId: req.headers["x-request-id"],
      ...this.getCallerInfo(),
    };

    this.http("Request", "Incoming request", logContext);

    res.on("finish", () => {
      const duration = Date.now() - start;
      const endpointStats = this.metrics.endpointStats.get(endpoint);
      endpointStats.count++;
      endpointStats.totalTime += duration;
      endpointStats.lastAccessed = new Date();

      const responseContext = {
        ...logContext,
        status: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get("Content-Length"),
        responseTime: duration,
        averageEndpointTime: Math.round(
          endpointStats.totalTime / endpointStats.count
        ),
      };

      // Performance tracking
      if (duration > this.config.slowRequestThreshold) {
        this.metrics.slowRequests++;
        endpointStats.slowRequests = (endpointStats.slowRequests || 0) + 1;

        this.warn("Performance", `Slow request detected`, {
          ...responseContext,
          threshold: this.config.slowRequestThreshold,
          endpointStats: {
            totalRequests: endpointStats.count,
            averageTime: Math.round(
              endpointStats.totalTime / endpointStats.count
            ),
            slowRequests: endpointStats.slowRequests,
          },
        });
      }

      // Error tracking
      if (res.statusCode >= 400) {
        this.metrics.errorCount++;
        endpointStats.errors++;
        this.error("Request", `Request failed`, responseContext);

        // Alert on high error rate
        if (this.metrics.errorCount % this.config.errorAlertThreshold === 0) {
          this.alert("High error rate detected", {
            totalErrors: this.metrics.errorCount,
            recentErrors: this.metrics.lastErrors.slice(-5),
          });
        }
      } else {
        this.info("Request", `Request completed`, responseContext);
      }

      // User stats tracking
      if (req.user?.id) {
        if (!this.metrics.userStats.has(req.user.id)) {
          this.metrics.userStats.set(req.user.id, {
            requests: 0,
            lastAccess: null,
            errors: 0,
          });
        }
        const userStats = this.metrics.userStats.get(req.user.id);
        userStats.requests++;
        userStats.lastAccess = new Date();
        if (res.statusCode >= 400) userStats.errors++;
      }

      this.logMetrics(responseContext);
    });

    next();
  }

  // Alert system for critical issues
  alert(message, data) {
    this.error("Alert", message, data);

    if (this.config.alertWebhook) {
      // Send to external monitoring
      fetch(this.config.alertWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          data,
          timestamp: new Date(),
          environment: process.env.NODE_ENV,
        }),
      }).catch((err) =>
        this.error("Alert", "Failed to send alert", { error: err.message })
      );
    }
  }

  // Performance logging for specific operations
  performance(operation, duration, meta = {}) {
    this._logWithCorrelation(
      "performance",
      "Performance",
      `${operation} completed`,
      {
        ...meta,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      }
    );
  }

  createLogger() {
    require("fs").mkdirSync(this.config.logDir, { recursive: true });

    const rotateConfig = {
      dirname: this.config.logDir,
      datePattern: "YYYY-MM-DD",
      zippedArchive: this.config.compressOldLogs,
      maxSize: this.config.maxSize,
      maxFiles: this.config.maxFiles,
      format: this.getLogFormat(),
    };

    return winston.createLogger({
      level: this.config.logLevel,
      levels: this.LOG_LEVELS,
      format: this.getLogFormat(),
      defaultMeta: {
        service: this.config.appName,
        environment: process.env.NODE_ENV,
        version: process.env.$APP_VERSION,
      },
      transports: this.getTransports(rotateConfig),
      exceptionHandlers: [
        new DailyRotateFile({
          ...rotateConfig,
          filename: "exceptions-%DATE%.log",
        }),
      ],
    });
  }

  getLogFormat() {
    return winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
      }),
      winston.format.errors({ stack: true }),
      winston.format.metadata({
        fillExcept: ["timestamp", "level", "message", "correlationId"],
      }),
      this.config.logFormat === "json" ? winston.format.json() : winston.format.simple()
    );
  }

  getTransports(rotateConfig) {
    const transports = [
      // Error logs
      new DailyRotateFile({
        ...rotateConfig,
        filename: "error-%DATE%.log",
        level: "error",
      }),
      // Combined logs
      new DailyRotateFile({
        ...rotateConfig,
        filename: "combined-%DATE%.log",
      }),
      // Metrics logs
      new DailyRotateFile({
        ...rotateConfig,
        filename: "metrics-%DATE%.log",
        level: "metrics",
      }),
      // Performance logs
      new DailyRotateFile({
        ...rotateConfig,
        filename: "performance-%DATE%.log",
        level: "performance",
      }),
    ];

    if (this.isDevelopment) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(this.formatConsoleOutput.bind(this))
          ),
        })
      );
    }

    return transports;
  }

  formatConsoleOutput({ level, message, timestamp, correlationId, metadata, caller, ...meta }) {
    let output = `[${timestamp}] [${level}]`;
    if (correlationId) {
      output += ` [${correlationId}]`;
    }
    
    if (metadata?.file && metadata?.function) {
      output += ` [${metadata.file}:${metadata.function}:${metadata.line}]`;
    }
    
    output += `: ${message}`;

    if (Object.keys(meta).length > 0 || (metadata && Object.keys(metadata).length > 0)) {
      const contextData = { ...meta, ...metadata };
      delete contextData.file;
      delete contextData.function;
      delete contextData.line;
      if (Object.keys(contextData).length > 0) {
        output += `\nContext: ${JSON.stringify(contextData, null, 2)}`;
      }
    }

    return output;
  }

  startMetricsReporting() {
    setInterval(() => {
      this.reportMetrics();
      this.cleanupOldMetrics();
    }, this.config.metricsInterval);
  }

  cleanupOldMetrics() {
    const now = Date.now();
    const retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Clean old endpoint stats
    for (const [endpoint, stats] of this.metrics.endpointStats.entries()) {
      if (stats.lastAccessed && (now - stats.lastAccessed.getTime()) > retentionPeriod) {
        this.metrics.endpointStats.delete(endpoint);
      }
    }

    // Clean old user stats
    for (const [userId, stats] of this.metrics.userStats.entries()) {
      if (stats.lastAccess && (now - stats.lastAccess.getTime()) > retentionPeriod) {
        this.metrics.userStats.delete(userId);
      }
    }

    // Trim error history
    if (this.metrics.lastErrors.length > this.config.maxStackSize) {
      this.metrics.lastErrors = this.metrics.lastErrors.slice(-this.config.maxStackSize);
    }
  }

  reportMetrics() {
    const currentMetrics = {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      endpointStats: Object.fromEntries(this.metrics.endpointStats),
      userStats: Object.fromEntries(this.metrics.userStats),
    };

    this.logger.log("metrics", "System metrics", currentMetrics);

    // Reset counters after reporting
    this.metrics.requestCount = 0;
    this.metrics.errorCount = 0;
    this.metrics.slowRequests = 0;
    this.metrics.averageResponseTime = 0;
  }

  logMetrics(context = {}) {
    const callerInfo = this.getCallerInfo();
    this.logger.log("metrics", "Request metrics", {
      ...context,
      currentMetrics: this.metrics,
      caller: callerInfo,
    });
  }

  error(context, message, meta = {}) {
    const callerInfo = this.getCallerInfo();
    this._logWithCorrelation("error", context, message, { ...meta, caller: callerInfo });
    
    // Track error for metrics
    if (this.metrics.lastErrors.length >= this.config.maxStackSize) {
      this.metrics.lastErrors.shift();
    }
    this.metrics.lastErrors.push({
      timestamp: new Date(),
      context,
      message,
      ...meta,
      caller: callerInfo,
    });
  }

  warn(context, message, meta = {}) {
    this._logWithCorrelation("warn", context, message, { ...meta, caller: this.getCallerInfo() });
  }

  info(context, message, meta = {}) {
    this._logWithCorrelation("info", context, message, { ...meta, caller: this.getCallerInfo() });
  }

  debug(context, message, meta = {}) {
    this._logWithCorrelation("debug", context, message, { ...meta, caller: this.getCallerInfo() });
  }

  http(context, message, meta = {}) {
    this._logWithCorrelation("http", context, message, { ...meta, caller: this.getCallerInfo() });
  }

  trace(context, message, meta = {}) {
    if (this.isDevelopment || this.config.includeTrace) {
      this._logWithCorrelation("trace", context, message, { ...meta, caller: this.getCallerInfo() });
    }
  }

  _logWithCorrelation(level, context, message, meta = {}) {
    const correlationId = meta.correlationId || uuidv4();
    const timestamp = new Date().toISOString();
    const callerInfo = meta.caller || this.getCallerInfo();

    this.logger.log(level, `[${context}] ${message}`, {
      ...meta,
      correlationId,
      timestamp,
      caller: callerInfo,
    });
  }
}

// Custom colors with additional levels
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
  trace: "gray",
  metrics: "cyan",
  performance: "white",
});

// Export a single instance
export default new BackendLogger();
