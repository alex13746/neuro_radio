"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Music, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    description: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith("audio/")) {
        setSelectedFile(file)
        // Auto-fill title from filename
        if (!formData.title) {
          const filename = file.name.replace(/\.[^/.]+$/, "")
          setFormData((prev) => ({ ...prev, title: filename }))
        }
      } else {
        toast({
          title: "Неверный формат файла",
          description: "Пожалуйста, выберите аудио файл",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !formData.title) {
      toast({
        title: "Заполните обязательные поля",
        description: "Выберите файл и укажите название трека",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create form data for upload
      const uploadFormData = new FormData()
      uploadFormData.append("audio", selectedFile)
      uploadFormData.append("title", formData.title)
      uploadFormData.append("artist", formData.artist || "Неизвестный исполнитель")
      uploadFormData.append("album", formData.album || "Загруженные треки")
      uploadFormData.append("description", formData.description)

      // Upload track
      const response = await fetch("/api/upload-track", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error("Ошибка загрузки")
      }

      const result = await response.json()

      toast({
        title: "Трек успешно загружен!",
        description: "Ваш трек появится в потоке на главной странице",
      })

      // Reset form
      setFormData({ title: "", artist: "", album: "", description: "" })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Redirect to home
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить трек. Попробуйте еще раз.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
              Загрузить Трек
            </h1>
          </div>

          {/* Upload Form */}
          <Card className="bg-card/50 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-200">
                <Music className="w-5 h-5 mr-2" />
                Добавить свою композицию
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="audio-file" className="text-purple-200">
                  Аудио файл *
                </Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-purple-500/20 text-purple-200 hover:bg-purple-500/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файл
                  </Button>
                  {selectedFile && <span className="text-sm text-purple-200/80 truncate">{selectedFile.name}</span>}
                </div>
              </div>

              {/* Track Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-purple-200">
                    Название трека *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Введите название"
                    className="bg-background/50 border-purple-500/20 text-purple-100 placeholder:text-purple-200/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist" className="text-purple-200">
                    Исполнитель
                  </Label>
                  <Input
                    id="artist"
                    value={formData.artist}
                    onChange={(e) => setFormData((prev) => ({ ...prev, artist: e.target.value }))}
                    placeholder="Ваше имя или псевдоним"
                    className="bg-background/50 border-purple-500/20 text-purple-100 placeholder:text-purple-200/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="album" className="text-purple-200">
                  Альбом
                </Label>
                <Input
                  id="album"
                  value={formData.album}
                  onChange={(e) => setFormData((prev) => ({ ...prev, album: e.target.value }))}
                  placeholder="Название альбома"
                  className="bg-background/50 border-purple-500/20 text-purple-100 placeholder:text-purple-200/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-purple-200">
                  Описание
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Расскажите о своем треке..."
                  className="bg-background/50 border-purple-500/20 text-purple-100 placeholder:text-purple-200/50 min-h-[100px]"
                />
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !formData.title}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загружаем...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить трек
                  </>
                )}
              </Button>

              <p className="text-xs text-purple-200/60 text-center">
                Поддерживаемые форматы: MP3, WAV, FLAC, OGG. Максимальный размер: 50MB
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
