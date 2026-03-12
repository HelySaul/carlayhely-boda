"use client";
import Reveal from "./Reveal";

export default function Footer() {
  return (
    <footer style={{ padding: "5rem 1.5rem 4rem", background: "var(--bg-footer)", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Manchas decorativas */}
      <div style={{ position: "absolute", top: "-8%", left: "-8%", width: "clamp(180px,40vw,320px)", height: "clamp(180px,40vw,320px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,105,58,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-8%", right: "-6%", width: "clamp(160px,35vw,280px)", height: "clamp(160px,35vw,280px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Reveal>
        <svg viewBox="0 0 320 30" fill="none" style={{ width: "100%", maxWidth: "300px", height: "30px", margin: "0 auto 2.5rem", display: "block" }}>
          <path d="M0 15 Q80 5 160 15 Q240 25 320 15" stroke="var(--red)" strokeWidth="0.7" strokeLinecap="round" opacity="0.6"/>
          <path d="M60 15 Q90 8 120 15" stroke="var(--terracotta)" strokeWidth="0.6" strokeLinecap="round" opacity="0.7"/>
          <path d="M200 15 Q230 22 260 15" stroke="var(--terracotta)" strokeWidth="0.6" strokeLinecap="round" opacity="0.7"/>
          <circle cx="160" cy="15" r="3" fill="none" stroke="var(--red)" strokeWidth="0.7" opacity="0.8"/>
          <circle cx="160" cy="15" r="1.2" fill="var(--red)" opacity="0.6"/>
        </svg>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="script" style={{ fontSize: "clamp(3.5rem,16vw,7rem)", color: "var(--ink)", lineHeight: 1, letterSpacing: "0.02em" }}>Carla &amp; Hely</h2>
      </Reveal>

      <Reveal delay={0.2}>
        <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-light)", fontSize: "clamp(0.85rem,2.5vw,1rem)", letterSpacing: "0.1em", margin: "1rem 0 0.4rem" }}>13 de Junio · 2026</p>
        <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-light)", fontSize: "0.82rem", letterSpacing: "0.06em" }}>Brisas del Renacer · Vía Coro–Churuguara, Falcón</p>
      </Reveal>

      <Reveal delay={0.3}>
        <div style={{ margin: "2rem auto", maxWidth: "320px" }}>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-line), transparent)" }} />
          <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-mid)", fontSize: "clamp(0.88rem,2.8vw,1rem)", lineHeight: 1.7, padding: "1.5rem 0", letterSpacing: "0.02em" }}>
            "Todo lo hizo hermoso en su tiempo"
          </p>
          <p className="sans" style={{ fontSize: "0.6rem", color: "var(--terracotta)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Eclesiastés 3 · 11</p>
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-line), transparent)", marginTop: "1.5rem" }} />
        </div>
      </Reveal>

      <Reveal delay={0.4}>
        <p className="sans" style={{ fontSize: "0.62rem", color: "var(--ink-light)", letterSpacing: "0.1em", marginTop: "1.5rem" }}>Hecho con amor, para los que más queremos</p>
      </Reveal>
    </footer>
  );
}