import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Comfortaa, Orbitron } from "next/font/google"
import "./globals.css"

const comfortaa = Comfortaa({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-comfortaa",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
})

export const metadata: Metadata = {
  title: "НейроРадио 24/7 - ИИ-генерируемая Lo-Fi музыка",
  description:
    "Наслаждайтесь бесконечной ИИ-генерируемой lo-fi музыкой с НейроРадио 24/7. Радиостанция на основе нейронных сетей, транслирующая эмбиент, чилл и синтвейв музыку.",
  generator: "НейроРадио",
  manifest: "/manifest.json",
  themeColor: "#8b5cf6",
  colorScheme: "dark",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "НейроРадио 24/7",
  },
  openGraph: {
    title: "НейроРадио 24/7",
    description: "ИИ-генерируемая Lo-Fi музыка",
    type: "website",
    siteName: "НейроРадио",
  },
  twitter: {
    card: "summary_large_image",
    title: "НейроРадио 24/7",
    description: "ИИ-генерируемая Lo-Fi музыка",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <head>
        <style>{`
html {
  font-family: ${comfortaa.style.fontFamily};
  --font-comfortaa: ${comfortaa.variable};
  --font-orbitron: ${orbitron.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <meta name="application-name" content="НейроРадио 24/7" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="НейроРадио" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#8b5cf6" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${comfortaa.variable}`}>{children}</body>
    </html>
  )
}
