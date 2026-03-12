"use client";
import Reveal from "./Reveal";
import FloralAccent from "./FloralAccent";

export default function Schedule() {
  return (
    <section id="programa" style={{ padding: "6rem 1.5rem", background: "var(--bg-program)", textAlign: "center", position: "relative", overflow: "visible" }}>
      {/* Manchas decorativas */}

      {/* Manchas — clip propio */}

      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>

      <div style={{ position: "absolute", top: "10%", right: "0", width: "clamp(140px,30vw,240px)", height: "clamp(140px,30vw,240px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(155,139,180,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

      </div>
      <div style={{ position: "absolute", bottom: "5%", left: "0", width: "clamp(120px,25vw,200px)", height: "clamp(120px,25vw,200px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <FloralAccent side="left" x="-12px" y="bottom: -30px" size={90} petalColor="#D4693A" petalColor2="#C94F4F" rotate={6} opacity={0.72} />
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>

        <Reveal>
          <p className="sans" style={{ fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "0.8rem" }}>el día especial</p>
          <h2 className="script" style={{ fontSize: "clamp(3rem,14vw,6rem)", color: "var(--ink)", lineHeight: 1 }}>Programa</h2>
        </Reveal>

        {/* Ornamento */}
        <Reveal delay={0.1}>
          <div style={{ margin: "1.8rem auto 2.5rem" }}>
            <svg viewBox="0 0 200 16" fill="none" style={{ width: "100%", maxWidth: "200px", height: "16px", display: "block", margin: "0 auto" }}>
              <path d="M0 8 Q50 2 100 8 Q150 14 200 8" stroke="var(--red)" strokeWidth="0.7" strokeLinecap="round" opacity="0.6"/>
              <circle cx="100" cy="8" r="2" fill="none" stroke="var(--terracotta)" strokeWidth="0.7"/>
            </svg>
          </div>
        </Reveal>

        {/* Ceremonia de Unión Matrimonial — card expandida */}
        <Reveal delay={0.12}>
          <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", borderLeft: "3px solid var(--olive)", padding: "2rem 1.6rem", textAlign: "left", marginBottom: "1.2rem" }}>
            <p className="sans" style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.7rem" }}>6:00 PM</p>
            <h3 className="serif" style={{ fontSize: "clamp(1.3rem,4vw,1.7rem)", color: "var(--ink)", fontWeight: 400, marginBottom: "1rem" }}>Ceremonia de Unión Matrimonial</h3>
            <p className="sans" style={{ color: "var(--ink-mid)", fontSize: "0.86rem", lineHeight: 1.8, fontWeight: 300, marginBottom: "1.1rem" }}>
              El momento más sagrado de nuestra celebración. Ante Dios y ante quienes más queremos, Carla y Hely se unirán en matrimonio, pronunciando sus votos y sellando con fe el pacto de amor que han construido juntos.
            </p>
            <p className="sans" style={{ color: "var(--ink-mid)", fontSize: "0.86rem", lineHeight: 1.8, fontWeight: 300, marginBottom: "1.6rem" }}>
              La ceremonia será un tiempo de adoración, reflexión y gozo. Habrá lectura de la Palabra, oración, y un mensaje especial para los novios — porque creemos que cuando Dios está en el centro, el amor crece sin límite.
            </p>

            {/* Divisor */}
            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-line), transparent)", margin: "1.4rem 0" }} />

            {/* Pastores */}
            <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "1rem" }}>Ministros de la ceremonia</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ width: "3px", borderRadius: "2px", background: "var(--olive)", alignSelf: "stretch", flexShrink: 0, minHeight: "2.5rem" }} />
                <div>
                  <p className="serif" style={{ fontStyle: "italic", color: "var(--ink)", fontSize: "0.95rem", marginBottom: "0.2rem" }}>Pastor Eduardo Matey</p>
                  <p className="sans" style={{ fontSize: "0.75rem", color: "var(--ink-light)", fontWeight: 300, letterSpacing: "0.04em" }}>Iglesia Rey de Reyes · Oficia la ceremonia</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ width: "3px", borderRadius: "2px", background: "var(--lavender)", alignSelf: "stretch", flexShrink: 0, minHeight: "2.5rem" }} />
                <div>
                  <p className="serif" style={{ fontStyle: "italic", color: "var(--ink)", fontSize: "0.95rem", marginBottom: "0.2rem" }}>Pastor Carlos Marín</p>
                  <p className="sans" style={{ fontSize: "0.75rem", color: "var(--ink-light)", fontWeight: 300, letterSpacing: "0.04em" }}>Iglesia Casa de mi Padre · Palabras a los novios</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Recepción */}
        <Reveal delay={0.24}>
          <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", borderLeft: "3px solid var(--terracotta)", padding: "2rem 1.6rem", textAlign: "left" }}>
            <p className="sans" style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.7rem" }}>7:30 PM</p>
            <h3 className="serif" style={{ fontSize: "clamp(1.3rem,4vw,1.7rem)", color: "var(--ink)", fontWeight: 400, marginBottom: "1rem" }}>Recepción & Celebración</h3>
            <p className="sans" style={{ color: "var(--ink-mid)", fontSize: "0.86rem", lineHeight: 1.8, fontWeight: 300, marginBottom: "1.1rem" }}>
              Terminada la ceremonia, la noche se abre para celebrar. Música en vivo, buena mesa y la gente que más queremos reunida en un solo lugar — así es como Carla y Hely quieren comenzar esta nueva etapa.
            </p>
            <p className="sans" style={{ color: "var(--ink-mid)", fontSize: "0.86rem", lineHeight: 1.8, fontWeight: 300, marginBottom: "1.6rem" }}>
              Habrá momentos especiales a lo largo de la noche: palabras de los padres, brindis, sorpresas y todo lo que hace única una celebración como esta. Déjate llevar — cada momento fue pensado con cariño para ti.
            </p>

            {/* Divisor */}
            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-line), transparent)", margin: "1.4rem 0" }} />

            {/* Momentos de la noche */}
            <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "1rem" }}>Lo que nos espera</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                "Música en vivo",
                "Palabras de los padres",
                "Brindis y momentos especiales",
                "Baile y celebración",
              ].map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--terracotta)", opacity: 0.5, flexShrink: 0 }} />
                  <p className="sans" style={{ fontSize: "0.82rem", color: "var(--ink-mid)", fontWeight: 300, letterSpacing: "0.03em" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <p className="serif" style={{ fontStyle: "italic", color: "var(--ink-mid)", fontSize: "clamp(0.88rem,2.5vw,1rem)", lineHeight: 1.7, letterSpacing: "0.02em", marginTop: "2.5rem" }}>
            La noche promete ser tan hermosa como nuestra historia.
          </p>
        </Reveal>
      </div>
    </section>
  );
}