"use client"

import { useEffect, useState } from "react"

interface VinylProgressBarProps {
  progress: number
  isLoading: boolean
  className?: string
}

export function VinylProgressBar({ progress, isLoading, className = "" }: VinylProgressBarProps) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setRotation((prev) => (prev + 2) % 360)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative w-24 h-24 ${className}`}>
      {/* Vinyl Record Base */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-purple-500/30 shadow-lg"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Vinyl Grooves */}
        <div className="absolute inset-2 rounded-full border border-purple-400/20"></div>
        <div className="absolute inset-4 rounded-full border border-purple-400/15"></div>
        <div className="absolute inset-6 rounded-full border border-purple-400/10"></div>

        {/* Center Label */}
        <div className="absolute top-1/2 left-1/2 w-6 h-6 -mt-3 -ml-3 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 border border-purple-400/50">
          <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 rounded-full bg-black"></div>
        </div>
      </div>

      {/* Progress Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="2" />
        {/* Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Progress Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-purple-200">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
