"use client";

interface FloralAccentProps {
  x: string;
  y: string;
  side: "left" | "right";
  rotate?: number;
  size?: number;
  petalColor: string;
  petalColor2?: string;
  opacity?: number;
}

function Tulip({ size, petalColor, petalColor2, rotate = 0 }: {
  size: number; petalColor: string; petalColor2?: string; rotate?: number;
}) {
  const c2 = petalColor2 || petalColor;
  const s = size;
  return (
    <svg width={s * 0.55} height={s} viewBox="0 0 44 80" fill="none"
      style={{ transform: `rotate(${rotate}deg)`, display: "block", overflow: "visible" }}>
      {/* Tallo */}
      <path d="M22 78 Q21 58 22 44" stroke="#7A9438" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Hoja izquierda */}
      <path d="M21 62 Q10 52 12 42 Q18 54 21 58Z" fill="#7A9438" opacity="0.55"/>
      {/* Hoja derecha */}
      <path d="M23 56 Q34 46 32 36 Q26 48 23 52Z" fill="#7A9438" opacity="0.45"/>
      {/* Copa del tulipán — pétalo izquierdo exterior */}
      <path d="M22 44 Q10 40 8 26 Q10 14 16 10 Q18 22 22 30Z" fill={petalColor} opacity="0.80"/>
      {/* Pétalo derecho exterior */}
      <path d="M22 44 Q34 40 36 26 Q34 14 28 10 Q26 22 22 30Z" fill={c2} opacity="0.75"/>
      {/* Pétalo central */}
      <path d="M22 44 Q16 34 16 20 Q18 8 22 6 Q26 8 28 20 Q28 34 22 44Z" fill={petalColor} opacity="0.70"/>
      {/* Brillo sutil */}
      <path d="M20 16 Q21 12 22 10 Q22 16 21 22Z" fill="white" opacity="0.18"/>
    </svg>
  );
}

export default function FloralAccent({
  x, y, side, rotate = 0, size = 80,
  petalColor, petalColor2, opacity = 1,
}: FloralAccentProps) {
  const flip = side === "right" ? "scaleX(-1)" : undefined;
  const yProp = y.startsWith("top") ? "top" : "bottom";
  const yVal  = y.replace("top:", "").replace("bottom:", "").trim();

  return (
    <div style={{
      position: "absolute",
      [side === "left" ? "left" : "right"]: x,
      [yProp]: yVal,
      pointerEvents: "none",
      opacity,
      transform: flip,
      zIndex: 0,
    }}>
      {/* Tulipán principal */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <Tulip size={size} petalColor={petalColor} petalColor2={petalColor2} rotate={rotate} />
        {/* Tulipán secundario más pequeño y desplazado */}
        <div style={{ position: "absolute", bottom: 0, left: size * 0.28, transform: `translateX(10px)` }}>
          <Tulip size={size * 0.72} petalColor={petalColor2 || petalColor} petalColor2={petalColor} rotate={rotate - 8} />
        </div>
      </div>
    </div>
  );
}