"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Play, Heart, Download, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import type { Track } from "@/hooks/use-audio-player"

interface TrackLibraryProps {
  onTrackSelect: (track: Track) => void
  onQueueTracks: (tracks: Track[]) => void
  className?: string
}

export function TrackLibrary({ onTrackSelect, onQueueTracks, className }: TrackLibraryProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [genreFilter, setGenreFilter] = useState("all")
  const [moodFilter, setMoodFilter] = useState("all")

  useEffect(() => {
    loadTracks()
  }, [])

  useEffect(() => {
    filterTracks()
  }, [tracks, searchQuery, genreFilter, moodFilter])

  const loadTracks = async () => {
    setIsLoading(true)
    try {
      const result = await apiClient.getTracks({ limit: 50 })
      setTracks(result.tracks)
    } catch (error) {
      console.error("Failed to load tracks:", error)
      setTracks([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterTracks = () => {
    let filtered = tracks

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(query) ||
          track.artist.toLowerCase().includes(query) ||
          track.album?.toLowerCase().includes(query),
      )
    }

    if (genreFilter !== "all") {
      filtered = filtered.filter((track) => (track as any).genre === genreFilter)
    }

    if (moodFilter !== "all") {
      filtered = filtered.filter((track) => (track as any).mood === moodFilter)
    }

    setFilteredTracks(filtered)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      onQueueTracks(filteredTracks)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Библиотека музыки</h2>
        <Button
          onClick={handlePlayAll}
          disabled={filteredTracks.length === 0}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
        >
          <Play className="h-4 w-4 mr-2" />
          Играть все
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск треков, исполнителей, альбомов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={genreFilter} onValueChange={setGenreFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Жанр" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все жанры</SelectItem>
            <SelectItem value="lo-fi">Lo-Fi</SelectItem>
            <SelectItem value="synthwave">Синтвейв</SelectItem>
            <SelectItem value="ambient">Эмбиент</SelectItem>
            <SelectItem value="downtempo">Даунтемпо</SelectItem>
          </SelectContent>
        </Select>

        <Select value={moodFilter} onValueChange={setMoodFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Настроение" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все настроения</SelectItem>
            <SelectItem value="chill">Расслабленное</SelectItem>
            <SelectItem value="energetic">Энергичное</SelectItem>
            <SelectItem value="melancholic">Меланхоличное</SelectItem>
            <SelectItem value="uplifting">Воодушевляющее</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Track List */}
      <ScrollArea className="h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Треки не найдены</p>
            <p className="text-sm">Попробуйте изменить поиск или фильтры</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center space-x-4 p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-purple-500/10 hover:border-purple-500/20 hover:bg-card/50 transition-all group"
              >
                {/* Track Number */}
                <div className="w-8 text-center text-sm text-muted-foreground group-hover:hidden">{index + 1}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onTrackSelect(track)}
                  className="w-8 h-8 hidden group-hover:flex text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  <Play className="h-4 w-4" />
                </Button>

                {/* Album Art */}
                <img
                  src={track.cover_url || "/placeholder.svg?height=48&width=48"}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{track.title}</h4>
                  <p className="text-sm text-gray-600 truncate">{track.artist}</p>
                  {track.album && <p className="text-xs text-gray-600 truncate">{track.album}</p>}
                </div>

                {/* Duration */}
                <div className="text-sm text-gray-600">{track.duration ? formatDuration(track.duration) : "--:--"}</div>

                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
