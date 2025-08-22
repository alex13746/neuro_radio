"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { HistoryDrawer } from "@/components/history-drawer"
import { Menu, Home, Music, Sparkles, Settings, Heart, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Track } from "@/hooks/use-audio-player"

interface NavigationProps {
  currentView: string
  onViewChange: (view: string) => void
  onTrackSelect: (track: Track) => void
  className?: string
}

export function Navigation({ currentView, onViewChange, onTrackSelect, className }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { id: "home", label: "Главная", icon: Home },
    { id: "library", label: "Библиотека", icon: Music },
    { id: "generate", label: "Генерация", icon: Sparkles },
    { id: "favorites", label: "Избранное", icon: Heart },
    { id: "downloads", label: "Загрузки", icon: Download },
    { id: "settings", label: "Настройки", icon: Settings },
  ]

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn("hidden md:flex items-center space-x-2", className)}>
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={cn(
                "text-purple-200/70 hover:text-purple-100 hover:bg-transparent",
                currentView === item.id && "bg-purple-600 text-white hover:bg-purple-700",
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          )
        })}

        <HistoryDrawer onTrackSelect={onTrackSelect} />

        <Button
          variant={currentView === "settings" ? "default" : "ghost"}
          size="icon"
          onClick={() => onViewChange("settings")}
          className={cn(
            "text-purple-200/70 hover:text-purple-100 hover:bg-transparent",
            currentView === "settings" && "bg-purple-600 text-white hover:bg-purple-700",
          )}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-background/95 backdrop-blur-sm border-purple-500/20">
            <div className="space-y-4 mt-8">
              <div className="px-3 py-2">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  NeuroRadio
                </h2>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.id}
                      variant={currentView === item.id ? "default" : "ghost"}
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        "w-full justify-start text-purple-200/70 hover:text-purple-100 hover:bg-transparent",
                        currentView === item.id && "bg-purple-600 text-white hover:bg-purple-700",
                      )}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  )
                })}
              </nav>

              <div className="border-t border-purple-500/20 pt-4">
                <div className="px-3">
                  <HistoryDrawer onTrackSelect={onTrackSelect} />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
