"use client"

export class BackgroundScheduler {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  constructor(private onGenerate: () => void) {}

  start(intervalMinutes = 30) {
    if (this.isRunning) {
      this.stop()
    }

    console.log(`[Scheduler] Starting background generation every ${intervalMinutes} minutes`)

    this.intervalId = setInterval(
      () => {
        this.onGenerate()
      },
      intervalMinutes * 60 * 1000,
    )

    this.isRunning = true
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log("[Scheduler] Stopped background generation")
  }

  isActive() {
    return this.isRunning
  }

  // Trigger immediate generation
  triggerNow() {
    this.onGenerate()
  }
}

export const backgroundScheduler = new BackgroundScheduler(async () => {
  try {
    console.log("[Scheduler] Triggering background generation")

    const response = await fetch("/api/background-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "trigger-generation" }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log("[Scheduler] Background generation completed:", result)

      // Notify user if new tracks were generated
      if (result.generated > 0 && "Notification" in window && Notification.permission === "granted") {
        new Notification("NeuroRadio", {
          body: `${result.generated} new tracks generated!`,
          icon: "/icons/icon-192x192.png",
          tag: "background-generation",
        })
      }
    } else {
      console.error("[Scheduler] Background generation failed:", response.statusText)
    }
  } catch (error) {
    console.error("[Scheduler] Background generation error:", error)
  }
})
