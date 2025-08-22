import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { track_id } = await request.json()

    if (!track_id) {
      return NextResponse.json({ error: "Track ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("track_id", track_id)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase.from("likes").delete().eq("user_id", user.id).eq("track_id", track_id)

      if (error) {
        console.error("Unlike error:", error)
        return NextResponse.json({ error: "Failed to unlike track" }, { status: 500 })
      }

      return NextResponse.json({ liked: false })
    } else {
      // Like
      const { error } = await supabase.from("likes").insert({
        user_id: user.id,
        track_id,
      })

      if (error) {
        console.error("Like error:", error)
        return NextResponse.json({ error: "Failed to like track" }, { status: 500 })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Like toggle error:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const track_id = searchParams.get("track_id")

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !track_id) {
      return NextResponse.json({ liked: false })
    }

    const { data: like } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("track_id", track_id)
      .single()

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error("Like check error:", error)
    return NextResponse.json({ liked: false })
  }
}
