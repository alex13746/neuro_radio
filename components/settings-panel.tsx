"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Volume2, Palette, Download, Bell, Zap } from "lucide-react"
import { QueueStatus } from "@/components/queue-status"
import { backgroundScheduler } from "@/lib/background-scheduler"
import { cn } from "@/lib/utils"

interface SettingsPanelProps {
  className?: string
}

export function SettingsPanel({ className }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    autoPlay: true,
    crossfade: true,
    notifications: true,
    downloadQuality: "high",
    theme: "dark",
    crossfadeDuration: [3],
    bufferSize: [5],
    autoGenerate: false,
    generationInterval: [30],
  })

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value }

      // Handle background generation toggle
      if (key === "autoGenerate") {
        if (value) {
          backgroundScheduler.start(newSettings.generationInterval[0])
        } else {
          backgroundScheduler.stop()
        }
      }

      // Handle generation interval change
      if (key === "generationInterval" && newSettings.autoGenerate) {
        backgroundScheduler.start(value[0])
      }

      return newSettings
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-purple-400" />
        <h2 className="text-2xl font-bold">Настройки</h2>
      </div>

      {/* Queue Status */}
      <QueueStatus />

      {/* Playback Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Воспроизведение</span>
          </CardTitle>
          <CardDescription>Настройка параметров воспроизведения аудио</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-800 font-medium">Автовоспроизведение следующего трека</Label>
              <p className="text-sm text-gray-600">Автоматически воспроизводить следующий трек в очереди</p>
            </div>
            <Switch checked={settings.autoPlay} onCheckedChange={(checked) => updateSetting("autoPlay", checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-800 font-medium">Кроссфейд между треками</Label>
              <p className="text-sm text-gray-600">Плавные переходы между песнями</p>
            </div>
            <Switch checked={settings.crossfade} onCheckedChange={(checked) => updateSetting("crossfade", checked)} />
          </div>

          {settings.crossfade && (
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">
                Длительность кроссфейда: {settings.crossfadeDuration[0]}с
              </Label>
              <Slider
                value={settings.crossfadeDuration}
                onValueChange={(value) => updateSetting("crossfadeDuration", value)}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Размер буфера: {settings.bufferSize[0]}с</Label>
            <Slider
              value={settings.bufferSize}
              onValueChange={(value) => updateSetting("bufferSize", value)}
              max={30}
              min={1}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-600">
              Большие значения обеспечивают лучшую стабильность, но используют больше памяти
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>ИИ Генерация</span>
          </CardTitle>
          <CardDescription>Настройка автоматической генерации музыки</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-800 font-medium">Автогенерация музыки</Label>
              <p className="text-sm text-gray-600">Автоматически генерировать новые треки в фоне</p>
            </div>
            <Switch
              checked={settings.autoGenerate}
              onCheckedChange={(checked) => updateSetting("autoGenerate", checked)}
            />
          </div>

          {settings.autoGenerate && (
            <div className="space-y-2">
              <Label className="text-gray-800 font-medium">
                Интервал генерации: {settings.generationInterval[0]} минут
              </Label>
              <Slider
                value={settings.generationInterval}
                onValueChange={(value) => updateSetting("generationInterval", value)}
                max={120}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Загрузки</span>
          </CardTitle>
          <CardDescription>Настройка параметров загрузки</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Качество загрузки</Label>
            <Select value={settings.downloadQuality} onValueChange={(value) => updateSetting("downloadQuality", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкое (128 кбит/с)</SelectItem>
                <SelectItem value="medium">Среднее (256 кбит/с)</SelectItem>
                <SelectItem value="high">Высокое (320 кбит/с)</SelectItem>
                <SelectItem value="lossless">Без потерь (FLAC)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Внешний вид</span>
          </CardTitle>
          <CardDescription>Настройка внешнего вида приложения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-800 font-medium">Тема</Label>
            <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Тёмная</SelectItem>
                <SelectItem value="light">Светлая</SelectItem>
                <SelectItem value="system">Системная</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Уведомления</span>
          </CardTitle>
          <CardDescription>Настройка параметров уведомлений</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-gray-800 font-medium">Push-уведомления</Label>
              <p className="text-sm text-gray-600">Получать уведомления о новой сгенерированной музыке</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting("notifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600">
          Сохранить настройки
        </Button>
      </div>
    </div>
  )
}
