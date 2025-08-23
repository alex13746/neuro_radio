"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Sparkles, Wand2, Music, Zap } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { Track } from "@/hooks/use-audio-player"

interface MusicGeneratorProps {
  onTrackGenerated: (track: Track) => void
  className?: string
}

export function MusicGenerator({ onTrackGenerated, className }: MusicGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [genre, setGenre] = useState("lo-fi")
  const [mood, setMood] = useState("chill")
  const [duration, setDuration] = useState([180])
  const [style, setStyle] = useState("ambient")

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const result = await apiClient.generateMusic({
        prompt: prompt.trim(),
        genre,
        mood,
        duration: duration[0],
        style,
      })

      onTrackGenerated(result.track)
      setPrompt("")
    } catch (error) {
      console.error("Music generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBulkGenerate = async () => {
    setIsBulkGenerating(true)
    try {
      const bulkPrompts = [
        "Мечтательный синтвейв с мягкими пэдами и нежными арпеджио",
        "Ностальгический synthwave с теплыми пэдами и легкими арпеджио",
        "Эмбиентная космическая музыка с эфирными текстурами и отдаленными эхами",
        "Расслабляющий downtempo с органической перкуссией и теплым басом",
        "Ретро киберпанк с неоновыми мелодиями и аналоговыми синтезаторами",
      ]

      for (const bulkPrompt of bulkPrompts) {
        try {
          const result = await apiClient.generateMusic({
            prompt: bulkPrompt,
            genre: "lo-fi",
            mood: "chill",
            duration: 180,
            style: "ambient",
          })
          onTrackGenerated(result.track)
        } catch (error) {
          console.error("Bulk generation failed for prompt:", bulkPrompt, error)
        }
      }
    } finally {
      setIsBulkGenerating(false)
    }
  }

  const presetPrompts = [
    "Мечтательный синтвейв с мягкими пэдами и нежными арпеджио",
    "Ностальгический lo-fi хип-хоп с треском винила и джазовыми сэмплами",
    "Эмбиентная космическая музыка с эфирными текстурами",
    "Расслабляющий downtempo с органической перкуссией и теплым басом",
    "Ретро киберпанк с неоновыми мелодиями",
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <span>ИИ Генератор Музыки</span>
        </CardTitle>
        <CardDescription>Опишите музыку, которую хотите создать, и наш ИИ сгенерирует её для вас</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button
            onClick={handleBulkGenerate}
            disabled={isBulkGenerating}
            variant="outline"
            className="flex-1 border-purple-500/20 hover:border-purple-500/40 bg-transparent"
          >
            {isBulkGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mr-2" />
                Генерируем 5 треков...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Быстро сгенерировать 5 треков
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-gray-800 font-medium">
            Описание музыки
          </Label>
          <Textarea
            id="prompt"
            placeholder="Опишите музыку, которую хотите сгенерировать..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">Быстрые пресеты</Label>
          <div className="grid grid-cols-1 gap-2">
            {presetPrompts.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(preset)}
                className="justify-start text-left h-auto p-3 border-purple-500/20 hover:border-purple-500/40"
              >
                <Music className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{preset}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Жанр</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lo-fi">Lo-Fi</SelectItem>
                <SelectItem value="synthwave">Синтвейв</SelectItem>
                <SelectItem value="ambient">Эмбиент</SelectItem>
                <SelectItem value="downtempo">Даунтемпо</SelectItem>
                <SelectItem value="chillhop">Чиллхоп</SelectItem>
                <SelectItem value="cyberpunk">Киберпанк</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Настроение</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chill">Расслабленное</SelectItem>
                <SelectItem value="energetic">Энергичное</SelectItem>
                <SelectItem value="melancholic">Меланхоличное</SelectItem>
                <SelectItem value="uplifting">Воодушевляющее</SelectItem>
                <SelectItem value="dreamy">Мечтательное</SelectItem>
                <SelectItem value="nostalgic">Ностальгическое</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">Стиль</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ambient">Эмбиентный</SelectItem>
              <SelectItem value="rhythmic">Ритмичный</SelectItem>
              <SelectItem value="melodic">Мелодичный</SelectItem>
              <SelectItem value="atmospheric">Атмосферный</SelectItem>
              <SelectItem value="minimal">Минималистичный</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-800 font-medium">
            Длительность: {Math.floor(duration[0] / 60)}:{(duration[0] % 60).toString().padStart(2, "0")}
          </Label>
          <Slider value={duration} onValueChange={setDuration} max={300} min={60} step={30} className="w-full" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>1:00</span>
            <span>5:00</span>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Генерируем музыку...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Сгенерировать музыку
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
