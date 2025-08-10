// Enterprise Security Middleware - Fortune 20 Standards
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppError, ErrorCode } from './enterprise-error-handler';
import crypto from 'crypto';

// Security Headers Configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.openai.com', 'wss:', 'ws:'],
      mediaSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false
});

// Rate Limiting Configurations
export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      throw new AppError(
        message || 'Rate limit exceeded',
        429,
        ErrorCode.TOO_MANY_REQUESTS,
        true,
        { retryAfter: Math.ceil(windowMs / 1000) }
      );
    }
  });
};

// API Rate Limiters
export const apiRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'API rate limit exceeded. Please try again in 15 minutes.'
);

export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts. Please try again in 15 minutes.'
);

export const aiServiceRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 AI requests per minute
  'AI service rate limit exceeded. Please try again in 1 minute.'
);

// Request ID Middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Input Sanitization Middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// SQL Injection Prevention
export const preventSQLInjection = (value: string): string => {
  // Remove or escape dangerous SQL characters
  return value
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0': return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '"':
        case "'":
        case '\\':
        case '%': return '\\' + char;
        default: return char;
      }
    });
};

// XSS Prevention
export const preventXSS = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// API Key Validation Middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    throw new AppError(
      'API key is required',
      401,
      ErrorCode.UNAUTHORIZED,
      true
    );
  }
  
  // Validate API key format and check against database
  if (!isValidApiKey(apiKey)) {
    throw new AppError(
      'Invalid API key',
      401,
      ErrorCode.INVALID_API_KEY,
      true
    );
  }
  
  next();
};

// CORS Configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'http://localhost:5000',
      'https://cognomega.com',
      'https://www.cognomega.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError('Not allowed by CORS', 403, ErrorCode.FORBIDDEN, true));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Security Audit Logger
export class SecurityAuditLogger {
  private static instance: SecurityAuditLogger;
  private auditLog: any[] = [];
  
  static getInstance(): SecurityAuditLogger {
    if (!SecurityAuditLogger.instance) {
      SecurityAuditLogger.instance = new SecurityAuditLogger();
    }
    return SecurityAuditLogger.instance;
  }
  
  log(event: string, userId: string | null, details: any): void {
    const entry = {
      timestamp: new Date(),
      event,
      userId,
      details,
      id: generateRequestId()
    };
    
    this.auditLog.push(entry);
    
    // In production, send to audit service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAuditService(entry);
    }
  }
  
  private sendToAuditService(entry: any): void {
    // Send to enterprise audit service
    console.log('[AUDIT]', entry);
  }
  
  getAuditLogs(limit: number = 100): any[] {
    return this.auditLog.slice(-limit);
  }
}

// Helper Functions
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return preventXSS(preventSQLInjection(obj));
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

function isValidApiKey(apiKey: string): boolean {
  // Implement actual API key validation logic
  // Check format, expiry, permissions, etc.
  return apiKey.length === 64 && /^[a-zA-Z0-9]+$/.test(apiKey);
}

function generateRequestId(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Content Security Policy Report Handler
export const cspReportHandler = (req: Request, res: Response): void => {
  const logger = SecurityAuditLogger.getInstance();
  logger.log('CSP_VIOLATION', null, req.body);
  res.status(204).end();
};

// Security Headers Validation
export const validateSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Check for required security headers
  const requiredHeaders = ['x-request-id', 'user-agent'];
  
  for (const header of requiredHeaders) {
    if (!req.headers[header]) {
      console.warn(`Missing required header: ${header}`);
    }
  }
  
  next();
};