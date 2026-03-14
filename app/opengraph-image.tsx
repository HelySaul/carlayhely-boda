// app/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Carla & Hely · 13 de Junio 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const pinyon = await readFile(
    join(process.cwd(), "public/fonts/PinyonScript-Regular.ttf")
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
        {/* Nombres */}
        <div style={{
          display: "flex",
          alignItems: "center",
          fontSize: "140px",
          color: "#2C2320",
          fontFamily: "Pinyon",
          lineHeight: 1,
          marginBottom: "20px",
        }}>
          <span>Carla</span>
          <span style={{ fontSize: "70px", color: "#C94F4F", margin: "0 8px", position: "relative", top: "-20px", display: "flex", alignItems: "center" }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="#C94F4F">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </span>
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

        {/* Fecha */}
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