"use client";
import Reveal from "./Reveal";

const DRESSCODE = [
  { who: "Damas",      code: "Vestido o traje de gala. Siéntanse libres de lucir su estilo — la única consideración es evitar el blanco, reservado para la novia." },
  { who: "Caballeros", code: "Traje formal o vestimenta elegante. Cualquier color o estilo que los haga sentir bien." },
  { who: "Niñas",      code: "Vestido elegante. Cualquier color que les guste." },
  { who: "Niños",      code: "Traje o camisa con pantalón formal." },
];

export default function Palette() {
  return (
    <section
      id="dresscode"
      style={{
        padding:    "6rem 1.5rem",
        background: "var(--bg-dresscode)",
        textAlign:  "center",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Manchas decorativas */}
      <div style={{ position: "absolute", top: "-5%", left: "-8%", width: "clamp(160px,36vw,280px)", height: "clamp(160px,36vw,280px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(155,139,180,0.20) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "-6%", width: "clamp(120px,28vw,220px)", height: "clamp(120px,28vw,220px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,105,58,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>

        <Reveal>
          <p className="sans" style={{ fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--wood)", marginBottom: "0.8rem" }}>
            viste parte de nuestra historia
          </p>
          <h2 className="script" style={{ fontSize: "clamp(3rem, 14vw, 6rem)", color: "var(--ink)", lineHeight: 1 }}>
            Dress Code
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "2.5rem auto" }} />
        </Reveal>

        <Reveal delay={0.2}>
          <div style={{ textAlign: "left" }}>
            {DRESSCODE.map((item, i) => (
              <div
                key={i}
                style={{
                  display:      "flex",
                  gap:          "1.2rem",
                  padding:      "1.2rem 0",
                  borderBottom: i < DRESSCODE.length - 1 ? "1px solid rgba(184,151,106,0.15)" : "none",
                  alignItems:   "flex-start",
                }}
              >
                <p
                  className="serif"
                  style={{
                    fontStyle:     "italic",
                    color:         "var(--blush)",
                    fontSize:      "0.9rem",
                    letterSpacing: "0.04em",
                    flexShrink:    0,
                    minWidth:      "90px",
                    paddingTop:    "0.1rem",
                  }}
                >
                  {item.who}
                </p>
                <p className="sans" style={{ color: "var(--ink-mid)", fontSize: "0.85rem", lineHeight: 1.7, fontWeight: 300 }}>
                  {item.code}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}