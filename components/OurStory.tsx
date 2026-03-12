"use client";
import Reveal from "./Reveal";
import FloralAccent from "./FloralAccent";

const MOMENTS = [
  { label: "El comienzo", text: "Dos caminos que parecían distintos, unidos por algo más grande que nosotros. Así comenzó todo — sin prisa, sin presión, solo con la certeza de que algo especial estaba naciendo." },
  { label: "Crecer juntos", text: "Aprendimos a conocernos de verdad, a reírnos de lo mismo, a sostenernos en lo difícil. Cada momento compartido fue confirmando lo que el corazón ya sabía desde el principio." },
  { label: "Para siempre", text: "Y aquí estamos, eligiéndonos a propósito, listos para escribir el capítulo más bonito. No porque sea perfecto, sino porque es nuestro." },
];

export default function OurStory() {
  return (
    <section id="nosotros" style={{ padding: "6rem 1.5rem", background: "var(--bg-story)", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Manchas decorativas */}
      <div style={{ position: "absolute", top: "-5%", left: "-8%", width: "clamp(150px,35vw,280px)", height: "clamp(150px,35vw,280px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,105,58,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FloralAccent side="right" x="-15px" y="top: 5%" size={72} petalColor="#9B8BB4" petalColor2="#C94F4F" rotate={-25} opacity={0.80} />
      <div style={{ position: "absolute", bottom: "-5%", right: "-8%", width: "clamp(120px,30vw,240px)", height: "clamp(120px,30vw,240px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>

        <Reveal>
          <p className="sans" style={{ fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "0.8rem" }}>nuestra historia</p>
          <h2 className="script" style={{ fontSize: "clamp(3rem,14vw,6rem)", color: "var(--ink)", lineHeight: 1 }}>Nuestra Historia</h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div style={{ margin: "1.6rem auto 0", display: "flex", alignItems: "center", gap: "1rem", maxWidth: "300px" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, var(--blush-light))" }} />
            <span className="serif" style={{ color: "var(--red)", fontSize: "1.1rem", fontStyle: "italic" }}>♡</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, var(--blush-light), transparent)" }} />
          </div>
        </Reveal>

        {/* Foto placeholder */}
        <Reveal delay={0.2}>
          <div style={{ margin: "3rem auto", width: "100%", maxWidth: "300px", aspectRatio: "3/4", borderRadius: "2px", background: "linear-gradient(160deg, var(--blush-pale) 0%, var(--cream-deep) 50%, var(--cream-mid) 100%)", border: "1px solid var(--border-medium)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: "10px", border: "1px solid var(--border-subtle)", borderRadius: "1px", pointerEvents: "none" }} />
            <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-light)", fontSize: "0.9rem", letterSpacing: "0.1em" }}>Carla Victoria &amp; Hely Saul</p>
            <div style={{ width: "40px", height: "1px", background: "var(--blush-light)", margin: "0.8rem auto" }} />
            <p className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", letterSpacing: "0.15em", textTransform: "uppercase" }}>fotografía próximamente</p>
          </div>
        </Reveal>

        {/* Timeline */}
        <div style={{ textAlign: "left" }}>
          {MOMENTS.map((m, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <div style={{ display: "flex", gap: "1.4rem", marginBottom: i < MOMENTS.length - 1 ? "2.5rem" : 0, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: "0.25rem" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", border: "1.5px solid var(--red)", background: "var(--cream)" }} />
                  {i < MOMENTS.length - 1 && <div style={{ width: "1px", flexGrow: 1, background: "linear-gradient(180deg, var(--blush-light), transparent)", minHeight: "3rem", marginTop: "4px" }} />}
                </div>
                <div>
                  <p className="serif" style={{ fontStyle: "italic", color: "var(--red)", fontSize: "0.9rem", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>{m.label}</p>
                  <p className="sans" style={{ color: "var(--ink-mid)", fontSize: "0.88rem", lineHeight: 1.75, fontWeight: 300 }}>{m.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}