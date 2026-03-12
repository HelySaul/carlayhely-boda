"use client";
import Reveal from "./Reveal";

export default function DriveSection() {
  const DRIVE_URL = "#"; // reemplazar con el link real

  return (
    <section
      id="fotos"
      style={{
        padding:    "6rem 1.5rem",
        background: "var(--bg-photos)",
        textAlign:  "center",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* Manchas decorativas */}
      <div style={{ position: "absolute", top: "-8%", right: "-8%", width: "clamp(160px,36vw,280px)", height: "clamp(160px,36vw,280px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-5%", left: "-6%", width: "clamp(140px,30vw,240px)", height: "clamp(140px,30vw,240px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(155,139,180,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>

        <Reveal>
          <p className="sans" style={{ fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--wood)", marginBottom: "0.8rem" }}>
            los recuerdos son de todos
          </p>
          <h2 className="script" style={{ fontSize: "clamp(3rem, 14vw, 6rem)", color: "var(--ink)", lineHeight: 1 }}>
            Comparte tus Fotos
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p
            className="serif"
            style={{
              fontStyle:   "italic",
              color:       "var(--ink-mid)",
              fontSize:    "clamp(0.95rem, 2.8vw, 1.1rem)",
              lineHeight:  1.75,
              margin:      "1.5rem auto 2.5rem",
              maxWidth:    "420px",
            }}
          >
            Queremos ver la noche desde tus ojos. Sube tus fotos y videos al álbum compartido y construyamos juntos el recuerdo de este día.
          </p>
        </Reveal>

        <Reveal delay={0.22}>
          {/* Marco decorativo */}
          <div
            style={{
              border:        "1px solid var(--border-medium)",
              borderRadius:  "2px",
              padding:       "2.5rem 2rem",
              background:    "var(--cream-mid)",
              position:      "relative",
            }}
          >
            {/* Esquinas decorativas */}
            {["top-left","top-right","bottom-left","bottom-right"].map((pos) => {
              const [v, h] = pos.split("-");
              return (
                <svg
                  key={pos}
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    position: "absolute",
                    width: "20px",
                    height: "20px",
                    top:    v === "top"    ? "6px" : "auto",
                    bottom: v === "bottom" ? "6px" : "auto",
                    left:   h === "left"   ? "6px" : "auto",
                    right:  h === "right"  ? "6px" : "auto",
                  }}
                >
                  <path
                    d={
                      pos === "top-left"     ? "M0 12 L0 0 L12 0"     :
                      pos === "top-right"    ? "M4 0 L16 0 L16 12"    :
                      pos === "bottom-left"  ? "M0 4 L0 16 L12 16"    :
                                              "M4 16 L16 16 L16 4"
                    }
                    stroke="var(--terracotta)"
                    strokeWidth="0.8"
                    fill="none"
                    opacity="0.6"
                  />
                </svg>
              );
            })}

            <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-light)", fontSize: "0.85rem", letterSpacing: "0.1em", marginBottom: "1.8rem" }}>
              Álbum compartido · Carla &amp; Hely · 2026
            </p>

            <a
              href={DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:        "inline-block",
                padding:        "0.9rem 2.5rem",
                border:         "1px solid var(--blush)",
                color:          "var(--blush)",
                fontFamily:     "'Montserrat', sans-serif",
                fontSize:       "0.68rem",
                letterSpacing:  "0.22em",
                textTransform:  "uppercase",
                textDecoration: "none",
                fontWeight:     400,
                borderRadius:   "1px",
                transition:     "background 0.3s ease, color 0.3s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--blush)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--cream)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--blush)"; }}
            >
              Abrir álbum
            </a>

            <p className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", letterSpacing: "0.12em", marginTop: "1.4rem" }}>
              El enlace estará disponible el día de la boda
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}