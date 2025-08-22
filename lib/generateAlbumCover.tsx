import { put } from "@vercel/blob"

export async function generateAlbumCover(title: string, artist: string): Promise<{ url: string }> {
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
        <circle cx="200" cy="200" r="180" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.1" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.1" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.1" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.1" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.1" />
        
        <!-- Center Label -->
        <circle cx="200" cy="200" r="80" fill="url(#labelGradient)" />
        <circle cx="200" cy="200" r="8" fill="#1a1a2e" />
        
        <!-- Text -->
        <text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
          ${title.substring(0, 20)}${title.length > 20 ? "..." : ""}
        </text>
        <text x="200" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" opacity="0.8">
          ${artist.substring(0, 25)}${artist.length > 25 ? "..." : ""}
        </text>
        <text x="200" y="220" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" opacity="0.6">
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
