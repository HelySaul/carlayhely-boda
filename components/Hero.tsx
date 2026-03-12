"use client";
import { useEffect, useState } from "react";
import FloralAccent from "./FloralAccent";

const TARGET = new Date("2026-06-13T16:00:00");
function pad(n: number) { return String(n).padStart(2, "0"); }

function Countdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = TARGET.getTime() - Date.now();
      if (diff <= 0) return;
      setT({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: "flex", gap: "clamp(1rem,5vw,2.5rem)", justifyContent: "center", alignItems: "flex-end" }}>
      {[{ v: t.d, l: "días" }, { v: t.h, l: "horas" }, { v: t.m, l: "min" }, { v: t.s, l: "seg" }].map(({ v, l }) => (
        <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span className="serif" style={{ fontSize: "clamp(2rem,9vw,3.5rem)", color: "var(--ink)", fontWeight: 300, lineHeight: 1 }}>{pad(v)}</span>
          <span className="sans" style={{ fontSize: "0.58rem", color: "var(--ink-light)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: "0.4rem" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section style={{
      minHeight: "100svh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "6rem 1.5rem 4rem", textAlign: "center",
      background: "var(--bg-hero)",
      position: "relative", overflow: "visible",
    }}>
      {/* Manchas — clip propio para no crear scroll horizontal */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "clamp(220px,55vw,420px)", height: "clamp(220px,55vw,420px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,79,79,0.22) 0%, rgba(212,105,58,0.10) 50%, transparent 75%)" }} />
        <div style={{ position: "absolute", bottom: "0%", left: "-10%", width: "clamp(180px,45vw,340px)", height: "clamp(180px,45vw,340px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.22) 0%, rgba(122,148,56,0.08) 55%, transparent 75%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "5%", width: "clamp(80px,18vw,140px)", height: "clamp(80px,18vw,140px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,50,0.18) 0%, transparent 70%)" }} />
      </div>

      {/* Tulipanes — fuera del clip, libres */}
      <FloralAccent side="left"  x="-8px" y="bottom: -30px" size={100} petalColor="#C94F4F" petalColor2="#D4693A" rotate={8}  opacity={0.72} />
      <FloralAccent side="right" x="-8px" y="top: -25px"    size={88}  petalColor="#D4A832" petalColor2="#9B8BB4" rotate={-10} opacity={0.68} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "520px", width: "100%" }}>
        <p className="serif" style={{ fontStyle: "italic", fontSize: "clamp(0.85rem,2.5vw,1rem)", color: "var(--ink-light)", letterSpacing: "0.15em", marginBottom: "1.6rem", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "opacity 1s ease 0.1s, transform 1s cubic-bezier(0.22,1,0.36,1) 0.1s" }}>
          Sábado · 13 de Junio · 2026
        </p>

        <h1 className="script" style={{ fontSize: "clamp(4.5rem,22vw,9rem)", color: "var(--ink)", lineHeight: 0.95, letterSpacing: "0.02em", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 1.1s ease 0.25s, transform 1.1s cubic-bezier(0.22,1,0.36,1) 0.25s" }}>Carla</h1>

        <p className="serif" style={{ fontSize: "clamp(1rem,3.5vw,1.4rem)", color: "var(--red)", letterSpacing: "0.5em", fontStyle: "italic", margin: "0.4rem 0", opacity: visible ? 1 : 0, transition: "opacity 1.1s ease 0.4s" }}>&amp;</p>

        <h1 className="script" style={{ fontSize: "clamp(4.5rem,22vw,9rem)", color: "var(--ink)", lineHeight: 0.95, letterSpacing: "0.02em", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "opacity 1.1s ease 0.38s, transform 1.1s cubic-bezier(0.22,1,0.36,1) 0.38s" }}>Hely</h1>

        <div style={{ margin: "2rem auto 1.8rem", opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.7s" }}>
          <svg viewBox="0 0 320 24" fill="none" style={{ width: "100%", maxWidth: "320px", height: "24px", display: "block", margin: "0 auto" }}>
            <path d="M10 12 Q80 4 160 12 Q240 20 310 12" stroke="var(--red)" strokeWidth="0.8" strokeLinecap="round" className="svg-draw" />
            <circle cx="160" cy="12" r="2.5" fill="none" stroke="var(--terracotta)" strokeWidth="0.8" className="svg-draw" />
            <path d="M148 12 Q154 7 160 12 Q166 17 172 12" stroke="var(--terracotta)" strokeWidth="0.8" strokeLinecap="round" className="svg-draw" />
          </svg>
        </div>

        <p className="serif" style={{ fontStyle: "italic", fontSize: "clamp(1rem,3.5vw,1.15rem)", color: "var(--ink-mid)", lineHeight: 1.65, maxWidth: "360px", margin: "0 auto 0.5rem", opacity: visible ? 1 : 0, transition: "opacity 1s ease 0.85s" }}>
          "Todo lo hizo hermoso en su tiempo"
        </p>
        <p className="sans" style={{ fontSize: "0.68rem", color: "var(--terracotta)", letterSpacing: "0.18em", textTransform: "uppercase", opacity: visible ? 1 : 0, transition: "opacity 1s ease 1s" }}>
          Eclesiastés 3 · 11
        </p>

        <div style={{ marginTop: "2.5rem", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "opacity 1s ease 1.1s, transform 1s cubic-bezier(0.22,1,0.36,1) 1.1s" }}>
          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "0 auto 1.8rem" }} />
          <Countdown />
        </div>

        <div style={{ marginTop: "2.2rem", opacity: visible ? 1 : 0, transition: "opacity 1s ease 1.25s" }}>
          <span className="serif" style={{ display: "inline-block", fontStyle: "italic", fontSize: "clamp(0.78rem,2.5vw,0.9rem)", color: "var(--ink-light)", letterSpacing: "0.08em", borderBottom: "1px solid var(--gold-line)", paddingBottom: "0.3rem" }}>
            Brisas del Renacer · Vía Coro–Churuguara, Falcón
          </span>
        </div>

        <div style={{ marginTop: "3.5rem", opacity: visible ? 1 : 0, transition: "opacity 1s ease 1.5s" }}>
          <svg viewBox="0 0 24 32" fill="none" style={{ width: "18px", margin: "0 auto", display: "block" }}>
            <rect x="7" y="1" width="10" height="18" rx="5" stroke="var(--terracotta)" strokeWidth="1"/>
            <circle cx="12" cy="7" r="2" fill="var(--terracotta)">
              <animate attributeName="cy" values="7;11;7" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </div>
    </section>
  );
}