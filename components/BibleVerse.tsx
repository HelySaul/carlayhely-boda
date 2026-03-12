"use client";
import Reveal from "./Reveal";

interface BibleVerseProps { verse: string; reference: string; }

function Flower({ size = 54 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none" style={{ flexShrink: 0 }}>
      {/* Tallo */}
      <path d="M27 42 Q25 35 27 27" stroke="#7A9438" strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      {/* Hojas */}
      <path d="M27 36 Q21 32 20 27 Q24 30 27 36Z" fill="#7A9438" opacity="0.35"/>
      <path d="M27 34 Q33 30 34 25 Q30 28 27 34Z" fill="#7A9438" opacity="0.30"/>
      {/* Pétalos exteriores */}
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#D4693A" opacity="0.28" transform="rotate(0 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#D4693A" opacity="0.24" transform="rotate(45 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#C94F4F" opacity="0.22" transform="rotate(90 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#C94F4F" opacity="0.22" transform="rotate(135 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#D4693A" opacity="0.24" transform="rotate(180 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#D4693A" opacity="0.22" transform="rotate(225 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#C94F4F" opacity="0.20" transform="rotate(270 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#C94F4F" opacity="0.20" transform="rotate(315 27 27)"/>
      {/* Pétalos interiores dorados */}
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.30" transform="rotate(22 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.28" transform="rotate(67 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.26" transform="rotate(112 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.26" transform="rotate(157 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.26" transform="rotate(202 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.26" transform="rotate(247 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.26" transform="rotate(292 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.26" transform="rotate(337 27 27)"/>
      {/* Centro */}
      <circle cx="27" cy="27" r="3.5" fill="#D4A832" opacity="0.55"/>
      <circle cx="27" cy="27" r="1.8" fill="#D4693A" opacity="0.70"/>
    </svg>
  );
}

function FloralSprig({ flip = false }: { flip?: boolean }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: flip ? "flex-end" : "flex-start",
      gap: "2px", opacity: 0.80,
      transform: flip ? "scaleX(-1)" : undefined,
    }}>
      <Flower size={44} />
      <div style={{ marginLeft: "14px", marginTop: "-10px" }}>
        <Flower size={32} />
      </div>
      <div style={{ marginLeft: "5px", marginTop: "-6px" }}>
        <Flower size={22} />
      </div>
    </div>
  );
}

export default function BibleVerse({ verse, reference }: BibleVerseProps) {
  return (
    <div style={{ padding: "3rem 1.5rem", background: "var(--cream-mid)", textAlign: "center", position: "relative", overflow: "hidden" }}>

      {/* Flores esquina izquierda */}
      <div style={{ position: "absolute", bottom: "6px", left: "6px", pointerEvents: "none" }}>
        <FloralSprig />
      </div>
      {/* Flores esquina derecha */}
      <div style={{ position: "absolute", bottom: "6px", right: "6px", pointerEvents: "none" }}>
        <FloralSprig flip />
      </div>

      <Reveal>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "1.6rem" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-line))" }} />
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="2.5" fill="var(--terracotta)" opacity="0.5"/>
              <circle cx="9" cy="9" r="5.5" stroke="var(--terracotta)" strokeWidth="0.8" fill="none" opacity="0.4"/>
            </svg>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, var(--gold-line), transparent)" }} />
          </div>

          <p className="serif" style={{ fontStyle: "italic", fontSize: "clamp(1rem,3.5vw,1.2rem)", color: "var(--ink-mid)", lineHeight: 1.8, marginBottom: "1rem" }}>
            &ldquo;{verse}&rdquo;
          </p>
          <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--terracotta)" }}>
            {reference}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginTop: "1.6rem" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-line))" }} />
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="2.5" fill="var(--terracotta)" opacity="0.5"/>
              <circle cx="9" cy="9" r="5.5" stroke="var(--terracotta)" strokeWidth="0.8" fill="none" opacity="0.4"/>
            </svg>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, var(--gold-line), transparent)" }} />
          </div>
        </div>
      </Reveal>
    </div>
  );
}