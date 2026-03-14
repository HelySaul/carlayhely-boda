// app/opengraph-image.tsx

import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const alt = "Carla & Hely · 13 de Junio 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  // Variable fonts fallan con @next/og — usar solo Pinyon que es estática
  const pinyon = fs.readFileSync(
    path.join(process.cwd(), "public/fonts/PinyonScript-Regular.ttf")
  );

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
        }}
      >
        {/* Nombres en Pinyon */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          fontSize: "140px",
          color: "#2C2320",
          fontFamily: "Pinyon",
          lineHeight: 1,
          marginBottom: "20px",
        }}>
          <span>Carla</span>
          <span style={{ fontSize: "70px", color: "#C94F4F" }}>♡</span>
          <span>Hely</span>
        </div>

        {/* Línea dorada */}
        <div style={{
          width: "440px",
          height: "1px",
          background: "#D4A832",
          opacity: 0.5,
          marginBottom: "36px",
          display: "flex",
        }} />

        {/* Fecha — serif del sistema */}
        <div style={{
          fontSize: "28px",
          letterSpacing: "0.22em",
          color: "#9A8880",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          marginBottom: "14px",
        }}>
          Sábado · 13 de Junio · 2026
        </div>

        {/* Lugar */}
        <div style={{
          fontSize: "22px",
          letterSpacing: "0.15em",
          color: "#D4693A",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        }}>
          Brisas del Renacer · Falcón
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Pinyon",
          data: pinyon,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}