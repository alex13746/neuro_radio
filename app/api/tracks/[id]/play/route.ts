import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Increment play count
    const { error: playCountError } = await supabase.rpc("increment_play_count", {
      track_uuid: params.id,
    })

    if (playCountError) {
      console.error("Play count error:", playCountError)
    }

    // Add to listening history if user is authenticated
    if (user) {
      const { error: historyError } = await supabase.from("listening_history").insert({
        user_id: user.id,
        track_id: params.id,
        listened_at: new Date().toISOString(),
      })

      if (historyError) {
        console.error("History error:", historyError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Play tracking error:", error)
    return NextResponse.json({ error: "Failed to track play" }, { status: 500 })
  }
}
