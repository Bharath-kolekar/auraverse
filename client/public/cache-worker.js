// Service Worker for Advanced Caching and Offline Support
// Provides intelligent caching with zero additional costs

const CACHE_NAME = 'intelligence-cache-v1';
const CACHE_VERSION = 1;
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Priority caching patterns
const PRIORITY_PATTERNS = [
  '/api/intelligence/generate',
  '/api/intelligence/models',
  'music',
  'image',
  'video',
  'audio'
];

// Cache configuration
let cacheConfig = {
  maxCacheSize: MAX_CACHE_SIZE,
  cacheDuration: CACHE_DURATION,
  priorityPatterns: PRIORITY_PATTERNS
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Cache Worker: Installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache Worker: Cache opened');
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css'
      ]);
    })
  );
  
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Cache Worker: Activating');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cache Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event with intelligent caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Check if this is a priority request
  const isPriority = PRIORITY_PATTERNS.some(pattern => 
    url.pathname.includes(pattern) || request.url.includes(pattern)
  );
  
  if (isPriority) {
    event.respondWith(handlePriorityRequest(request));
  } else {
    event.respondWith(handleStandardRequest(request));
  }
});

// Handle priority requests with aggressive caching
async function handlePriorityRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cacheKey = generateCacheKey(request);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date'));
      const isExpired = Date.now() - cacheDate.getTime() > cacheConfig.cacheDuration;
      
      if (!isExpired) {
        console.log('Cache Worker: Serving from cache', cacheKey);
        return cachedResponse;
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone response for caching
      const responseToCache = networkResponse.clone();
      
      // Add cache metadata
      const responseWithMetadata = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: {
          ...Object.fromEntries(responseToCache.headers.entries()),
          'sw-cache-date': new Date().toISOString(),
          'sw-cache-type': 'priority'
        }
      });
      
      // Cache the response
      await cache.put(cacheKey, responseWithMetadata);
      console.log('Cache Worker: Cached priority response', cacheKey);
      
      // Manage cache size
      await manageCacheSize();
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Cache Worker: Network failed, trying cache', error);
    
    // Return cached version even if expired as fallback
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or error response
    return new Response('Offline - content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Handle standard requests with normal caching
async function handleStandardRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try cache first for static resources
    if (isStaticResource(request.url)) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache static resources and successful API responses
    if (networkResponse.ok && shouldCache(request.url)) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Return cached version if available
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Generate intelligent cache keys
function generateCacheKey(request) {
  const url = new URL(request.url);
  
  // For API requests, include relevant parameters in cache key
  if (url.pathname.includes('/api/intelligence/generate')) {
    // Create cache key based on request body hash (simplified)
    return `${url.pathname}-${Date.now().toString(36)}`;
  }
  
  return request.url;
}

// Check if resource should be cached
function shouldCache(url) {
  const noCachePatterns = [
    '/api/auth/',
    '/api/user/',
    'login',
    'logout'
  ];
  
  return !noCachePatterns.some(pattern => url.includes(pattern));
}

// Check if resource is static
function isStaticResource(url) {
  const staticPatterns = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2'
  ];
  
  return staticPatterns.some(pattern => url.includes(pattern));
}

// Manage cache size to stay within limits
async function manageCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  // Calculate approximate cache size
  let totalSize = 0;
  const entries = [];
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const size = parseInt(response.headers.get('content-length')) || 1000;
      const cacheDate = response.headers.get('sw-cache-date');
      const priority = response.headers.get('sw-cache-type') === 'priority';
      
      entries.push({
        request,
        size,
        cacheDate: cacheDate ? new Date(cacheDate) : new Date(0),
        priority
      });
      
      totalSize += size;
    }
  }
  
  // If over limit, remove oldest non-priority items
  if (totalSize > cacheConfig.maxCacheSize) {
    console.log('Cache Worker: Cache size exceeded, cleaning up');
    
    // Sort by priority and age
    entries.sort((a, b) => {
      if (a.priority && !b.priority) return 1;
      if (!a.priority && b.priority) return -1;
      return a.cacheDate.getTime() - b.cacheDate.getTime();
    });
    
    // Remove oldest 20%
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      await cache.delete(entries[i].request);
    }
    
    console.log(`Cache Worker: Removed ${toRemove} old entries`);
  }
}

// Handle configuration updates
self.addEventListener('message', (event) => {
  const { type, config } = event.data;
  
  if (type === 'CACHE_CONFIG') {
    cacheConfig = { ...cacheConfig, ...config };
    console.log('Cache Worker: Configuration updated', cacheConfig);
  }
  
  if (type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('Cache Worker: Cache cleared');
      event.ports[0]?.postMessage({ success: true });
    });
  }
  
  if (type === 'GET_CACHE_INFO') {
    getCacheInfo().then(info => {
      event.ports[0]?.postMessage(info);
    });
  }
});

// Get cache information
async function getCacheInfo() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  
  let totalSize = 0;
  let priorityCount = 0;
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      totalSize += parseInt(response.headers.get('content-length')) || 1000;
      if (response.headers.get('sw-cache-type') === 'priority') {
        priorityCount++;
      }
    }
  }
  
  return {
    totalEntries: requests.length,
    priorityEntries: priorityCount,
    totalSize,
    maxSize: cacheConfig.maxCacheSize,
    utilization: (totalSize / cacheConfig.maxCacheSize) * 100
  };
}

console.log('Cache Worker: Script loaded');