// app/opengraph-image.tsx

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Carla & Hely · 13 de Junio 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
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
          gap: "0px",
        }}
      >
        {/* Bloque central */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>

          {/* Nombres */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "120px",
            color: "#2C2320",
            fontFamily: "serif",
            fontStyle: "italic",
            lineHeight: 1,
            marginBottom: "16px",
          }}>
            <span>Carla</span>
            <span style={{ fontSize: "60px", color: "#C94F4F" }}>♡</span>
            <span>Hely</span>
          </div>

          {/* Línea dorada */}
          <div style={{
            width: "400px",
            height: "1px",
            background: "#D4A832",
            opacity: 0.5,
            marginBottom: "32px",
            display: "flex",
          }} />

          {/* Fecha */}
          <div style={{
            fontSize: "28px",
            letterSpacing: "0.2em",
            color: "#9A8880",
            fontFamily: "sans-serif",
            marginBottom: "12px",
          }}>
            SÁBADO · 13 DE JUNIO · 2026
          </div>

          {/* Lugar */}
          <div style={{
            fontSize: "22px",
            letterSpacing: "0.12em",
            color: "#D4693A",
            fontFamily: "sans-serif",
          }}>
            BRISAS DEL RENACER · FALCÓN
          </div>

        </div>
      </div>
    ),
    { ...size }
  );
}