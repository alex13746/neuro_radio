import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

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
    const coverBlob = await generateAlbumCover(title, artist)

    // Get audio duration (simplified - in real app you'd use audio processing library)
    const duration = 180 // Default duration, should be extracted from audio file

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

async function generateAlbumCover(title: string, artist: string): Promise<{ url: string }> {
  try {
    // Generate SVG album cover
    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="vinylGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
            <stop offset="30%" style="stop-color:#16213e;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#0f3460;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#533483;stop-opacity:1" />
          </radialGradient>
          <radialGradient id="labelGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
          </radialGradient>
        </defs>
        
        <!-- Vinyl Record -->
        <circle cx="200" cy="200" r="200" fill="url(#vinylGradient)" />
        
        <!-- Grooves -->
        <circle cx="200" cy="200" r="180" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.1" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.1" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.1" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.1" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.1" />
        
        <!-- Center Label -->
        <circle cx="200" cy="200" r="80" fill="url(#labelGradient)" />
        <circle cx="200" cy="200" r="8" fill="#1a1a2e" />
        
        <!-- Text -->
        <text x="200" y="180" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold">
          ${title.substring(0, 20)}${title.length > 20 ? "..." : ""}
        </text>
        <text x="200" y="200" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="12" opacity="0.8">
          ${artist.substring(0, 25)}${artist.length > 25 ? "..." : ""}
        </text>
        <text x="200" y="220" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="10" opacity="0.6">
          НейроРадио
        </text>
      </svg>
    `

    // Convert SVG to blob and upload
    const svgBlob = new Blob([svg], { type: "image/svg+xml" })
    const coverBlob = await put(`covers/${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, "_")}.svg`, svgBlob, {
      access: "public",
    })

    return coverBlob
  } catch (error) {
    console.error("Cover generation error:", error)
    // Return default cover
    return { url: "/neon-synthwave-album-cover.png" }
  }
}
