/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;
const ASSETS = [
  ...build, // the app itself
  ...files  // everything in `static`
];

// Install event - caching all files
self.addEventListener('install', (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }
  
  event.waitUntil(addFilesToCache());
});

// Activate event - removing old caches
self.addEventListener('activate', (event) => {
  async function deleteOldCaches() {
    const cacheKeys = await caches.keys();
    
    for (const key of cacheKeys) {
      if (key !== CACHE) await caches.delete(key);
    }
  }
  
  event.waitUntil(deleteOldCaches());
});

// Fetch event - serving cached files or fetching from the network
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // Serve from cache if the file is in the ASSETS list
    if (ASSETS.includes(url.pathname)) {
      const cachedResponse = await cache.match(url.pathname);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // For other requests, try the network first, fall back to cache if offline
    try {
      const networkResponse = await fetch(event.request);

      if (!(networkResponse instanceof Response)) {
        throw new Error('Invalid response from fetch');
      }

      if (networkResponse.status === 200) {
        cache.put(event.request, networkResponse.clone());
      }

      return networkResponse;
    } catch (err) {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      // If no cache is available, propagate the error
      throw err;
    }
  }

  event.respondWith(respond());
});