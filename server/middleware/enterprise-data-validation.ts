// Enterprise Data Validation - Fortune 20 Standards
import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { AppError, ErrorCode } from './enterprise-error-handler';

// Common validation schemas
export const ValidationSchemas = {
  // ID validation
  id: z.string().uuid('Invalid ID format'),
  
  // Email validation
  email: z.string().email('Invalid email format'),
  
  // Phone validation (international format)
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
  
  // URL validation
  url: z.string().url('Invalid URL format'),
  
  // Date validation
  date: z.string().datetime('Invalid date format'),
  
  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
  }),
  
  // Search query
  searchQuery: z.object({
    q: z.string().min(1).max(100),
    filters: z.record(z.any()).optional(),
    fields: z.array(z.string()).optional()
  }),
  
  // File upload
  fileUpload: z.object({
    filename: z.string().max(255),
    mimetype: z.string(),
    size: z.number().max(10 * 1024 * 1024) // 10MB max
  }),
  
  // AI request validation
  aiRequest: z.object({
    prompt: z.string().min(1).max(10000),
    model: z.enum(['gpt-4o', 'gpt-3.5-turbo', 'dall-e-3', 'whisper-1']).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(1).max(4000).optional(),
    stream: z.boolean().optional()
  }),
  
  // User profile
  userProfile: z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
    email: z.string().email(),
    name: z.string().min(1).max(100),
    bio: z.string().max(500).optional(),
    avatar: z.string().url().optional(),
    preferences: z.record(z.any()).optional()
  }),
  
  // Payment validation
  payment: z.object({
    amount: z.number().positive().multipleOf(0.01),
    currency: z.string().length(3),
    paymentMethod: z.enum(['card', 'paypal', 'crypto', 'bank_transfer']),
    metadata: z.record(z.any()).optional()
  }),
  
  // Content creation
  content: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    type: z.enum(['video', 'audio', 'image', 'text', 'vfx']),
    tags: z.array(z.string()).max(10).optional(),
    visibility: z.enum(['public', 'private', 'unlisted']).default('private'),
    metadata: z.record(z.any()).optional()
  })
};

// Validation middleware factory
export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      if (req.body && Object.keys(req.body).length > 0) {
        req.body = await schema.parseAsync(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        next(new AppError(
          'Validation failed',
          422,
          ErrorCode.VALIDATION_ERROR,
          true,
          { errors: validationErrors }
        ));
      } else {
        next(error);
      }
    }
  };
}

// Query validation middleware
export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        next(new AppError(
          'Invalid query parameters',
          400,
          ErrorCode.BAD_REQUEST,
          true,
          { errors: validationErrors }
        ));
      } else {
        next(error);
      }
    }
  };
}

// Params validation middleware
export function validateParams(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        next(new AppError(
          'Invalid URL parameters',
          400,
          ErrorCode.BAD_REQUEST,
          true,
          { errors: validationErrors }
        ));
      } else {
        next(error);
      }
    }
  };
}

// Custom validators
export class DataValidator {
  // Validate credit card number (Luhn algorithm)
  static isValidCreditCard(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
  
  // Validate IBAN
  static isValidIBAN(iban: string): boolean {
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]+$/;
    return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase());
  }
  
  // Validate strong password
  static isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }
  
  // Validate file type
  static isValidFileType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimetype);
  }
  
  // Sanitize filename
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }
  
  // Validate JSON structure
  static isValidJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }
  
  // Validate business rules
  static validateBusinessRules(data: any, rules: Array<(data: any) => boolean | string>): string[] {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const result = rule(data);
      if (typeof result === 'string') {
        errors.push(result);
      } else if (!result) {
        errors.push('Business rule validation failed');
      }
    }
    
    return errors;
  }
}

// Content moderation validator
export class ContentModerator {
  private static bannedWords = [
    // Add banned words for content moderation
  ];
  
  static isContentSafe(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return !ContentModerator.bannedWords.some(word => 
      lowerContent.includes(word.toLowerCase())
    );
  }
  
  static moderateContent(content: string): {
    safe: boolean;
    reasons?: string[];
  } {
    const reasons: string[] = [];
    
    // Check for banned words
    if (!this.isContentSafe(content)) {
      reasons.push('Contains inappropriate content');
    }
    
    // Check for excessive caps (spam indicator)
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.7) {
      reasons.push('Excessive capital letters');
    }
    
    // Check for repeated characters (spam indicator)
    if (/(.)\1{4,}/.test(content)) {
      reasons.push('Repeated characters detected');
    }
    
    return {
      safe: reasons.length === 0,
      reasons: reasons.length > 0 ? reasons : undefined
    };
  }
}

// Rate limit validation
export class RateLimitValidator {
  private static userLimits = new Map<string, { count: number; resetTime: number }>();
  
  static checkRateLimit(
    userId: string, 
    limit: number, 
    windowMs: number
  ): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const now = Date.now();
    const userLimit = this.userLimits.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize
      this.userLimits.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      
      return {
        allowed: true,
        remainingRequests: limit - 1,
        resetTime: now + windowMs
      };
    }
    
    if (userLimit.count >= limit) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: userLimit.resetTime
      };
    }
    
    userLimit.count++;
    
    return {
      allowed: true,
      remainingRequests: limit - userLimit.count,
      resetTime: userLimit.resetTime
    };
  }
}