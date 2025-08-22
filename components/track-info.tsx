"use client"

import type { Track } from "@/hooks/use-audio-player"
import { cn } from "@/lib/utils"

interface TrackInfoProps {
  track: Track | null
  className?: string
}

export function TrackInfo({ track, className }: TrackInfoProps) {
  if (!track) {
    return (
      <div className={cn("text-center space-y-2", className)}>
        <h2
          className="text-2xl font-bold font-orbitron"
          style={{ color: "color-mix(in oklch, oklch(0.96 0.07 137.15) 90%, transparent)" }}
        >
          Трек не выбран
        </h2>
        <p className="font-orbitron" style={{ color: "color-mix(in oklch, oklch(0.96 0.07 137.15) 90%, transparent)" }}>
          Выберите трек для прослушивания
        </p>
      </div>
    )
  }

  return (
    <div className={cn("text-center space-y-2", className)}>
      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
        {track.title}
      </h1>
      <h2 className="text-xl md:text-2xl text-purple-200 font-medium">{track.artist}</h2>
      {track.album && <p className="text-lg text-purple-300/90">{track.album}</p>}
    </div>
  )
}
