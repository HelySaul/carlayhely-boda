"use client";
import Reveal from "./Reveal";
import FloralAccent from "./FloralAccent";

const TIPS = [
  { label: "Al aire libre",   desc: "La ceremonia y la fiesta se celebran en espacios abiertos. Un cielo como techo, naturaleza como decoración.", color: "var(--olive)" },
  { label: "Calzado cómodo",  desc: "El terreno es de jardín. Tacones muy finos pueden dificultar el caminar; un tacón ancho o plataforma funciona perfecto.", color: "var(--terracotta)" },
  { label: "Clima de junio",  desc: "Junio en la vía Coro–Churuguara suele ser cálido. Considera un abanico y mantenerte hidratado durante la noche.", color: "var(--gold)" },
  { label: "Estacionamiento", desc: "Hay espacio disponible en el local. Llegar con tiempo te garantizará un buen lugar.", color: "var(--red)" },
];

export default function Venue() {
  return (
    <section id="lugar" style={{ padding: "6rem 1.5rem", background: "var(--bg-venue)", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Manchas decorativas */}
      <div style={{ position: "absolute", top: "-5%", right: "-8%", width: "clamp(160px,38vw,300px)", height: "clamp(160px,38vw,300px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "-6%", width: "clamp(120px,28vw,220px)", height: "clamp(120px,28vw,220px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,50,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FloralAccent side="right" x="-30px" y="bottom: -55px" size={75} petalColor="#7A9438" petalColor2="#D4A832" rotate={5}  opacity={0.82} />
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>

        <Reveal>
          <p className="sans" style={{ fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "0.8rem" }}>dónde nos encontramos</p>
          <h2 className="script" style={{ fontSize: "clamp(3rem,14vw,6rem)", color: "var(--ink)", lineHeight: 1 }}>El Lugar</h2>
        </Reveal>

        <Reveal delay={0.12}>
          <div style={{ margin: "2rem 0 0.5rem" }}>
            <h3 className="serif" style={{ fontSize: "clamp(1.4rem,5vw,1.9rem)", color: "var(--ink)", fontWeight: 400, letterSpacing: "0.03em" }}>Brisas del Renacer</h3>
            <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-light)", fontSize: "0.9rem", marginTop: "0.4rem", letterSpacing: "0.06em" }}>A 600 metros de la entrada de Zambrano, vía Coro–Churuguara</p>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)", margin: "1.5rem auto 2rem" }} />
        </Reveal>

        {/* Mapa placeholder */}
        <Reveal delay={0.22}>
          <div style={{ width: "100%", height: "230px", background: "linear-gradient(150deg, var(--cream-deep) 0%, var(--blush-pale) 100%)", border: "1px solid var(--border-subtle)", borderRadius: "2px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "1rem", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", inset: "8px", border: "1px solid var(--border-subtle)", borderRadius: "1px", pointerEvents: "none" }} />
            <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-light)", fontSize: "1rem" }}>Mapa próximamente</p>
            <p className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "0.5rem" }}>coordenadas del local</p>
          </div>
        </Reveal>

        {/* Botón */}
        <Reveal delay={0.28}>
          <a href="https://maps.google.com/?q=Brisas+del+Renacer+Coro+Churuguara+Falcon+Venezuela" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", padding: "0.85rem 2.2rem", border: "1px solid var(--terracotta)", color: "var(--terracotta)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", fontWeight: 400, borderRadius: "1px", marginBottom: "3rem", transition: "background 0.3s ease, color 0.3s ease" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "var(--terracotta)"; el.style.color = "var(--cream)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.color = "var(--terracotta)"; }}
          >Cómo llegar</a>
        </Reveal>

        {/* Tips con color por categoría */}
        <Reveal delay={0.1}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", textAlign: "left" }}>
            {TIPS.map((tip, i) => (
              <div key={i} style={{ padding: "1.4rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", borderTop: `2px solid ${tip.color}` }}>
                <p className="serif" style={{ fontStyle: "italic", color: tip.color, fontSize: "0.9rem", marginBottom: "0.5rem" }}>{tip.label}</p>
                <p className="sans" style={{ color: "var(--ink-mid)", fontSize: "0.78rem", lineHeight: 1.65, fontWeight: 300 }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}