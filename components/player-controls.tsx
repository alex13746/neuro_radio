"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Download, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayerControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onPrevious: () => void
  onNext: () => void
  onLike?: () => void
  onDownload?: () => void
  onShare?: () => void
  isLiked?: boolean
  className?: string
}

export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isLoading,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onPrevious,
  onNext,
  onLike,
  onDownload,
  onShare,
  isLiked = false,
  className,
}: PlayerControlsProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={([value]) => onSeek(value)}
            className="w-full"
            disabled={!duration}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          className="h-12 w-12 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
        >
          <SkipBack className="h-6 w-6" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={onTogglePlay}
          disabled={isLoading}
          className="h-16 w-16 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-lg"
        >
          {isLoading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="h-12 w-12 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
        >
          <SkipForward className="h-6 w-6" />
        </Button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 max-w-32">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={([value]) => onVolumeChange(value / 100)}
            className="flex-1"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {onLike && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLike}
              className={cn(
                "h-8 w-8 transition-colors",
                isLiked ? "text-red-500 hover:text-red-400" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
          )}

          {onDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownload}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          {onShare && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShare}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
