"use client"

import { useState, useRef, useCallback, useEffect } from "react"

export interface Track {
  id: string
  title: string
  artist: string
  album?: string
  audio_url: string
  cover_url?: string
  duration?: number
}

export interface AudioPlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: Track[]
  currentIndex: number
  isLoading: boolean
}

export function useAudioPlayer() {
  const [state, setState] = useState<AudioPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    queue: [],
    currentIndex: -1,
    isLoading: false,
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const nextAudioRef = useRef<HTMLAudioElement | null>(null)
  const crossfadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
    }
  }, [])

  // Load and play track
  const loadTrack = useCallback(
    async (track: Track) => {
      setState((prev) => ({ ...prev, isLoading: true }))

      try {
        initializeAudioContext()

        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ""
        }

        const audio = new Audio()
        audio.crossOrigin = "anonymous"
        audio.preload = "auto"
        audio.src = track.audio_url

        audioRef.current = audio

        // Connect to Web Audio API
        if (audioContextRef.current && gainNodeRef.current) {
          if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect()
          }
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audio)
          sourceNodeRef.current.connect(gainNodeRef.current)
        }

        // Set up event listeners
        audio.addEventListener("loadedmetadata", () => {
          setState((prev) => ({
            ...prev,
            currentTrack: track,
            duration: audio.duration,
            isLoading: false,
          }))
        })

        audio.addEventListener("timeupdate", () => {
          setState((prev) => ({
            ...prev,
            currentTime: audio.currentTime,
          }))
        })

        audio.addEventListener("ended", () => {
          playNext()
        })

        audio.addEventListener("error", (e) => {
          console.error("Audio error:", e)
          setState((prev) => ({ ...prev, isLoading: false }))
        })

        await audio.load()
      } catch (error) {
        console.error("Failed to load track:", error)
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    },
    [initializeAudioContext],
  )

  // Play/pause functionality
  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return

    try {
      if (audioContextRef.current?.state === "suspended") {
        await audioContextRef.current.resume()
      }

      if (state.isPlaying) {
        audioRef.current.pause()
        setState((prev) => ({ ...prev, isPlaying: false }))
      } else {
        await audioRef.current.play()
        setState((prev) => ({ ...prev, isPlaying: true }))
      }
    } catch (error) {
      console.error("Playback error:", error)
    }
  }, [state.isPlaying])

  // Seek functionality
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setState((prev) => ({ ...prev, currentTime: time }))
    }
  }, [])

  // Volume control
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))

    if (audioRef.current) {
      audioRef.current.volume = clampedVolume
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume
    }

    setState((prev) => ({ ...prev, volume: clampedVolume }))
  }, [])

  // Queue management
  const setQueue = useCallback(
    (tracks: Track[], startIndex = 0) => {
      setState((prev) => ({
        ...prev,
        queue: tracks,
        currentIndex: startIndex,
      }))

      if (tracks[startIndex]) {
        loadTrack(tracks[startIndex])
      }
    },
    [loadTrack],
  )

  // Play next track with crossfade
  const playNext = useCallback(() => {
    const nextIndex = state.currentIndex + 1
    if (nextIndex < state.queue.length) {
      setState((prev) => ({ ...prev, currentIndex: nextIndex }))
      loadTrack(state.queue[nextIndex])
    } else if (state.queue.length > 0) {
      // Loop back to beginning
      setState((prev) => ({ ...prev, currentIndex: 0 }))
      loadTrack(state.queue[0])
    }
  }, [state.currentIndex, state.queue, loadTrack])

  // Play previous track
  const playPrevious = useCallback(() => {
    const prevIndex = state.currentIndex - 1
    if (prevIndex >= 0) {
      setState((prev) => ({ ...prev, currentIndex: prevIndex }))
      loadTrack(state.queue[prevIndex])
    } else if (state.queue.length > 0) {
      // Loop to end
      const lastIndex = state.queue.length - 1
      setState((prev) => ({ ...prev, currentIndex: lastIndex }))
      loadTrack(state.queue[lastIndex])
    }
  }, [state.currentIndex, state.queue, loadTrack])

  // Crossfade to next track (for seamless transitions)
  const crossfadeToNext = useCallback(() => {
    if (!audioRef.current || !gainNodeRef.current) return

    const fadeOutDuration = 3000 // 3 seconds
    const currentGain = gainNodeRef.current.gain.value

    // Fade out current track
    gainNodeRef.current.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current!.currentTime + fadeOutDuration / 1000,
    )

    // Start next track after fade begins
    setTimeout(() => {
      playNext()
      // Fade in new track
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0.01, audioContextRef.current!.currentTime)
        gainNodeRef.current.gain.exponentialRampToValueAtTime(
          currentGain,
          audioContextRef.current!.currentTime + fadeOutDuration / 1000,
        )
      }
    }, fadeOutDuration / 2)
  }, [playNext])

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    ...state,
    togglePlay,
    seek,
    setVolume,
    setQueue,
    playNext,
    playPrevious,
    crossfadeToNext,
    loadTrack,
  }
}
