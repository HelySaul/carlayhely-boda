// app/confirmar/[codigo]/[ronda]/opengraph-image.tsx

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Carla & Hely — Confirmación";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEXTOS: Record<string, string> = {
  "1": "Queremos que seas parte de nuestro día",
  "2": "Ya falta poco — y tú eres parte de este día",
  "3": "Última llamada — el gran día casi está aquí",
};

export default async function Image({ params }: { params: Promise<{ ronda: string }> }) {
  const { ronda } = await params;
  const pinyon = await readFile(join(process.cwd(), "public/fonts/PinyonScript-Regular.ttf"));
  const texto = TEXTOS[ronda] ?? TEXTOS["1"];

  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", background: "#FDFAF6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

        {/* Nombres */}
        <div style={{ display: "flex", alignItems: "center", fontSize: "240px", color: "#2C2320", fontFamily: "Pinyon", lineHeight: 1, marginBottom: "32px" }}>
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

        {/* Separador ondulado */}
        <svg width="600" height="20" viewBox="0 0 600 20" fill="none" style={{ marginBottom: "36px" }}>
          <path d="M20 10 Q150 3 300 10 Q450 17 580 10" stroke="#C94F4F" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          <circle cx="300" cy="10" r="4" fill="none" stroke="#D4693A" stroke-width="2" opacity="0.7"/>
          <path d="M280 10 Q290 4 300 10 Q310 16 320 10" stroke="#D4693A" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
        </svg>

        {/* Texto dinámico por ronda */}
        <div style={{ fontSize: "46px", color: "#9A8880", fontFamily: "Georgia, serif", fontStyle: "italic", letterSpacing: "0.05em", textAlign: "center" }}>
          {texto}
        </div>

      </div>
    ),
    { ...size, fonts: [{ name: "Pinyon", data: pinyon, style: "normal", weight: 400 }] }
  );
}