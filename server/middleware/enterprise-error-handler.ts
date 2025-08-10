// Enterprise-Grade Error Handling Middleware
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Fortune 20 Standard Error Types
export enum ErrorCode {
  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  
  // Business Logic Errors
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  DEPENDENCY_FAILURE = 'DEPENDENCY_FAILURE',
  DATA_INTEGRITY_ERROR = 'DATA_INTEGRITY_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

// Enterprise Application Error Class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly userId?: string;
  public readonly correlationId?: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Error Logger Service
class ErrorLogger {
  private static instance: ErrorLogger;
  private errorMetrics: Map<ErrorCode, number> = new Map();

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: AppError, req: Request): void {
    const logEntry = {
      timestamp: error.timestamp,
      errorCode: error.errorCode,
      statusCode: error.statusCode,
      message: error.message,
      requestId: error.requestId || req.headers['x-request-id'],
      userId: error.userId || (req as any).user?.id,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: error.details,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };

    // Log to console in development, send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service (DataDog, New Relic, etc.)
      this.sendToMonitoring(logEntry);
    } else {
      console.error('ERROR:', JSON.stringify(logEntry, null, 2));
    }

    // Update metrics
    this.updateMetrics(error.errorCode);
  }

  private updateMetrics(errorCode: ErrorCode): void {
    const count = this.errorMetrics.get(errorCode) || 0;
    this.errorMetrics.set(errorCode, count + 1);
  }

  private sendToMonitoring(logEntry: any): void {
    // Integration with enterprise monitoring tools
    // Example: DataDog, New Relic, Splunk, CloudWatch
    console.log('[MONITORING]', logEntry);
  }

  getMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};
    this.errorMetrics.forEach((count, code) => {
      metrics[code] = count;
    });
    return metrics;
  }
}

// Error Response Builder
class ErrorResponseBuilder {
  static build(error: AppError, isDevelopment: boolean = false): any {
    const response: any = {
      success: false,
      error: {
        code: error.errorCode,
        message: error.message,
        timestamp: error.timestamp,
        requestId: error.requestId
      }
    };

    // Add additional details in development
    if (isDevelopment) {
      response.error.details = error.details;
      response.error.stack = error.stack;
    }

    // Add retry information for certain errors
    if (error.errorCode === ErrorCode.TOO_MANY_REQUESTS) {
      response.error.retryAfter = error.details?.retryAfter || 60;
    }

    return response;
  }
}

// Error Handler Middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger = ErrorLogger.getInstance();
  let appError: AppError;

  // Convert different error types to AppError
  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = new AppError(
      'Validation failed',
      422,
      ErrorCode.VALIDATION_ERROR,
      true,
      err.errors
    );
  } else if ((err as any).code === 'insufficient_quota') {
    appError = new AppError(
      'API quota exceeded. Please check your billing details.',
      429,
      ErrorCode.QUOTA_EXCEEDED,
      true,
      { provider: 'OpenAI' }
    );
  } else if ((err as any).status === 429) {
    appError = new AppError(
      'Rate limit exceeded. Please try again later.',
      429,
      ErrorCode.TOO_MANY_REQUESTS,
      true,
      { retryAfter: 60 }
    );
  } else {
    // Generic error
    appError = new AppError(
      process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      false,
      { originalError: err.message }
    );
  }

  // Add request context
  const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
  const userId = (req as any).user?.id;
  
  // Log the error
  logger.logError(appError, req);

  // Send error response
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response = {
    ...ErrorResponseBuilder.build(appError, isDevelopment),
    requestId,
    userId
  };
  
  // Make sure headers haven't been sent
  if (!res.headersSent) {
    res.status(appError.statusCode).json(response);
  }
};

// Async Error Wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not Found Handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Resource not found: ${req.originalUrl}`,
    404,
    ErrorCode.NOT_FOUND,
    true
  );
  next(error);
};

// Helper function to generate request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export error metrics endpoint
export const getErrorMetrics = (req: Request, res: Response): void => {
  const logger = ErrorLogger.getInstance();
  res.json({
    success: true,
    metrics: logger.getMetrics(),
    timestamp: new Date()
  });
};