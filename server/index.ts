import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';

// Enterprise Middleware - Fortune 20 Standards
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/enterprise-error-handler';
import { 
  securityHeaders, 
  requestIdMiddleware, 
  sanitizeInput,
  corsOptions,
  validateSecurityHeaders 
} from './middleware/enterprise-security';
import { 
  performanceMiddleware,
  HealthCheckService,
  PerformanceMonitor,
  AnalyticsTracker 
} from './middleware/enterprise-monitoring';

const app = express();

// Initialize Enterprise Services
const healthService = HealthCheckService.getInstance();
const performanceMonitor = PerformanceMonitor.getInstance();
const analyticsTracker = AnalyticsTracker.getInstance();

// Start periodic health checks
healthService.startPeriodicHealthCheck(30000);

// Initialize Enterprise Validation Service (Fortune 20 Standards)
import('./services/enterprise-validation-service').then(module => {
  const validationService = module.EnterpriseValidationService.getInstance();
  // Run initial validation
  validationService.autoValidateAndOptimize();
  // Schedule periodic validations every 5 minutes
  setInterval(() => {
    validationService.autoValidateAndOptimize();
  }, 5 * 60 * 1000);
});

// Security & CORS
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(requestIdMiddleware);
app.use(validateSecurityHeaders);

// Body parsing with size limits (Fortune 20 standard)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Performance monitoring
app.use(performanceMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 404 Handler - MUST come after Vite setup
  app.use(notFoundHandler);
  
  // Enterprise Error Handler (replaces simple error handler) - MUST be last
  app.use(errorHandler);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
