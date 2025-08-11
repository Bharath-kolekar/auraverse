// Server-side caching service for API responses
import crypto from 'crypto';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  hash?: string;
}

class ServerCacheService {
  private static instance: ServerCacheService;
  private memoryCache = new Map<string, CacheEntry>();
  private distributedCache = new Map<string, CacheEntry>(); // Simulated distributed cache
  private stats = {
    hits: 0,
    misses: 0,
    memoryHits: 0,
    distributedHits: 0
  };

  private constructor() {
    console.log('Using multi-tier memory cache system');
    // Start cleanup interval
    this.startCleanup();
  }

  static getInstance(): ServerCacheService {
    if (!ServerCacheService.instance) {
      ServerCacheService.instance = new ServerCacheService();
    }
    return ServerCacheService.instance;
  }

  // Generate cache key with optional user context
  generateKey(prefix: string, data: any, userId?: string): string {
    const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    return userId ? `${prefix}:${userId}:${hash}` : `${prefix}:${hash}`;
  }

  // Get from cache with multi-tier fallback
  async get<T>(key: string): Promise<T | null> {
    // Level 1: Memory cache (fastest)
    const memoryResult = this.getFromMemory<T>(key);
    if (memoryResult !== null) {
      this.stats.hits++;
      this.stats.memoryHits++;
      return memoryResult;
    }

    // Level 2: Distributed cache (simulated)
    const distributedResult = this.getFromDistributed<T>(key);
    if (distributedResult !== null) {
      this.stats.hits++;
      this.stats.distributedHits++;
      // Promote to memory cache
      this.setToMemory(key, distributedResult, 3600000);
      return distributedResult;
    }

    this.stats.misses++;
    return null;
  }

  // Get from distributed cache
  private getFromDistributed<T>(key: string): T | null {
    const entry = this.distributedCache.get(key);
    if (entry && !this.isExpired(entry)) {
      return entry.data as T;
    }
    if (entry) {
      this.distributedCache.delete(key);
    }
    return null;
  }

  // Set to cache with automatic tiering
  async set<T>(key: string, data: T, ttl = 3600000): Promise<void> {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      hash: crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
    };

    // Always set to memory
    this.setToMemory(key, data, ttl);

    // Set to distributed cache
    this.distributedCache.set(key, entry);

    // Limit distributed cache size
    if (this.distributedCache.size > 500) {
      const entriesToRemove = Array.from(this.distributedCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 50);
      
      entriesToRemove.forEach(([k]) => this.distributedCache.delete(k));
    }
  }

  // Memory cache operations
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (entry && !this.isExpired(entry)) {
      return entry.data as T;
    }
    if (entry) {
      this.memoryCache.delete(key);
    }
    return null;
  }

  private setToMemory<T>(key: string, data: T, ttl: number): void {
    // Limit memory cache size (max 1000 entries)
    if (this.memoryCache.size >= 1000) {
      // Remove oldest entries
      const entriesToRemove = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 100);
      
      entriesToRemove.forEach(([key]) => this.memoryCache.delete(key));
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Check if entry is expired
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Cleanup expired entries
  private startCleanup(): void {
    setInterval(() => {
      // Clean memory cache
      for (const [key, entry] of Array.from(this.memoryCache.entries())) {
        if (this.isExpired(entry)) {
          this.memoryCache.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Invalidate cache by pattern
  async invalidatePattern(pattern: string): Promise<void> {
    // Invalidate memory cache
    const keysToDelete: string[] = [];
    for (const key of Array.from(this.memoryCache.keys())) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key: string) => this.memoryCache.delete(key));

    // Invalidate distributed cache
    const distributedKeysToDelete: string[] = [];
    for (const key of Array.from(this.distributedCache.keys())) {
      if (key.includes(pattern)) {
        distributedKeysToDelete.push(key);
      }
    }
    distributedKeysToDelete.forEach((key: string) => this.distributedCache.delete(key));
  }

  // Get cache statistics
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      memoryCacheSize: this.memoryCache.size,
      distributedCacheSize: this.distributedCache.size,
      memoryHitRate: this.stats.memoryHits / this.stats.hits || 0,
      distributedHitRate: this.stats.distributedHits / this.stats.hits || 0
    };
  }

  // Clear all caches
  async clearAll(): Promise<void> {
    this.memoryCache.clear();
    this.distributedCache.clear();

    // Reset stats
    this.stats = {
      hits: 0,
      misses: 0,
      memoryHits: 0,
      distributedHits: 0
    };
  }
}

// Export singleton instance
export const serverCache = ServerCacheService.getInstance();

// Decorator for caching method results
export function ServerCacheable(ttl = 3600000, prefix = 'method') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = serverCache.generateKey(
        `${prefix}:${target.constructor.name}:${propertyKey}`,
        args
      );
      
      // Try to get from cache
      const cached = await serverCache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      await serverCache.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}