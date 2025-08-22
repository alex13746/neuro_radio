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
      // Unregister any existing service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister()
        })
      })
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const updateApp = () => {
    window.location.reload()
  }

  const requestBackgroundSync = async (tag: string, data: any) => {
    localStorage.setItem(`sync-${tag}`, JSON.stringify(data))
    return true
  }

  return {
    isOnline,
    isInstalled,
    updateAvailable,
    updateApp,
    requestBackgroundSync,
  }
}
