// This file helps create a dynamic manifest.json for PWA support and SEO
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daniel's Believe - Premium Online Shopping",
    short_name: "Daniel's Believe",
    description: "Premium Online Shopping mit Flash Sales, Express-Versand und sicherer Zahlung in Deutschland",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#EF4444",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon",
      },
      {
        src: "/logo.webp",
        sizes: "192x192",
        type: "image/webp",
      },
      {
        src: "/logo.webp",
        sizes: "512x512",
        type: "image/webp",
      },
    ],
    categories: ["shopping", "business"],
    lang: "de",
    dir: "ltr",
  }
}
