// app/opengraph-image.tsx
// Next.js genera automáticamente la imagen OG en /opengraph-image
// y la enlaza en el <head> sin necesidad de configurar metadata manualmente.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Carla & Hely · 13 de Junio 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  // Cargar Pinyon Script desde Google Fonts
  const pinyonFont = await fetch(
    "https://fonts.gstatic.com/s/pinyonscript/v22/6xKpdSJbL9-e9LuoeQiDRQR8aOLQO4bhiDY.woff2"
  ).then(r => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#FDFAF6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Mancha roja suave arriba derecha */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,79,79,0.10) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* Mancha verde suave abajo izquierda */}
        <div style={{
          position: "absolute", bottom: "-60px", left: "-60px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(122,148,56,0.10) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* Nombres */}
        <div style={{
          display: "flex",
          alignItems: "baseline",
          fontFamily: "'Pinyon Script'",
          fontSize: "160px",
          color: "#2C2320",
          lineHeight: 1,
          letterSpacing: "-4px",
          marginBottom: "8px",
        }}>
          <span>Carla</span>
          <span style={{ fontSize: "80px", color: "#C94F4F", margin: "0 16px", position: "relative", top: "-20px" }}>♡</span>
          <span>Hely</span>
        </div>

        {/* Línea decorativa */}
        <div style={{
          width: "480px", height: "1px",
          background: "linear-gradient(90deg, transparent, #D4A832 40%, #D4693A 60%, transparent)",
          opacity: 0.5,
          marginBottom: "28px",
          display: "flex",
        }} />

        {/* Fecha */}
        <div style={{
          fontFamily: "sans-serif",
          fontSize: "28px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#9A8880",
          marginBottom: "12px",
        }}>
          Sábado · 13 de Junio · 2026
        </div>

        {/* Lugar */}
        <div style={{
          fontFamily: "sans-serif",
          fontSize: "22px",
          color: "#D4693A",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}>
          Brisas del Renacer · Falcón
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Pinyon Script",
          data: pinyonFont,
          style: "normal",
        },
      ],
    }
  );
}