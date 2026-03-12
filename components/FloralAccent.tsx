"use client";

interface FloralAccentProps {
  x: string;           // left / right value
  y: string;           // top / bottom value  
  side: "left" | "right"; // which corner
  rotate?: number;
  size?: number;
  petalColor: string;
  petalColor2?: string;
  opacity?: number;
}

// Una flor SVG con pétalos vivos
function Bloom({ size, petalColor, petalColor2, rotate = 0 }: {
  size: number; petalColor: string; petalColor2: string; rotate?: number;
}) {
  const c2 = petalColor2 || petalColor;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none"
      style={{ transform: `rotate(${rotate}deg)`, display: "block" }}>
      {/* Pétalos exteriores */}
      <ellipse cx="30" cy="14" rx="4" ry="10" fill={petalColor} opacity="0.75" transform="rotate(0 30 30)"/>
      <ellipse cx="30" cy="14" rx="4" ry="10" fill={c2}         opacity="0.65" transform="rotate(45 30 30)"/>
      <ellipse cx="30" cy="14" rx="4" ry="10" fill={petalColor} opacity="0.70" transform="rotate(90 30 30)"/>
      <ellipse cx="30" cy="14" rx="4" ry="10" fill={c2}         opacity="0.60" transform="rotate(135 30 30)"/>
      <ellipse cx="30" cy="14" rx="4" ry="10" fill={petalColor} opacity="0.70" transform="rotate(180 30 30)"/>
      <ellipse cx="30" cy="14" rx="4" ry="10" fill={c2}         opacity="0.62" transform="rotate(225 30 30)"/>
      <ellipse cx="30" cy="14" rx="4" ry="10" fill={petalColor} opacity="0.68" transform="rotate(270 30 30)"/>
      <ellipse cx="30" cy="14" rx="4" ry="10" fill={c2}         opacity="0.60" transform="rotate(315 30 30)"/>
      {/* Pétalos interiores */}
      <ellipse cx="30" cy="18" rx="2.5" ry="7" fill="#D4A832"   opacity="0.55" transform="rotate(22 30 30)"/>
      <ellipse cx="30" cy="18" rx="2.5" ry="7" fill="#D4A832"   opacity="0.50" transform="rotate(67 30 30)"/>
      <ellipse cx="30" cy="18" rx="2.5" ry="7" fill="#D4A832"   opacity="0.50" transform="rotate(112 30 30)"/>
      <ellipse cx="30" cy="18" rx="2.5" ry="7" fill="#D4A832"   opacity="0.50" transform="rotate(157 30 30)"/>
      <ellipse cx="30" cy="18" rx="2.5" ry="7" fill="#D4A832"   opacity="0.50" transform="rotate(202 30 30)"/>
      <ellipse cx="30" cy="18" rx="2.5" ry="7" fill="#D4A832"   opacity="0.50" transform="rotate(247 30 30)"/>
      <ellipse cx="30" cy="18" rx="2.5" ry="7" fill="#D4A832"   opacity="0.50" transform="rotate(292 30 30)"/>
      <ellipse cx="30" cy="18" rx="2.5" ry="7" fill="#D4A832"   opacity="0.50" transform="rotate(337 30 30)"/>
      {/* Centro */}
      <circle cx="30" cy="30" r="5"   fill="#D4A832" opacity="0.85"/>
      <circle cx="30" cy="30" r="2.8" fill="#A86020" opacity="0.90"/>
    </svg>
  );
}

// Hoja SVG simple
function Leaf({ size, color, rotate }: { size: number; color: string; rotate: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none"
      style={{ transform: `rotate(${rotate}deg)`, display: "block" }}>
      <path d="M20 36 Q6 24 8 10 Q16 18 20 36Z" fill={color} opacity="0.55"/>
      <path d="M20 36 Q34 24 32 10 Q24 18 20 36Z" fill={color} opacity="0.45"/>
      <path d="M20 10 Q20 20 20 36" stroke={color} strokeWidth="0.8" opacity="0.4" strokeLinecap="round"/>
    </svg>
  );
}

// Arreglo floral completo — flores + hojas asimétricas
export default function FloralAccent({
  x, y, side, rotate = 0, size = 70,
  petalColor, petalColor2, opacity = 1,
}: FloralAccentProps) {
  const c2 = petalColor2 || petalColor;
  const flip = side === "right" ? "scaleX(-1)" : undefined;

  return (
    <div style={{
      position: "absolute",
      [side === "left" ? "left" : "right"]: x,
      [y.startsWith("top") ? "top" : "bottom"]: y.replace("top:", "").replace("bottom:", "").trim(),
      pointerEvents: "none",
      opacity,
      transform: flip,
      zIndex: 0,
    }}>
      <div style={{ position: "relative", width: size * 2.2, height: size * 2.4 }}>
        {/* Flor principal */}
        <div style={{ position: "absolute", top: 0, left: size * 0.3 }}>
          <Bloom size={size} petalColor={petalColor} petalColor2={c2} rotate={rotate} />
        </div>
        {/* Flor secundaria más pequeña */}
        <div style={{ position: "absolute", top: size * 0.55, left: 0 }}>
          <Bloom size={size * 0.65} petalColor={c2} petalColor2={petalColor} rotate={rotate + 25} />
        </div>
        {/* Flor terciaria */}
        <div style={{ position: "absolute", top: size * 0.35, left: size * 1.2 }}>
          <Bloom size={size * 0.50} petalColor={petalColor} petalColor2={c2} rotate={rotate - 15} />
        </div>
        {/* Hojas */}
        <div style={{ position: "absolute", top: size * 1.1, left: size * 0.1 }}>
          <Leaf size={size * 0.7} color="#7A9438" rotate={-30} />
        </div>
        <div style={{ position: "absolute", top: size * 0.9, left: size * 1.0 }}>
          <Leaf size={size * 0.55} color="#7A9438" rotate={20} />
        </div>
        <div style={{ position: "absolute", top: size * 1.5, left: size * 0.5 }}>
          <Leaf size={size * 0.45} color="#5A7A28" rotate={5} />
        </div>
      </div>
    </div>
  );
}