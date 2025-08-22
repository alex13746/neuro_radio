"use client"

import { Button } from "@/components/ui/button"
import { Wifi, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center space-y-8">
          {/* Offline Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <Wifi className="w-12 h-12 text-white opacity-50" />
            </div>
          </div>

          {/* Title and Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Вы офлайн
            </h1>
            <p className="text-lg text-muted-foreground">
              NeuroRadio требует подключения к интернету для стриминга новой музыки. Ваши кэшированные треки всё ещё
              доступны!
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>

            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
            >
              Перейти к кэшированной музыке
            </Button>
          </div>

          {/* Offline Features */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Доступно офлайн:</p>
            <ul className="space-y-1">
              <li>• Ранее воспроизведённые треки</li>
              <li>• Кэшированные обложки альбомов</li>
              <li>• Базовые элементы управления плеером</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
