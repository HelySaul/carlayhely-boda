"use client";
import Reveal from "./Reveal";

interface BibleVerseProps { verse: string; reference: string; }

export default function BibleVerse({ verse, reference }: BibleVerseProps) {
  return (
    <div style={{ padding: "3rem 1.5rem", background: "var(--cream-mid)", textAlign: "center", position: "relative", zIndex: 1 }}>

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