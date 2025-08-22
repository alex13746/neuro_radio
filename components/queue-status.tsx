"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Music, Zap, Clock, TrendingUp, RefreshCw } from "lucide-react"

interface QueueStatus {
  totalTracks: number
  recentTracks: number
  genreDistribution: Record<string, number>
  queueHealth: "healthy" | "low" | "critical"
  lastGeneration: string
}

export function QueueStatus() {
  const [status, setStatus] = useState<QueueStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const loadStatus = async () => {
    try {
      const response = await fetch("/api/background-queue")
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Failed to load queue status:", error)
    }
  }

  const triggerGeneration = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/background-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger-generation" }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Generation triggered:", result)
        await loadStatus() // Refresh status
      }
    } catch (error) {
      console.error("Failed to trigger generation:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "bg-green-500"
      case "low":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getHealthText = (health: string) => {
    switch (health) {
      case "healthy":
        return "Очередь в порядке"
      case "low":
        return "Очередь заканчивается"
      case "critical":
        return "Критически мало треков"
      default:
        return "Неизвестный статус"
    }
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="h-5 w-5 text-purple-400" />
          <span>Статус очереди</span>
        </CardTitle>
        <CardDescription>Статус системы фоновой генерации музыки</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Состояние очереди</p>
            <p className="text-xs text-muted-foreground">{getHealthText(status.queueHealth)}</p>
          </div>
          <Badge className={`${getHealthColor(status.queueHealth)} text-white`}>
            {status.queueHealth.toUpperCase()}
          </Badge>
        </div>

        {/* Track Counts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center">
              <Music className="h-4 w-4 mr-1" />
              Всего треков
            </p>
            <p className="text-2xl font-bold text-purple-400">{status.totalTracks}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Недавние (24ч)
            </p>
            <p className="text-2xl font-bold text-green-400">{status.recentTracks}</p>
          </div>
        </div>

        {/* Queue Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Вместимость очереди</p>
            <p className="text-sm text-muted-foreground">{status.totalTracks}/50</p>
          </div>
          <Progress value={(status.totalTracks / 50) * 100} className="h-2" />
        </div>

        {/* Genre Distribution */}
        {Object.keys(status.genreDistribution).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Недавние жанры
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(status.genreDistribution).map(([genre, count]) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={triggerGeneration}
            disabled={isGenerating}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Генерируем...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Сгенерировать сейчас
              </>
            )}
          </Button>
          <Button onClick={loadStatus} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>

        {/* Last Generation */}
        <div className="text-xs text-muted-foreground">
          Последнее обновление: {new Date(status.lastGeneration).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
