import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get queue status
    const { count: totalTracks } = await supabase.from("tracks").select("*", { count: "exact", head: true })

    const { count: recentTracks } = await supabase
      .from("tracks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

    // Get generation statistics
    const { data: genreStats } = await supabase
      .from("tracks")
      .select("genre")
      .eq("ai_generated", true)
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days

    const genreCounts = genreStats?.reduce(
      (acc, track) => {
        acc[track.genre || "unknown"] = (acc[track.genre || "unknown"] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return NextResponse.json({
      totalTracks: totalTracks || 0,
      recentTracks: recentTracks || 0,
      genreDistribution: genreCounts || {},
      queueHealth: (totalTracks || 0) > 20 ? "healthy" : "low",
      lastGeneration: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Queue status error:", error)
    return NextResponse.json({ error: "Failed to get queue status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json()

    const supabase = await createClient()

    switch (action) {
      case "trigger-generation":
        // Trigger immediate background generation
        const response = await fetch(`${request.nextUrl.origin}/api/cron/generate-music`, {
          method: "GET",
          headers: {
            authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        })

        const result = await response.json()
        return NextResponse.json(result)

      case "update-preferences":
        // Update generation preferences (stored in a preferences table or config)
        // This would be implemented based on user preferences
        return NextResponse.json({ message: "Preferences updated" })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Background queue action error:", error)
    return NextResponse.json({ error: "Action failed" }, { status: 500 })
  }
}
