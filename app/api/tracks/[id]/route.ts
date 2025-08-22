import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: track, error } = await supabase.from("tracks").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    return NextResponse.json({ track })
  } catch (error) {
    console.error("Track fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch track" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data: track, error } = await supabase.from("tracks").update(body).eq("id", params.id).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update track" }, { status: 500 })
    }

    return NextResponse.json({ track })
  } catch (error) {
    console.error("Track update error:", error)
    return NextResponse.json({ error: "Failed to update track" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("tracks").delete().eq("id", params.id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete track" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Track deletion error:", error)
    return NextResponse.json({ error: "Failed to delete track" }, { status: 500 })
  }
}
