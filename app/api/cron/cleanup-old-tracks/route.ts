import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[CRON] Starting cleanup of old tracks")

    const supabase = await createClient()

    // Find tracks older than 30 days with low play counts
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: oldTracks, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("ai_generated", true)
      .lt("created_at", thirtyDaysAgo.toISOString())
      .lt("play_count", 5) // Only remove tracks with very low play counts
      .limit(10) // Limit cleanup to prevent overwhelming the system

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (!oldTracks || oldTracks.length === 0) {
      console.log("[CRON] No old tracks to cleanup")
      return NextResponse.json({ message: "No tracks to cleanup" })
    }

    let deletedCount = 0
    let failedCount = 0

    for (const track of oldTracks) {
      try {
        // Delete from Vercel Blob
        if (track.audio_url) {
          await del(track.audio_url)
        }
        if (track.cover_url) {
          await del(track.cover_url)
        }

        // Delete from database
        const { error: deleteError } = await supabase.from("tracks").delete().eq("id", track.id)

        if (deleteError) {
          throw new Error(`Failed to delete track ${track.id}: ${deleteError.message}`)
        }

        deletedCount++
        console.log(`[CRON] Deleted track: ${track.title}`)
      } catch (error) {
        console.error(`[CRON] Failed to delete track ${track.id}:`, error)
        failedCount++
      }
    }

    console.log(`[CRON] Cleanup completed: ${deletedCount} deleted, ${failedCount} failed`)

    return NextResponse.json({
      message: "Cleanup completed",
      deleted: deletedCount,
      failed: failedCount,
    })
  } catch (error) {
    console.error("[CRON] Cleanup failed:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}
