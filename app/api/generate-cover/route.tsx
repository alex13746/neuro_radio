import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

interface GenerateCoverRequest {
  title: string
  artist: string
  genre?: string
  mood?: string
  style?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateCoverRequest = await request.json()
    const { title, artist, genre = "lo-fi", mood = "chill", style = "neon" } = body

    if (!title || !artist) {
      return NextResponse.json({ error: "Title and artist are required" }, { status: 400 })
    }

    // Generate album cover (placeholder implementation)
    const coverBuffer = await generateAlbumCover({ title, artist, genre, mood, style })

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const filename = `covers/generated_${timestamp}_${randomId}.png`

    const blob = await put(filename, coverBuffer, {
      access: "public",
      contentType: "image/png",
    })

    return NextResponse.json({
      success: true,
      cover_url: blob.url,
      message: "Album cover generated successfully",
    })
  } catch (error) {
    console.error("Cover generation error:", error)
    return NextResponse.json({ error: "Failed to generate cover" }, { status: 500 })
  }
}

async function generateAlbumCover(params: GenerateCoverRequest): Promise<Buffer> {
  const { title, artist, genre, mood } = params

  const colorSchemes = {
    "lo-fi": {
      chill: { primary: "#8B5CF6", secondary: "#3B82F6", dark: "#1E293B" },
      energetic: { primary: "#F59E0B", secondary: "#EF4444", dark: "#7C2D12" },
      melancholic: { primary: "#6366F1", secondary: "#8B5CF6", dark: "#1E1B4B" },
    },
    synthwave: {
      chill: { primary: "#EC4899", secondary: "#8B5CF6", dark: "#1F2937" },
      energetic: { primary: "#F59E0B", secondary: "#EC4899", dark: "#7C2D12" },
      melancholic: { primary: "#3B82F6", secondary: "#6366F1", dark: "#1E1B4B" },
    },
    ambient: {
      chill: { primary: "#10B981", secondary: "#3B82F6", dark: "#064E3B" },
      energetic: { primary: "#F59E0B", secondary: "#10B981", dark: "#065F46" },
      melancholic: { primary: "#6366F1", secondary: "#8B5CF6", dark: "#312E81" },
    },
  }

  const colors = colorSchemes[genre as keyof typeof colorSchemes]?.[mood as keyof (typeof colorSchemes)["lo-fi"]] || {
    primary: "#8B5CF6",
    secondary: "#3B82F6",
    dark: "#1E293B",
  }

  // Split title into lines if too long
  const titleLines = title.length > 20 ? [title.substring(0, 20), title.substring(20)] : [title]

  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%" r="78%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="60%" style="stop-color:${colors.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.dark};stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bg)" />
      ${Array.from({ length: 5 }, (_, i) => {
        const x = Math.random() * 512
        const y = Math.random() * 512
        const size = Math.random() * 100 + 50
        return `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="${colors.primary}" opacity="0.3" />`
      }).join("")}
      ${titleLines
        .map(
          (line, index) =>
            `<text x="256" y="${200 + index * 45}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial" font-size="36" font-weight="bold">${line}</text>`,
        )
        .join("")}
      <text x="256" y="320" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial" font-size="28">${artist}</text>
      <text x="256" y="400" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial" font-size="18">${genre} • ${mood}</text>
    </svg>
  `

  return Buffer.from(svg, "utf-8")
}
