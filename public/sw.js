// Service Worker for offline capability and caching
const CACHE_NAME = 'infinite-intelligence-v1';
const DYNAMIC_CACHE = 'infinite-intelligence-dynamic-v1';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const CACHE_DURATION = 3600000; // 1 hour

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/index.css',
  '/src/main.tsx',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/ai/generate',
  '/api/ensemble/',
  '/api/intelligence/',
  '/api/achievements/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('Failed to cache static assets:', error);
        // Continue installation even if some assets fail to cache
        return Promise.resolve();
      });
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('infinite-intelligence-') && name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with cache-first strategy for reads
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // Check if this is a cacheable API endpoint
  const isCacheable = API_CACHE_PATTERNS.some(pattern => 
    request.url.includes(pattern)
  );
  
  if (!isCacheable) {
    return fetch(request);
  }
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    const cacheTime = cachedResponse.headers.get('sw-cache-time');
    if (cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
      console.log('Serving from cache:', request.url);
      return cachedResponse;
    }
  }
  
  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network request failed:', error);
    
    // Return cached response if available (even if expired)
    if (cachedResponse) {
      console.log('Network failed, serving stale cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'You are currently offline. Please check your connection.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses for static assets
    if (networkResponse.ok && shouldCacheAsset(request.url)) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network request failed:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineCache = await caches.open(CACHE_NAME);
      return offlineCache.match('/index.html') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Determine if an asset should be cached
function shouldCacheAsset(url) {
  const urlObj = new URL(url);
  
  // Cache images, fonts, and other static assets
  const cacheableExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf'];
  return cacheableExtensions.some(ext => urlObj.pathname.endsWith(ext));
}

// Message handler for cache operations from main thread
self.addEventListener('message', async (event) => {
  const { type, key, data } = event.data;
  
  switch (type) {
    case 'CACHE_SET':
      await setCacheData(key, data);
      break;
      
    case 'CACHE_GET':
      const cached = await getCacheData(key);
      event.ports[0].postMessage({
        type: 'CACHE_RESPONSE',
        data: cached
      });
      break;
      
    case 'CACHE_CLEAR':
      await clearAllCaches();
      break;
      
    case 'CACHE_CONFIG':
      // Store configuration for cache behavior
      self.cacheConfig = event.data.config;
      break;
  }
});

// Set data in cache
async function setCacheData(key, data) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'sw-cache-time': Date.now().toString(),
      'sw-cache-key': key
    }
  });
  
  const request = new Request(`/cache/${key}`);
  await cache.put(request, response);
}

// Get data from cache
async function getCacheData(key) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const request = new Request(`/cache/${key}`);
  const response = await cache.match(request);
  
  if (response) {
    const data = await response.json();
    const cacheTime = response.headers.get('sw-cache-time');
    
    // Check if cache is still valid
    if (cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
      return data;
    }
  }
  
  return null;
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  );
  console.log('All caches cleared');
}

// Periodic cache cleanup
setInterval(async () => {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const cacheTime = response.headers.get('sw-cache-time');
      if (cacheTime && Date.now() - parseInt(cacheTime) > CACHE_DURATION * 2) {
        await cache.delete(request);
        console.log('Deleted expired cache:', request.url);
      }
    }
  }
}, 10 * 60 * 1000); // Run every 10 minutes

console.log('Service Worker loaded successfully');