"use client"

import { useState, useEffect } from "react"

export function usePWA() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check if app is installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/api/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration)

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("SW registration failed:", error)
        })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        const { type, data } = event.data

        switch (type) {
          case "music-generated":
            // Handle background music generation completion
            console.log("Background music generated:", data)
            break
          case "cache-updated":
            // Handle cache updates
            console.log("Cache updated:", data)
            break
        }
      })
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const updateApp = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
          window.location.reload()
        }
      })
    }
  }

  const requestBackgroundSync = async (tag: string, data: any) => {
    if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register(tag)

        // Store data for background sync (simplified - use IndexedDB in production)
        localStorage.setItem(`sync-${tag}`, JSON.stringify(data))

        return true
      } catch (error) {
        console.error("Background sync registration failed:", error)
        return false
      }
    }
    return false
  }

  return {
    isOnline,
    isInstalled,
    updateAvailable,
    updateApp,
    requestBackgroundSync,
  }
}
