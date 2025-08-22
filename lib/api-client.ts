"use client"

import type { Track } from "@/hooks/use-audio-player"

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl
  }

  async generateMusic(params: {
    prompt: string
    genre?: string
    mood?: string
    duration?: number
    style?: string
  }): Promise<{ track: Track }> {
    const response = await fetch(`${this.baseUrl}/api/generate-music`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error("Failed to generate music")
    }

    return response.json()
  }

  async getTracks(params?: {
    genre?: string
    mood?: string
    limit?: number
    offset?: number
  }): Promise<{ tracks: Track[] }> {
    const searchParams = new URLSearchParams()
    if (params?.genre) searchParams.set("genre", params.genre)
    if (params?.mood) searchParams.set("mood", params.mood)
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    if (params?.offset) searchParams.set("offset", params.offset.toString())

    const response = await fetch(`${this.baseUrl}/api/tracks?${searchParams}`)

    if (!response.ok) {
      throw new Error("Failed to fetch tracks")
    }

    return response.json()
  }

  async getTrack(id: string): Promise<{ track: Track }> {
    const response = await fetch(`${this.baseUrl}/api/tracks/${id}`)

    if (!response.ok) {
      throw new Error("Failed to fetch track")
    }

    return response.json()
  }

  async trackPlay(trackId: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/tracks/${trackId}/play`, {
      method: "POST",
    })
  }

  async toggleLike(trackId: string): Promise<{ liked: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track_id: trackId }),
    })

    if (!response.ok) {
      throw new Error("Failed to toggle like")
    }

    return response.json()
  }

  async checkLike(trackId: string): Promise<{ liked: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/likes?track_id=${trackId}`)

    if (!response.ok) {
      return { liked: false }
    }

    return response.json()
  }

  async uploadFile(file: File, type: "audio" | "cover"): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload file")
    }

    return response.json()
  }

  async generateCover(params: {
    title: string
    artist: string
    genre?: string
    mood?: string
    style?: string
  }): Promise<{ cover_url: string }> {
    const response = await fetch(`${this.baseUrl}/api/generate-cover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error("Failed to generate cover")
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
