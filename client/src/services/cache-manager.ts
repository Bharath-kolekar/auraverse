// Multi-tier caching system for maximum performance
// Implements localStorage, IndexedDB, service worker, and distributed caching

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version: string;
  userSpecific?: boolean;
}

interface CacheConfig {
  enableLocalStorage?: boolean;
  enableIndexedDB?: boolean;
  enableServiceWorker?: boolean;
  enableDistributed?: boolean;
  defaultTTL?: number;
  maxSize?: number;
}

class MultiTierCacheManager {
  private static instance: MultiTierCacheManager;
  private config: CacheConfig;
  private version = '1.0.0';
  private db: IDBDatabase | null = null;
  private dbName = 'InfiniteIntelligenceCache';
  private storeName = 'mediaAssets';
  private memoryCache = new Map<string, CacheEntry>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    localStorage: { hits: 0, misses: 0 },
    indexedDB: { hits: 0, misses: 0 },
    serviceWorker: { hits: 0, misses: 0 }
  };

  private constructor(config: CacheConfig = {}) {
    this.config = {
      enableLocalStorage: true,
      enableIndexedDB: true,
      enableServiceWorker: true,
      enableDistributed: true,
      defaultTTL: 3600000, // 1 hour default
      maxSize: 50 * 1024 * 1024, // 50MB default
      ...config
    };
    
    this.initializeIndexedDB();
    this.initializeServiceWorker();
    this.startCacheCleanup();
  }

  static getInstance(config?: CacheConfig): MultiTierCacheManager {
    if (!MultiTierCacheManager.instance) {
      MultiTierCacheManager.instance = new MultiTierCacheManager(config);
    }
    return MultiTierCacheManager.instance;
  }

  // Initialize IndexedDB for large media assets
  private async initializeIndexedDB(): Promise<void> {
    if (!this.config.enableIndexedDB || !('indexedDB' in window)) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  // Initialize Service Worker for offline capability
  private async initializeServiceWorker(): Promise<void> {
    if (!this.config.enableServiceWorker || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration.scope);
      
      // Send cache configuration to service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_CONFIG',
          config: this.config
        });
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Get data with multi-tier fallback
  async get<T>(key: string, userSpecific = false): Promise<T | null> {
    const fullKey = userSpecific ? `${this.getUserId()}_${key}` : key;
    
    // Level 1: Memory cache (fastest)
    const memoryResult = this.getFromMemory<T>(fullKey);
    if (memoryResult !== null) {
      this.cacheStats.hits++;
      return memoryResult;
    }

    // Level 2: LocalStorage (fast)
    if (this.config.enableLocalStorage) {
      const localResult = this.getFromLocalStorage<T>(fullKey);
      if (localResult !== null) {
        this.cacheStats.localStorage.hits++;
        this.setToMemory(fullKey, localResult); // Promote to memory
        return localResult;
      }
      this.cacheStats.localStorage.misses++;
    }

    // Level 3: IndexedDB (for large data)
    if (this.config.enableIndexedDB && this.db) {
      const indexedResult = await this.getFromIndexedDB<T>(fullKey);
      if (indexedResult !== null) {
        this.cacheStats.indexedDB.hits++;
        this.setToMemory(fullKey, indexedResult); // Promote to memory
        return indexedResult;
      }
      this.cacheStats.indexedDB.misses++;
    }

    // Level 4: Service Worker cache (offline support)
    if (this.config.enableServiceWorker && 'serviceWorker' in navigator) {
      const swResult = await this.getFromServiceWorker<T>(fullKey);
      if (swResult !== null) {
        this.cacheStats.serviceWorker.hits++;
        this.setToMemory(fullKey, swResult); // Promote to memory
        return swResult;
      }
      this.cacheStats.serviceWorker.misses++;
    }

    this.cacheStats.misses++;
    return null;
  }

  // Set data to all appropriate cache layers
  async set<T>(
    key: string, 
    data: T, 
    ttl?: number, 
    userSpecific = false
  ): Promise<void> {
    const fullKey = userSpecific ? `${this.getUserId()}_${key}` : key;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL!,
      version: this.version,
      userSpecific
    };

    // Determine cache tier based on data size
    const dataSize = this.estimateSize(data);
    
    // Always set to memory cache
    this.setToMemory(fullKey, data, ttl);

    // Small data (<1MB): LocalStorage
    if (this.config.enableLocalStorage && dataSize < 1024 * 1024) {
      this.setToLocalStorage(fullKey, entry);
    }

    // Large data (>1MB): IndexedDB
    if (this.config.enableIndexedDB && this.db && dataSize >= 1024 * 1024) {
      await this.setToIndexedDB(fullKey, entry, dataSize);
    }

    // Critical data: Service Worker cache
    if (this.config.enableServiceWorker && this.isCriticalData(key)) {
      await this.setToServiceWorker(fullKey, entry);
    }

    // Distributed cache sync
    if (this.config.enableDistributed && !userSpecific) {
      this.syncToDistributed(fullKey, entry);
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

  private setToMemory<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL!,
      version: this.version
    };
    this.memoryCache.set(key, entry);
  }

  // LocalStorage operations
  private getFromLocalStorage<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (!stored) return null;
      
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (!this.isExpired(entry) && entry.version === this.version) {
        return entry.data;
      }
      
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('LocalStorage get error:', error);
    }
    return null;
  }

  private setToLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
    try {
      const serialized = JSON.stringify(entry);
      localStorage.setItem(`cache_${key}`, serialized);
    } catch (error) {
      console.error('LocalStorage set error:', error);
      // Clear old entries if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldLocalStorageEntries();
      }
    }
  }

  // IndexedDB operations
  private async getFromIndexedDB<T>(key: string): Promise<T | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (result && !this.isExpired(result) && result.version === this.version) {
          resolve(result.data);
        } else {
          if (result) {
            this.deleteFromIndexedDB(key);
          }
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('IndexedDB get error:', request.error);
        resolve(null);
      };
    });
  }

  private async setToIndexedDB<T>(key: string, entry: CacheEntry<T>, size: number): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const record = {
        key,
        ...entry,
        size
      };
      
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('IndexedDB set error:', request.error);
        reject(request.error);
      };
    });
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('IndexedDB delete error:', request.error);
        resolve();
      };
    });
  }

  // Service Worker cache operations
  private async getFromServiceWorker<T>(key: string): Promise<T | null> {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_RESPONSE' && event.data.data) {
          const entry: CacheEntry<T> = event.data.data;
          if (!this.isExpired(entry) && entry.version === this.version) {
            resolve(entry.data);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      navigator.serviceWorker.controller?.postMessage(
        { type: 'CACHE_GET', key },
        [messageChannel.port2]
      );

      // Timeout after 100ms
      setTimeout(() => resolve(null), 100);
    });
  }

  private async setToServiceWorker<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_SET',
      key,
      data: entry
    });
  }

  // Distributed cache sync
  private syncToDistributed<T>(key: string, entry: CacheEntry<T>): void {
    // Broadcast to other tabs/windows
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('cache_sync');
      channel.postMessage({
        type: 'CACHE_UPDATE',
        key,
        entry
      });
      channel.close();
    }

    // Use localStorage events as fallback
    localStorage.setItem('cache_sync_signal', JSON.stringify({
      key,
      timestamp: Date.now()
    }));
  }

  // Utility methods
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  private isCriticalData(key: string): boolean {
    // Mark certain data types as critical for offline access
    const criticalPatterns = ['user_', 'auth_', 'content_', 'project_'];
    return criticalPatterns.some(pattern => key.startsWith(pattern));
  }

  private getUserId(): string {
    // Get user ID from auth context or localStorage
    return localStorage.getItem('userId') || 'anonymous';
  }

  private clearOldLocalStorageEntries(): void {
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    const entries = cacheKeys.map(key => ({
      key,
      timestamp: JSON.parse(localStorage.getItem(key) || '{}').timestamp || 0
    }));
    
    // Remove oldest 25% of entries
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(entries.length * 0.25);
    
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
    }
  }

  // Cache cleanup
  private startCacheCleanup(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  private async cleanupExpiredEntries(): Promise<void> {
    // Clean memory cache
    for (const [key, entry] of Array.from(this.memoryCache.entries())) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    for (const key of cacheKeys) {
      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}');
        if (this.isExpired(entry)) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }

    // Clean IndexedDB
    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const cutoff = Date.now() - this.config.defaultTTL!;
      const range = IDBKeyRange.upperBound(cutoff);
      
      index.openCursor(range).onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
    }
  }

  // Cache statistics
  getStats() {
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0,
      memoryCacheSize: this.memoryCache.size,
      localStorageKeys: Object.keys(localStorage).filter(k => k.startsWith('cache_')).length
    };
  }

  // Clear all caches
  async clearAll(): Promise<void> {
    // Clear memory
    this.memoryCache.clear();
    
    // Clear localStorage
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    // Clear IndexedDB
    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.clear();
    }
    
    // Clear service worker cache
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CACHE_CLEAR' });
    }
    
    // Reset stats
    this.cacheStats = {
      hits: 0,
      misses: 0,
      localStorage: { hits: 0, misses: 0 },
      indexedDB: { hits: 0, misses: 0 },
      serviceWorker: { hits: 0, misses: 0 }
    };
  }
}

// Export singleton instance
export const cacheManager = MultiTierCacheManager.getInstance();

// Cache decorator for easy method caching
export function Cacheable(ttl?: number, userSpecific = false) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cacheManager.get(cacheKey, userSpecific);
      if (cached !== null) {
        return cached;
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      await cacheManager.set(cacheKey, result, ttl, userSpecific);
      
      return result;
    };
    
    return descriptor;
  };
}