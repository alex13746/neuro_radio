"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Play, Heart, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Track } from "@/hooks/use-audio-player"

interface HistoryItem {
  id: string
  track: Track
  listened_at: string
  duration_played: number
  completed: boolean
}

interface HistoryDrawerProps {
  onTrackSelect: (track: Track) => void
  className?: string
}

export function HistoryDrawer({ onTrackSelect, className }: HistoryDrawerProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      // Mock history data - in production, fetch from API
      const mockHistory: HistoryItem[] = [
        {
          id: "1",
          track: {
            id: "1",
            title: "Neon Dreams",
            artist: "AI Composer",
            album: "Digital Waves",
            audio_url: "/placeholder.mp3",
            cover_url: "/neon-synthwave-album-cover.png",
            duration: 180,
          },
          listened_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          duration_played: 180,
          completed: true,
        },
        {
          id: "2",
          track: {
            id: "2",
            title: "Cosmic Journey",
            artist: "Neural Network",
            album: "Space Odyssey",
            audio_url: "/placeholder.mp3",
            cover_url: "/cosmic-album-cover.png",
            duration: 240,
          },
          listened_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          duration_played: 120,
          completed: false,
        },
      ]
      setHistory(mockHistory)
    } catch (error) {
      console.error("Failed to load history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("text-muted-foreground hover:text-foreground", className)}>
          <History className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md bg-background/95 backdrop-blur-sm border-purple-500/20">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <History className="h-5 w-5 text-purple-400" />
            <span>История прослушивания</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-full mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>История прослушивания пуста</p>
              <p className="text-sm">Начните воспроизводить треки!</p>
            </div>
          ) : (
            <div className="space-y-4 pb-20">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-purple-500/10 hover:border-purple-500/20 transition-colors"
                >
                  {/* Album Art */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.track.cover_url || "/placeholder.svg?height=48&width=48"}
                      alt={item.track.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    {!item.completed && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-400" />
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.track.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{item.track.artist}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(item.listened_at)}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(item.duration_played)}
                        {item.track.duration && ` / ${formatDuration(item.track.duration)}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onTrackSelect(item.track)}
                      className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
