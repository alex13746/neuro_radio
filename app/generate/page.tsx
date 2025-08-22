"use client"
import { MusicGenerator } from "@/components/music-generator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Track } from "@/hooks/use-audio-player"

export default function GeneratePage() {
  const router = useRouter()

  const handleTrackGenerated = (track: Track) => {
    // Redirect to home page after generation
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mr-4 text-purple-200 hover:text-purple-100 hover:bg-purple-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <h1
              className="text-3xl font-bold font-orbitron"
              style={{ color: "color-mix(in oklch, oklch(0.96 0.07 137.15) 90%, transparent)" }}
            >
              Генерация Музыки
            </h1>
          </div>

          {/* Music Generator */}
          <MusicGenerator onTrackGenerated={handleTrackGenerated} />
        </div>
      </div>
    </div>
  )
}
