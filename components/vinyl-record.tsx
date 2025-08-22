"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface VinylRecordProps {
  coverUrl?: string
  isPlaying: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function VinylRecord({ coverUrl, isPlaying, size = "lg", className }: VinylRecordProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64 md:w-80 md:h-80",
  }

  useEffect(() => {
    if (coverUrl) {
      const img = new Image()
      img.onload = () => setImageLoaded(true)
      img.src = coverUrl
    }
  }, [coverUrl])

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Vinyl Record Base */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black",
          "shadow-2xl border-4 border-gray-700",
          "transition-transform duration-300 ease-out",
          isPlaying && "animate-spin",
        )}
        style={{
          animationDuration: isPlaying ? "3s" : "0s",
          animationIterationCount: "infinite",
          animationTimingFunction: "linear",
        }}
      >
        {/* Vinyl grooves */}
        <div className="absolute inset-4 rounded-full border border-gray-600 opacity-30" />
        <div className="absolute inset-8 rounded-full border border-gray-600 opacity-20" />
        <div className="absolute inset-12 rounded-full border border-gray-600 opacity-10" />

        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg flex items-center justify-center">
            {coverUrl && imageLoaded ? (
              <img
                src={coverUrl || "/placeholder.svg"}
                alt="Album cover"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-black" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Glow effect when playing */}
      {isPlaying && <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />}

      {/* Tonearm */}
      <div
        className={cn(
          "absolute -top-4 -right-4 w-24 h-2 bg-gradient-to-r from-gray-600 to-gray-400",
          "rounded-full shadow-lg origin-right transition-transform duration-500",
          isPlaying ? "rotate-12" : "rotate-0",
        )}
      >
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gray-300 rounded-full shadow-sm" />
      </div>
    </div>
  )
}
