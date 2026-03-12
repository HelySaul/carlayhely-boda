"use client";
import { useEffect, useRef, useState } from "react";

function LoaderFlower({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <path d="M27 42 Q25 35 27 27" stroke="#7A9438" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
      <path d="M27 36 Q21 32 20 27 Q24 30 27 36Z" fill="#7A9438" opacity="0.28"/>
      <path d="M27 34 Q33 30 34 25 Q30 28 27 34Z" fill="#7A9438" opacity="0.24"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#D4693A" opacity="0.22" transform="rotate(0 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#D4693A" opacity="0.20" transform="rotate(45 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#C94F4F" opacity="0.18" transform="rotate(90 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#C94F4F" opacity="0.18" transform="rotate(135 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#D4693A" opacity="0.20" transform="rotate(180 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#D4693A" opacity="0.18" transform="rotate(225 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#C94F4F" opacity="0.16" transform="rotate(270 27 27)"/>
      <ellipse cx="27" cy="18" rx="3" ry="6.5" fill="#C94F4F" opacity="0.16" transform="rotate(315 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.24" transform="rotate(22 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.22" transform="rotate(67 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.22" transform="rotate(112 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.22" transform="rotate(157 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.22" transform="rotate(202 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.22" transform="rotate(247 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.22" transform="rotate(292 27 27)"/>
      <ellipse cx="27" cy="20" rx="2" ry="4.5" fill="#D4A832" opacity="0.22" transform="rotate(337 27 27)"/>
      <circle cx="27" cy="27" r="3.5" fill="#D4A832" opacity="0.45"/>
      <circle cx="27" cy="27" r="1.8" fill="#D4693A" opacity="0.60"/>
    </svg>
  );
}

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"in" | "visible" | "out">("in");
  const called = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    const t1 = setTimeout(() => setPhase("visible"), 80);

    const minTime = new Promise<void>(res => { t2 = setTimeout(res, 4200); });
    Promise.all([minTime, document.fonts.ready]).then(() => {
      setPhase("out");
      t3 = setTimeout(() => {
        if (!called.current) { called.current = true; onCompleteRef.current(); }
      }, 900);
    });

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      backgroundColor: "var(--cream)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1)",
      opacity: phase === "out" ? 0 : 1,
      pointerEvents: phase === "out" ? "none" : "all",
    }}>

      {/* Ramo superior */}
      <div style={{
        display: "flex", gap: "4px", marginBottom: "1.8rem",
        opacity: phase === "in" ? 0 : 1,
        transform: phase === "in" ? "translateY(-8px)" : "translateY(0)",
        transition: "opacity 1s ease 0.3s, transform 1s cubic-bezier(0.22,1,0.36,1) 0.3s",
      }}>
        <div style={{ transform: "rotate(20deg) scaleX(-1) translateY(6px)" }}><LoaderFlower size={32} /></div>
        <div style={{ transform: "rotate(-5deg) translateY(-2px)" }}><LoaderFlower size={44} /></div>
        <div style={{ transform: "rotate(-20deg) translateY(6px)" }}><LoaderFlower size={32} /></div>
      </div>

      <p style={{
        fontFamily: "'Pinyon Script', cursive",
        fontSize: "clamp(3.2rem, 14vw, 5.5rem)",
        color: "var(--ink)", lineHeight: 1,
        opacity: phase === "in" ? 0 : 1,
        letterSpacing: phase === "in" ? "0.3em" : "0.05em",
        transition: "opacity 1s ease, letter-spacing 1.2s cubic-bezier(0.22,1,0.36,1)",
      }}>
        Carla &amp; Hely
      </p>
      <div style={{
        marginTop: "1.4rem",
        width: phase === "in" ? "0px" : "180px", height: "1px",
        background: "linear-gradient(90deg, transparent, var(--red), var(--terracotta), transparent)",
        transition: "width 1.1s cubic-bezier(0.22,1,0.36,1) 0.4s",
      }} />
      <p style={{
        marginTop: "1rem",
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        fontSize: "0.85rem", color: "var(--ink-light)",
        letterSpacing: "0.25em",
        opacity: phase === "in" ? 0 : 1,
        transition: "opacity 0.9s ease 0.7s",
      }}>
        13 · 06 · 2026
      </p>

      {/* Ramo inferior */}
      <div style={{
        display: "flex", gap: "4px", marginTop: "1.8rem",
        opacity: phase === "in" ? 0 : 1,
        transform: phase === "in" ? "translateY(8px)" : "translateY(0)",
        transition: "opacity 1s ease 0.5s, transform 1s cubic-bezier(0.22,1,0.36,1) 0.5s",
      }}>
        <div style={{ transform: "rotate(-20deg) scaleX(-1) translateY(-6px)" }}><LoaderFlower size={28} /></div>
        <div style={{ transform: "rotate(5deg) translateY(2px)" }}><LoaderFlower size={38} /></div>
        <div style={{ transform: "rotate(20deg) translateY(-6px)" }}><LoaderFlower size={28} /></div>
      </div>

    </div>
  );
}