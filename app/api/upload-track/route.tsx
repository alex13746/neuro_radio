import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

async function generateAlbumCover(title: string, artist: string) {
  // Generate SVG album cover
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  ]

  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { font: bold 24px Arial, sans-serif; fill: white; text-anchor: middle; }
          .artist { font: 18px Arial, sans-serif; fill: rgba(255,255,255,0.8); text-anchor: middle; }
        </style>
      </defs>
      <rect width="400" height="400" fill="url(#grad)"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
      <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <circle cx="200" cy="200" r="50" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <circle cx="200" cy="200" r="20" fill="rgba(0,0,0,0.3)"/>
      <text x="200" y="180" class="title">${title.slice(0, 20)}</text>
      <text x="200" y="220" class="artist">${artist.slice(0, 25)}</text>
    </svg>
  `

  const buffer = Buffer.from(svg)
  const blob = await put(`covers/${Date.now()}-cover.svg`, buffer, {
    access: "public",
    contentType: "image/svg+xml",
  })

  return blob
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const title = formData.get("title") as string
    const artist = formData.get("artist") as string
    const album = formData.get("album") as string
    const description = formData.get("description") as string

    if (!audioFile || !title) {
      return NextResponse.json({ error: "Аудио файл и название обязательны" }, { status: 400 })
    }

    // Check file size (50MB limit)
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Файл слишком большой. Максимальный размер: 50MB" }, { status: 400 })
    }

    // Upload audio file to Vercel Blob
    const audioBlob = await put(`tracks/${Date.now()}-${audioFile.name}`, audioFile, {
      access: "public",
    })

    // Generate album cover
    const coverBlob = await generateAlbumCover(title, artist || "Неизвестный исполнитель")

    // Get audio duration (simplified - in real app you'd use audio processing library)
    const duration = 180 // Default duration, should be extracted from audio file

    // Create Supabase client
    const supabase = await createClient()

    // Save track to database
    const { data: track, error } = await supabase
      .from("tracks")
      .insert({
        title,
        artist: artist || "Неизвестный исполнитель",
        album: album || "Загруженные треки",
        description,
        audio_url: audioBlob.url,
        cover_url: coverBlob.url,
        duration,
        genre: "user-upload",
        is_ai_generated: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Ошибка сохранения в базу данных" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      track,
      message: "Трек успешно загружен",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Ошибка загрузки файла" }, { status: 500 })
  }
}
