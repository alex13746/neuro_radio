import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { put } from "@vercel/blob"

// This endpoint will be called by Vercel Cron Jobs
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[CRON] Starting background music generation")

    const supabase = await createClient()

    // Get current track count
    const { count: trackCount } = await supabase.from("tracks").select("*", { count: "exact", head: true })

    // Generate new tracks if we have fewer than 50
    const targetTrackCount = 50
    const tracksToGenerate = Math.max(0, targetTrackCount - (trackCount || 0))

    if (tracksToGenerate === 0) {
      console.log("[CRON] Sufficient tracks available, skipping generation")
      return NextResponse.json({ message: "Sufficient tracks available", trackCount })
    }

    // Generate multiple tracks
    const generationPromises = []
    const genres = ["lo-fi", "synthwave", "ambient", "downtempo", "chillhop"]
    const moods = ["chill", "energetic", "melancholic", "uplifting", "dreamy", "nostalgic"]
    const styles = ["ambient", "rhythmic", "melodic", "atmospheric", "minimal"]

    for (let i = 0; i < Math.min(tracksToGenerate, 5); i++) {
      // Generate diverse tracks
      const genre = genres[Math.floor(Math.random() * genres.length)]
      const mood = moods[Math.floor(Math.random() * moods.length)]
      const style = styles[Math.floor(Math.random() * styles.length)]

      const prompt = generateRandomPrompt(genre, mood, style)

      generationPromises.push(
        generateBackgroundTrack({
          prompt,
          genre,
          mood,
          style,
          duration: 180 + Math.floor(Math.random() * 120), // 3-5 minutes
        }),
      )
    }

    const results = await Promise.allSettled(generationPromises)
    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    console.log(`[CRON] Generated ${successful} tracks, ${failed} failed`)

    return NextResponse.json({
      message: "Background generation completed",
      generated: successful,
      failed,
      totalTracks: (trackCount || 0) + successful,
    })
  } catch (error) {
    console.error("[CRON] Background generation failed:", error)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}

async function generateBackgroundTrack(params: {
  prompt: string
  genre: string
  mood: string
  style: string
  duration: number
}) {
  const { prompt, genre, mood, style, duration } = params

  try {
    // Generate track metadata
    const trackId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const titles = [
      `${mood.charAt(0).toUpperCase() + mood.slice(1)} ${style.charAt(0).toUpperCase() + style.slice(1)}`,
      `Neural ${genre.charAt(0).toUpperCase() + genre.slice(1)}`,
      `Digital ${prompt.split(" ")[0]}`,
      `Synthetic Dreams`,
      `AI Waves`,
      `Cyber ${mood}`,
      `Neon ${style}`,
    ]
    const title = titles[Math.floor(Math.random() * titles.length)]

    const artists = [
      "AI Composer",
      "Neural Network",
      "Digital Dreams",
      "Synthetic Soul",
      "Cyber Musician",
      "Algorithm",
      "Binary Beats",
      "Code Symphony",
    ]
    const artist = artists[Math.floor(Math.random() * artists.length)]

    const albums = [
      "Digital Waves",
      "Neon Nights",
      "Cyber Dreams",
      "AI Sessions",
      "Neural Beats",
      "Synthetic Sounds",
      "Binary Melodies",
      "Code Harmonies",
    ]
    const album = albums[Math.floor(Math.random() * albums.length)]

    // Generate placeholder audio and cover
    const audioBuffer = await generatePlaceholderAudio(duration)
    const coverBuffer = await generatePlaceholderCover(title, artist, genre, mood)

    // Upload to Vercel Blob
    const audioBlob = await put(`generated/bg_${trackId}.mp3`, audioBuffer, {
      access: "public",
      contentType: "audio/mpeg",
    })

    const coverBlob = await put(`covers/bg_${trackId}.png`, coverBuffer, {
      access: "public",
      contentType: "image/png",
    })

    // Save to database
    const supabase = await createClient()
    const { data: track, error } = await supabase
      .from("tracks")
      .insert({
        title,
        artist,
        album,
        genre,
        duration,
        audio_url: audioBlob.url,
        cover_url: coverBlob.url,
        ai_generated: true,
        ai_prompt: prompt,
        ai_model: "background-generator",
        mood,
        tags: [genre, mood, style, "auto-generated"],
        bpm: Math.floor(Math.random() * 40) + 80,
        key:
          ["C", "D", "E", "F", "G", "A", "B"][Math.floor(Math.random() * 7)] + ["", "m"][Math.floor(Math.random() * 2)],
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    console.log(`[CRON] Generated track: ${title} by ${artist}`)
    return track
  } catch (error) {
    console.error("[CRON] Track generation failed:", error)
    throw error
  }
}

function generateRandomPrompt(genre: string, mood: string, style: string): string {
  const prompts = {
    "lo-fi": [
      "Warm vinyl crackle with soft jazz piano and mellow drums",
      "Nostalgic tape hiss with gentle guitar loops and rain sounds",
      "Cozy bedroom recording with analog warmth and subtle percussion",
    ],
    synthwave: [
      "Retro synthesizers with neon-soaked arpeggios and driving bass",
      "80s inspired electronic music with vintage drum machines",
      "Cyberpunk atmosphere with analog synths and digital effects",
    ],
    ambient: [
      "Ethereal soundscapes with floating textures and distant echoes",
      "Meditative drones with organic field recordings and soft pads",
      "Spacious atmospheric music with evolving harmonic layers",
    ],
    downtempo: [
      "Relaxed electronic beats with organic instruments and warm bass",
      "Chilled groove with subtle percussion and melodic elements",
      "Laid-back rhythm with jazz influences and electronic textures",
    ],
    chillhop: [
      "Hip-hop influenced beats with jazz samples and vinyl texture",
      "Boom-bap drums with melodic loops and atmospheric pads",
      "Study music with repetitive patterns and calming melodies",
    ],
  }

  const genrePrompts = prompts[genre as keyof typeof prompts] || prompts["lo-fi"]
  const basePrompt = genrePrompts[Math.floor(Math.random() * genrePrompts.length)]

  return `${basePrompt}, ${mood} mood, ${style} style`
}

async function generatePlaceholderAudio(duration: number): Promise<Buffer> {
  // Create a more sophisticated placeholder audio
  const sampleRate = 44100
  const samples = duration * sampleRate
  const buffer = Buffer.alloc(samples * 4) // 32-bit float

  for (let i = 0; i < samples; i++) {
    // Generate a more complex waveform with multiple frequencies
    const time = i / sampleRate
    const freq1 = 220 + Math.sin(time * 0.1) * 50 // Varying bass frequency
    const freq2 = 440 + Math.sin(time * 0.2) * 100 // Varying mid frequency
    const freq3 = 880 + Math.sin(time * 0.05) * 200 // Varying high frequency

    const sample =
      Math.sin(time * freq1 * 2 * Math.PI) * 0.3 +
      Math.sin(time * freq2 * 2 * Math.PI) * 0.2 +
      Math.sin(time * freq3 * 2 * Math.PI) * 0.1

    // Add some envelope and variation
    const envelope = Math.sin((i / samples) * Math.PI) * 0.8 + 0.2
    const finalSample = sample * envelope * (0.8 + Math.random() * 0.2)

    buffer.writeFloatLE(finalSample, i * 4)
  }

  return buffer
}

async function generatePlaceholderCover(title: string, artist: string, genre: string, mood: string): Promise<Buffer> {
  const colorSchemes = {
    "lo-fi": {
      chill: { primary: "#8B5CF6", secondary: "#3B82F6", dark: "#1E293B" },
      energetic: { primary: "#F59E0B", secondary: "#EF4444", dark: "#7C2D12" },
      melancholic: { primary: "#6366F1", secondary: "#8B5CF6", dark: "#1E1B4B" },
      uplifting: { primary: "#10B981", secondary: "#3B82F6", dark: "#064E3B" },
      dreamy: { primary: "#EC4899", secondary: "#8B5CF6", dark: "#1F2937" },
      nostalgic: { primary: "#F59E0B", secondary: "#6366F1", dark: "#7C2D12" },
    },
    synthwave: {
      chill: { primary: "#EC4899", secondary: "#8B5CF6", dark: "#1F2937" },
      energetic: { primary: "#F59E0B", secondary: "#EC4899", dark: "#7C2D12" },
      melancholic: { primary: "#3B82F6", secondary: "#6366F1", dark: "#1E1B4B" },
      uplifting: { primary: "#10B981", secondary: "#EC4899", dark: "#065F46" },
      dreamy: { primary: "#8B5CF6", secondary: "#EC4899", dark: "#312E81" },
      nostalgic: { primary: "#F59E0B", secondary: "#8B5CF6", dark: "#7C2D12" },
    },
    ambient: {
      chill: { primary: "#10B981", secondary: "#3B82F6", dark: "#064E3B" },
      energetic: { primary: "#F59E0B", secondary: "#10B981", dark: "#065F46" },
      melancholic: { primary: "#6366F1", secondary: "#8B5CF6", dark: "#312E81" },
      uplifting: { primary: "#10B981", secondary: "#8B5CF6", dark: "#064E3B" },
      dreamy: { primary: "#8B5CF6", secondary: "#3B82F6", dark: "#1E1B4B" },
      nostalgic: { primary: "#6366F1", secondary: "#10B981", dark: "#312E81" },
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
      ${Array.from({ length: 8 }, (_, i) => {
        const x = (i % 4) * 128 + 64
        const y = Math.floor(i / 4) * 256 + 128
        const size = 60 + Math.random() * 40
        return `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" fill="${colors.primary}" opacity="0.2" />`
      }).join("")}
      ${titleLines
        .map(
          (line, index) =>
            `<text x="256" y="${200 + index * 40}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial" font-size="32" font-weight="bold">${line}</text>`,
        )
        .join("")}
      <text x="256" y="300" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial" font-size="24">${artist}</text>
      <text x="256" y="380" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial" font-size="16">${genre} • ${mood}</text>
    </svg>
  `

  return Buffer.from(svg, "utf-8")
}
