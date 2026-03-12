"use client";
import { useEffect, useRef, useState } from "react";

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const called = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    const minTime = new Promise<void>(res => { t1 = setTimeout(res, 4200); });
    Promise.all([minTime, document.fonts.ready]).then(() => {
      setPhase("out");
      t2 = setTimeout(() => {
        if (!called.current) { called.current = true; onCompleteRef.current(); }
      }, 800);
    });
    return () => { clearTimeout(t1!); clearTimeout(t2!); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      backgroundColor: "var(--cream)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      transition: "opacity 0.8s cubic-bezier(0.22,1,0.36,1)",
      opacity: phase === "out" ? 0 : 1,
      pointerEvents: phase === "out" ? "none" : "all",
    }}>
      <p style={{
        fontFamily: "'Monsieur La Doulaise', cursive",
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
    </div>
  );
}