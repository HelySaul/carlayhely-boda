import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carla & Hely — 13 de Junio, 2026",
  description: "Con alegría en el corazón, los invitamos a celebrar el inicio de nuestra vida juntos.",
  openGraph: {
    title: "Carla Victoria & Hely Saul — 13 · 06 · 2026",
    description: "Con alegría en el corazón, los invitamos a celebrar el inicio de nuestra vida juntos.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}