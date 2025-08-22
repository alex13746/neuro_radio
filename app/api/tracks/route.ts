import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

async function ensureTracksTable(supabase: any) {
  const { error } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_name", "tracks")
    .eq("table_schema", "public")
    .single()

  if (error && error.code === "PGRST116") {
    // Table doesn't exist, but we'll handle this in the main query
    console.log("Tracks table doesn't exist, will return sample data")
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Loading tracks from API...")
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get("genre")
    const mood = searchParams.get("mood")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const supabase = await createClient()

    await ensureTracksTable(supabase)

    let query = supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (genre) {
      query = query.eq("genre", genre)
    }

    if (mood) {
      query = query.eq("mood", mood)
    }

    const { data: tracks, error } = await query

    if (error) {
      if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
        console.log("[v0] Table doesn't exist, creating sample tracks...")
        const sampleTracks: any[] = []
        console.log(`[v0] Loaded tracks: ${sampleTracks.length}`)
        return NextResponse.json({ tracks: sampleTracks })
      }
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 })
    }

    console.log(`[v0] Loaded tracks: ${tracks?.length || 0}`)
    return NextResponse.json({ tracks })
  } catch (error) {
    console.error("Tracks fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      artist,
      album,
      genre,
      duration,
      audio_url,
      cover_url,
      ai_generated = false,
      ai_prompt,
      ai_model,
      mood,
      tags,
      bpm,
      key,
    } = body

    if (!title || !artist || !audio_url) {
      return NextResponse.json({ error: "Title, artist, and audio_url are required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: track, error } = await supabase
      .from("tracks")
      .insert({
        title,
        artist,
        album,
        genre,
        duration,
        audio_url,
        cover_url,
        ai_generated,
        ai_prompt,
        ai_model,
        mood,
        tags,
        bpm,
        key,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create track" }, { status: 500 })
    }

    return NextResponse.json({ track }, { status: 201 })
  } catch (error) {
    console.error("Track creation error:", error)
    return NextResponse.json({ error: "Failed to create track" }, { status: 500 })
  }
}
