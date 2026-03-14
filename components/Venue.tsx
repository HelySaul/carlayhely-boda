"use client";
import Reveal from "./Reveal";
import FloralAccent from "./FloralAccent";

const TIPS = [
  { label: "Al aire libre",   desc: "La ceremonia y la fiesta se celebran en espacios abiertos. Un cielo como techo, naturaleza como decoración.", color: "var(--olive)" },
  { label: "Calzado cómodo",  desc: "El terreno es de jardín. Tacones muy finos pueden dificultar el caminar; un tacón ancho o plataforma funciona perfecto.", color: "var(--terracotta)" },
  { label: "Clima de junio",  desc: "La vía Coro–Churuguara es conocida por su brisa fresca, especialmente en la noche. Te recomendamos llevar algo de abrigo para disfrutar la velada con total comodidad.", color: "var(--gold)" },
  { label: "Estacionamiento", desc: "Hay espacio disponible en el local. Llegar con tiempo te garantizará un buen lugar.", color: "var(--red)" },
];

export default function Venue() {
  return (
    <section id="lugar" style={{ padding: "6rem 1.5rem", background: "var(--bg-venue)", textAlign: "center", position: "relative", overflow: "visible" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-5%", right: "0", width: "clamp(160px,38vw,300px)", height: "clamp(160px,38vw,300px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      </div>
      <div style={{ position: "absolute", bottom: "10%", left: "0", width: "clamp(120px,28vw,220px)", height: "clamp(120px,28vw,220px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,50,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FloralAccent side="right" x="-10px" y="bottom: -30px" size={85} petalColor="#7A9438" petalColor2="#D4A832" rotate={-5} opacity={0.70} />
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

        {/* Mapa embed — satelital */}
        <Reveal delay={0.22}>
          <div style={{ padding: "8px", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ padding: "6px", border: "1px solid var(--gold-line)", borderRadius: "1px" }}>
              <div style={{ overflow: "hidden", borderRadius: "1px" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3921.!2d-69.5855451!3d11.3661906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e842bfeee5f598d%3A0xf403a1c864647f4f!2sCentro%20Recreacional%20Brisas%20del%20Renacer!5e0!3m2!1ses!2sve!4v1&maptype=satellite"
                  width="100%"
                  height="230"
                  style={{ border: 0, display: "block", filter: "saturate(0.85) brightness(1.02)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Botón */}
        <Reveal delay={0.28}>
          <a href="https://maps.app.goo.gl/oxGza7wqVdfY5rWN6" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", padding: "0.85rem 2.2rem", border: "1px solid var(--terracotta)", color: "var(--terracotta)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", fontWeight: 400, borderRadius: "1px", marginBottom: "3rem", transition: "background 0.3s ease, color 0.3s ease" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "var(--terracotta)"; el.style.color = "var(--cream)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.color = "var(--terracotta)"; }}
          >Cómo llegar</a>
        </Reveal>

        {/* Tips */}
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