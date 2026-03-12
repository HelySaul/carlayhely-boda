"use client";
import Reveal from "./Reveal";
import FloralAccent from "./FloralAccent";

const RULES = [
  { title: "La puntualidad es un regalo", text: "La ceremonia iniciará exactamente a las 6:00 PM. Te pedimos llegar con anticipación para que puedas acomodarte y ser parte de cada momento desde el principio — no querrás perderte nada.", color: "var(--red)" },
  { title: "Solo los invitados confirmados", text: "Por razones de organización y aforo, el acceso es exclusivo para quienes están en nuestra lista. Cada lugar fue reservado con mucho cariño.", color: "var(--terracotta)" },
  { title: "El personal está para servirte", text: "Nuestro equipo de mesoneros se encargará de atenderte con dedicación. Te pedimos esperar su indicación para acercarte a las mesas de comida y dulces.", color: "var(--olive)" },
  { title: "Cuida este espacio tan bello", text: "Brisas del Renacer es tan hermoso porque es cuidado con amor. Te pedimos mantenerlo así: respetar la decoración, las plantas y cada rincón del local.", color: "var(--gold)" },
  { title: "Todo a su tiempo", text: "Habrá momentos especiales a lo largo de la noche. El personal te indicará cuándo es cada uno. Déjate sorprender — lo mejor siempre vale la espera.", color: "var(--lavender)" },
  { title: "Sobre todo, disfruta", text: "Este día fue soñado para compartirlo contigo. Ríe, baila, celebra. Tu alegría es el regalo más hermoso que puedes darnos.", color: "var(--red)" },
];

const ROMAN = ["I","II","III","IV","V","VI"];

export default function Etiquette() {
  return (
    <section id="detalles" style={{ padding: "6rem 1.5rem", background: "var(--bg-details)", textAlign: "center", position: "relative", overflow: "visible" }}>
      {/* Manchas decorativas */}

      {/* Manchas — clip propio */}

      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>

      <div style={{ position: "absolute", top: "5%", right: "0", width: "clamp(140px,32vw,260px)", height: "clamp(140px,32vw,260px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />

      </div>
      <div style={{ position: "absolute", bottom: "0%", left: "0", width: "clamp(160px,36vw,280px)", height: "clamp(160px,36vw,280px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,79,79,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FloralAccent side="right" x="-10px" y="top: -25px" size={80} petalColor="#9B8BB4" petalColor2="#D4693A" rotate={-12} opacity={0.68} />
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>

        <Reveal>
          <p className="sans" style={{ fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "0.8rem" }}>para que todo fluya perfecto</p>
          <h2 className="script" style={{ fontSize: "clamp(3rem,14vw,6rem)", color: "var(--ink)", lineHeight: 1 }}>Detalles</h2>
          <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-light)", fontSize: "clamp(0.88rem,2.5vw,1rem)", marginTop: "0.8rem", lineHeight: 1.6 }}>Pequeñas consideraciones que hacen grande una celebración</p>
        </Reveal>

        <Reveal delay={0.12}>
          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "2rem auto 2.8rem" }} />
        </Reveal>

        <div style={{ textAlign: "left" }}>
          {RULES.map((rule, i) => (
            <Reveal key={i} delay={i * 0.09}>
              <div style={{ padding: "1.6rem 0", borderBottom: i < RULES.length - 1 ? "1px solid var(--border-subtle)" : "none", display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                <span className="serif" style={{ fontStyle: "italic", color: rule.color, fontSize: "1.2rem", flexShrink: 0, paddingTop: "0.1rem", minWidth: "1.4rem", textAlign: "right" }}>
                  {ROMAN[i]}
                </span>
                <div>
                  <h3 className="serif" style={{ fontSize: "clamp(1.05rem,3vw,1.2rem)", color: "var(--ink)", fontWeight: 400, marginBottom: "0.45rem" }}>{rule.title}</h3>
                  <p className="sans" style={{ color: "var(--ink-mid)", fontSize: "0.85rem", lineHeight: 1.75, fontWeight: 300 }}>{rule.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}