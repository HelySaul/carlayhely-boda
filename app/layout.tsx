import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carla & Hely — 13 de Junio, 2026",
  description: "Con alegría en el corazón, los invitamos a celebrar el inicio de nuestra vida juntos.",
  metadataBase: new URL("https://carlayhely-boda.vercel.app"),
  openGraph: {
    title: "Carla Victoria & Hely Saul — 13 · 06 · 2026",
    description: "Con alegría en el corazón, los invitamos a celebrar el inicio de nuestra vida juntos.",
    type: "website",
    images: [
      {
        url: "https://carlayhely-boda.vercel.app/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Carla & Hely · 13 de Junio 2026",
      },
    ],
  },
    icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "android-chrome", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
  
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preload" href="/fonts/PinyonScript-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}