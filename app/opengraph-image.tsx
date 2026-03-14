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
          fontSize: "240px",
          color: "#2C2320",
          fontFamily: "Pinyon",
          lineHeight: 1,
          marginBottom: "32px",
        }}>
          <span>Carla</span>
          <span style={{ margin: "0 4px 0 80px", position: "relative", top: "-10px", display: "flex", alignItems: "center" }}>
            <svg width="90" height="88" viewBox="-100 -20 170 145">
              <path d="M0,40 C0,18 -18,2 -36,2 C-54,2 -68,16 -68,34 C-68,72 0,105 0,105 C0,105 68,72 68,34 C68,16 54,2 36,2 C18,2 0,18 0,40 Z"
                fill="none" stroke="#C94F4F" stroke-width="2.5" stroke-linecap="round"
                transform="matrix(1,0,-0.52,1.1,0,-20)"/>
            </svg>
          </span>
          <span>Hely</span>
        </div>

        {/* Línea dorada */}
        <div style={{
          width: "900px",
          height: "1px",
          background: "#D4A832",
          opacity: 0.5,
          marginBottom: "40px",
          display: "flex",
        }} />

        {/* Fecha */}
        <div style={{
          fontSize: "60px",
          letterSpacing: "0.18em",
          color: "#5C4A42",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        }}>
          Sábado · 13 de Junio · 2026
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