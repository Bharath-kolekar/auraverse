// Enterprise Monitoring & Performance Tracking - Fortune 20 Standards
import { Request, Response, NextFunction } from 'express';
import os from 'os';
import { performance } from 'perf_hooks';

// Performance Metrics Interface
interface PerformanceMetrics {
  requestCount: number;
  totalResponseTime: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  errorCount: number;
  successCount: number;
  activeConnections: number;
  cpuUsage: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
}

// Health Check Status
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: {
    database: boolean;
    cache: boolean;
    aiService: boolean;
    storage: boolean;
  };
  metrics: PerformanceMetrics;
  version: string;
  environment: string;
}

// Performance Monitor Class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private requestTimings: Map<string, number> = new Map();
  private startTime: number;

  private constructor() {
    this.startTime = Date.now();
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      errorCount: 0,
      successCount: 0,
      activeConnections: 0,
      cpuUsage: 0,
      memoryUsage: process.memoryUsage(),
      uptime: 0
    };
    
    // Update system metrics every 10 seconds
    setInterval(() => this.updateSystemMetrics(), 10000);
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startRequest(requestId: string): void {
    this.requestTimings.set(requestId, performance.now());
    this.metrics.activeConnections++;
  }

  endRequest(requestId: string, statusCode: number): void {
    const startTime = this.requestTimings.get(requestId);
    if (startTime) {
      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime, statusCode);
      this.requestTimings.delete(requestId);
    }
    this.metrics.activeConnections--;
  }

  private updateMetrics(responseTime: number, statusCode: number): void {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += responseTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requestCount;
    this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime);
    this.metrics.minResponseTime = Math.min(this.metrics.minResponseTime, responseTime);
    
    if (statusCode >= 400) {
      this.metrics.errorCount++;
    } else {
      this.metrics.successCount++;
    }
  }

  private updateSystemMetrics(): void {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    this.metrics.cpuUsage = 100 - ~~(100 * totalIdle / totalTick);
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.uptime = (Date.now() - this.startTime) / 1000;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      errorCount: 0,
      successCount: 0,
      activeConnections: this.metrics.activeConnections,
      cpuUsage: this.metrics.cpuUsage,
      memoryUsage: this.metrics.memoryUsage,
      uptime: this.metrics.uptime
    };
  }
}

// Request Performance Middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const monitor = PerformanceMonitor.getInstance();
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  // Start timing
  monitor.startRequest(requestId);
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(this: Response, ...args: any[]): Response {
    monitor.endRequest(requestId, res.statusCode);
    return originalEnd.call(this, ...args as Parameters<typeof originalEnd>) as Response;
  };
  
  next();
};

// Health Check Service
export class HealthCheckService {
  private static instance: HealthCheckService;
  private lastHealthCheck: HealthStatus | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  async performHealthCheck(): Promise<HealthStatus> {
    const monitor = PerformanceMonitor.getInstance();
    const metrics = monitor.getMetrics();
    
    const services = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      aiService: await this.checkAIService(),
      storage: await this.checkStorage()
    };
    
    const allServicesHealthy = Object.values(services).every(status => status);
    const errorRate = metrics.requestCount > 0 
      ? (metrics.errorCount / metrics.requestCount) * 100 
      : 0;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (!allServicesHealthy || errorRate > 10) {
      status = 'unhealthy';
    } else if (errorRate > 5 || metrics.averageResponseTime > 1000) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }
    
    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date(),
      services,
      metrics,
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    this.lastHealthCheck = healthStatus;
    return healthStatus;
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      // Check database connectivity
      // Implementation depends on your database
      return true;
    } catch {
      return false;
    }
  }

  private async checkCache(): Promise<boolean> {
    try {
      // Check cache service
      return true;
    } catch {
      return false;
    }
  }

  private async checkAIService(): Promise<boolean> {
    try {
      // Check AI service availability
      const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_BACKUP;
      return !!apiKey;
    } catch {
      return false;
    }
  }

  private async checkStorage(): Promise<boolean> {
    try {
      // Check storage service
      return true;
    } catch {
      return false;
    }
  }

  startPeriodicHealthCheck(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, intervalMs);
  }

  stopPeriodicHealthCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getLastHealthCheck(): HealthStatus | null {
    return this.lastHealthCheck;
  }
}

// Analytics Tracker
export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private events: any[] = [];
  private userSessions: Map<string, any> = new Map();

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  trackEvent(event: string, userId: string | null, properties: any = {}): void {
    const eventData = {
      timestamp: new Date(),
      event,
      userId,
      properties,
      sessionId: this.getSessionId(userId),
      id: generateRequestId()
    };
    
    this.events.push(eventData);
    
    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(eventData);
    }
  }

  trackPageView(path: string, userId: string | null): void {
    this.trackEvent('page_view', userId, { path });
  }

  trackApiCall(endpoint: string, method: string, userId: string | null, responseTime: number): void {
    this.trackEvent('api_call', userId, {
      endpoint,
      method,
      responseTime
    });
  }

  private getSessionId(userId: string | null): string {
    if (!userId) return 'anonymous';
    
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        sessionId: generateRequestId(),
        startTime: new Date()
      });
    }
    
    return this.userSessions.get(userId).sessionId;
  }

  private sendToAnalytics(eventData: any): void {
    // Send to analytics service (Google Analytics, Mixpanel, Amplitude, etc.)
    console.log('[ANALYTICS]', eventData);
  }

  getEvents(limit: number = 100): any[] {
    return this.events.slice(-limit);
  }
}

// Helper function
function generateRequestId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export endpoints
export const healthCheckEndpoint = async (req: Request, res: Response): Promise<void> => {
  const healthService = HealthCheckService.getInstance();
  const health = await healthService.performHealthCheck();
  
  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 206 : 503;
  
  res.status(statusCode).json(health);
};

export const metricsEndpoint = (req: Request, res: Response): void => {
  const monitor = PerformanceMonitor.getInstance();
  const metrics = monitor.getMetrics();
  
  res.json({
    success: true,
    metrics,
    timestamp: new Date()
  });
};

export const analyticsEndpoint = (req: Request, res: Response): void => {
  const analytics = AnalyticsTracker.getInstance();
  const limit = parseInt(req.query.limit as string) || 100;
  
  res.json({
    success: true,
    events: analytics.getEvents(limit),
    timestamp: new Date()
  });
};