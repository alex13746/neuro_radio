const CACHE_NAME = "neuroradio-v1"
const STATIC_CACHE = "neuroradio-static-v1"
const AUDIO_CACHE = "neuroradio-audio-v1"
const API_CACHE = "neuroradio-api-v1"

// Files to cache immediately
const STATIC_ASSETS = ["/", "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png", "/offline"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    }),
  )

  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== AUDIO_CACHE && cacheName !== API_CACHE) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )

  // Take control of all clients immediately
  self.clients.claim()
})

// Fetch event - handle requests with caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle different types of requests
  if (request.method === "GET") {
    // Audio files - cache first strategy
    if (request.url.includes("audio") || request.url.includes(".mp3") || request.url.includes(".wav")) {
      event.respondWith(handleAudioRequest(request))
    }
    // API requests - network first with cache fallback
    else if (url.pathname.startsWith("/api/")) {
      event.respondWith(handleApiRequest(request))
    }
    // Static assets - cache first
    else if (url.pathname.startsWith("/_next/") || url.pathname.includes(".js") || url.pathname.includes(".css")) {
      event.respondWith(handleStaticRequest(request))
    }
    // Pages - network first with cache fallback
    else {
      event.respondWith(handlePageRequest(request))
    }
  }
})

// Audio caching strategy - cache first for better performance
async function handleAudioRequest(request) {
  try {
    const cache = await caches.open(AUDIO_CACHE)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      console.log("[SW] Serving audio from cache:", request.url)
      return cachedResponse
    }

    console.log("[SW] Fetching audio from network:", request.url)
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful audio responses
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error("[SW] Audio request failed:", error)
    // Return a fallback audio file or error response
    return new Response("Audio unavailable offline", { status: 503 })
  }
}

// API caching strategy - network first with cache fallback
async function handleApiRequest(request) {
  try {
    console.log("[SW] Fetching API from network:", request.url)
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache for API:", request.url)
    const cache = await caches.open(API_CACHE)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline response for API requests
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "This feature requires an internet connection",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Static assets caching strategy - cache first
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error("[SW] Static request failed:", error)
    return new Response("Resource unavailable offline", { status: 503 })
  }
}

// Page caching strategy - network first with cache fallback
async function handlePageRequest(request) {
  try {
    console.log("[SW] Fetching page from network:", request.url)
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log("[SW] Network failed, trying cache for page:", request.url)
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page
    return caches.match("/offline") || new Response("Offline", { status: 503 })
  }
}
