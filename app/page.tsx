"use client"

import { useState, useEffect } from "react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { usePWA } from "@/hooks/use-pwa"
import { VinylRecord } from "@/components/vinyl-record"
import { PlayerControls } from "@/components/player-controls"
import { TrackInfo } from "@/components/track-info"
import { PWAInstall } from "@/components/pwa-install"
import { Navigation } from "@/components/navigation"
import { TrackLibrary } from "@/components/track-library"
import { SettingsPanel } from "@/components/settings-panel"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw } from "lucide-react"
import type { Track } from "@/hooks/use-audio-player"
import "@fontsource/comfortaa"
import "@fontsource/orbitron"

// Sample tracks for demo - removed to prevent audio errors
const sampleTracks: Track[] = []

export default function HomePage() {
  const [currentView, setCurrentView] = useState("home")
  const [tracks, setTracks] = useState<Track[]>([]) // Начинаем с пустого массива
  const audioPlayer = useAudioPlayer()
  const { isOnline, updateAvailable, updateApp } = usePWA()

  useEffect(() => {
    loadTracks()
  }, [])

  useEffect(() => {
    if (currentView === "home") {
      loadTracks()
    }
  }, [currentView])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTracks()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  const loadTracks = async () => {
    try {
      console.log("[v0] Loading tracks from API...")
      const response = await fetch("/api/tracks")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] API response:", data)
        const allTracks = data.tracks || []
        setTracks(allTracks)
        if (allTracks.length > 0) {
          audioPlayer.setQueue(allTracks, 0)
        }
        if (data.message) {
          console.log("[v0] Database message:", data.message)
        }
      } else {
        console.log("[v0] API response not ok, using empty tracks")
        setTracks([])
      }
    } catch (error) {
      console.error("[v0] Error loading tracks:", error)
      setTracks([])
    }
  }

  const handleTrackSelect = (track: Track) => {
    // Find track in current queue or add it
    const trackIndex = audioPlayer.queue.findIndex((t) => t.id === track.id)
    if (trackIndex >= 0) {
      audioPlayer.setQueue(audioPlayer.queue, trackIndex)
    } else {
      audioPlayer.setQueue([track, ...audioPlayer.queue], 0)
    }
    setCurrentView("home")
  }

  const handleQueueTracks = (tracks: Track[]) => {
    audioPlayer.setQueue(tracks, 0)
    setCurrentView("home")
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "library":
        return <TrackLibrary onTrackSelect={handleTrackSelect} onQueueTracks={handleQueueTracks} />
      case "settings":
        return <SettingsPanel />
      case "favorites":
        return (
          <div className="text-center py-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: "color-mix(in oklch, oklch(0.96 0.07 137.15) 90%, transparent)" }}
            >
              Избранное
            </h2>
            <p className="text-purple-200/80">Ваши любимые треки появятся здесь</p>
          </div>
        )
      case "downloads":
        return (
          <div className="text-center py-12">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: "color-mix(in oklch, oklch(0.96 0.07 137.15) 90%, transparent)" }}
            >
              Загрузки
            </h2>
            <p className="text-purple-200/80">Ваши скачанные треки появятся здесь</p>
          </div>
        )
      default:
        return (
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent mb-4 font-comfortaa">
                НейроРадио 24/7
              </h1>
              <p
                className="text-xl text-purple-200/90 font-medium font-orbitron"
                style={{ color: "color-mix(in oklch, oklch(0.96 0.07 137.15) 90%, transparent)" }}
              >
                ИИ-генерируемая Lo-Fi музыка
              </p>
            </div>

            {/* Vinyl Record */}
            <div className="flex justify-center">
              <VinylRecord coverUrl={audioPlayer.currentTrack?.cover_url} isPlaying={audioPlayer.isPlaying} size="lg" />
            </div>

            {/* Track Info */}
            <TrackInfo track={audioPlayer.currentTrack} />

            {/* Player Controls */}
            <div className="max-w-2xl mx-auto">
              <PlayerControls
                isPlaying={audioPlayer.isPlaying}
                currentTime={audioPlayer.currentTime}
                duration={audioPlayer.duration}
                volume={audioPlayer.volume}
                isLoading={audioPlayer.isLoading}
                onTogglePlay={audioPlayer.togglePlay}
                onSeek={audioPlayer.seek}
                onVolumeChange={audioPlayer.setVolume}
                onPrevious={audioPlayer.playPrevious}
                onNext={audioPlayer.playNext}
                onLike={() => console.log("Like track")}
                onDownload={() => console.log("Download track")}
                onShare={() => console.log("Share track")}
              />
            </div>

            {/* Queue Preview */}
            {audioPlayer.queue.length > 0 && (
              <div>
                <h3
                  className="text-2xl font-bold text-center mb-8 font-orbitron"
                  style={{ color: "color-mix(in oklch, oklch(0.96 0.07 137.15) 90%, transparent)" }}
                >
                  Далее
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {audioPlayer.queue.slice(audioPlayer.currentIndex + 1, audioPlayer.currentIndex + 3).map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center space-x-4 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-purple-500/20"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{track.title}</p>
                        <p className="text-xs text-gray-600 truncate">{track.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tracks.length === 0 && (
              <div className="text-center py-12">
                <h3
                  className="text-2xl font-bold mb-4 font-orbitron"
                  style={{ color: "color-mix(in oklch, oklch(0.96 0.07 137.15) 90%, transparent)" }}
                >
                  Добро пожаловать в НейроРадио!
                </h3>
                <p className="text-purple-200/80 mb-6">
                  Загрузите свои треки или сгенерируйте новую музыку с помощью ИИ
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => (window.location.href = "/upload")}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
                  >
                    Загрузить трек
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/generate")}
                    variant="outline"
                    className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                  >
                    Сгенерировать музыку
                  </Button>
                </div>
              </div>
            )}

            {tracks.length > 0 && (
              <div className="text-center py-8">
                <Button
                  onClick={() => (window.location.href = "/upload")}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
                >
                  Загрузить еще треки
                </Button>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Navigation currentView={currentView} onViewChange={setCurrentView} onTrackSelect={handleTrackSelect} />
          </div>

          {/* Status Indicators */}
          <div className="space-y-4 mb-6">
            {/* Offline Indicator */}
            {!isOnline && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <WifiOff className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-500">Вы офлайн - воспроизводится кэшированная музыка</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Повторить
                </Button>
              </div>
            )}

            {/* Update Available */}
            {updateAvailable && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
                <span className="text-blue-400">Доступна новая версия NeuroRadio!</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={updateApp}
                  className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                >
                  Обновить
                </Button>
              </div>
            )}
          </div>

          {/* Main Content */}
          {renderCurrentView()}
        </div>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstall />
    </div>
  )
}
