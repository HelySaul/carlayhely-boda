"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ── PaginaConfirmar ───────────────────────────────────────────────────────────
// app/confirmar/[codigo]/[ronda]/page.tsx

interface Invitado {
  id: string;
  nombre: string;
  whatsapp: string | null;
  confirmacion_1: boolean | null;
  confirmacion_2: boolean | null;
  confirmacion_3: boolean | null;
  [key: string]: boolean | string | null;
}
interface Invitacion {
  id: string;
  codigo: string;
  invitados: Invitado[];
}

function primerNombre(nombre: string) { return nombre.split(" ")[0]; }
function saludoNombres(invitados: Invitado[]) {
  const p = invitados.map(i => primerNombre(i.nombre));
  if (p.length === 1) return p[0];
  return p.slice(0, -1).join(", ") + " y " + p[p.length - 1];
}

const RONDAS = {
  1: {
    titulo: "¡Estás invitado a nuestra boda!",
    subtitulo: (n: string) => `${n}, nos hace muy felices contarte que eres parte de nuestra lista de invitados.`,
    cuerpo: `Para poder organizarlo todo con amor y atención, vamos a hacer 3 confirmaciones a lo largo de los próximos meses. Esta es la primera. Te pediremos confirmar dos veces más antes del gran día — lo hacemos así para asegurarnos de que cada detalle esté perfecto para recibirte.`,
    disclaimer: `Solo quienes confirmen su asistencia en al menos una de las rondas podrán ingresar al evento.`,
    btnSi: "¡Sí, confirmo!", btnNo: "No podré ir",
  },
  2: {
    titulo: "¡Ya casi llegamos!",
    subtitulo: (n: string) => `${n}, gracias por estar presente desde el principio.`,
    cuerpo: `Esta es la segunda de tres confirmaciones. Solo queda una más después de esta — prometemos que no son más. Queremos asegurarnos de que todo esté listo para recibirte como mereces.`,
    disclaimer: null,
    btnSi: "Confirmo que voy", btnNo: "No podré ir",
  },
  3: {
    titulo: "¡El gran día se acerca!",
    subtitulo: (n: string) => `${n}, ya falta muy poquito y queremos tenerte en cada detalle.`,
    cuerpo: `Esta es la confirmación final. Después de esta no habrá más rondas. Si no has podido confirmar en ninguna de las tres, lamentablemente no podremos garantizar tu entrada al evento — pero si algo cambió y sí puedes venir, ¡este es tu momento!`,
    disclaimer: `Las personas que confirmaron que no asistirán no recibirán más solicitudes. Si cambiaste de opinión, contáctanos directamente — haremos todo lo posible, aunque los espacios son limitados y hay muchas personas que también quieren acompañarnos.`,
    btnSi: "¡Confirmo que voy!", btnNo: "No podré ir",
  },
};

function Separador() {
  return (
    <div style={{ width: "50px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832, transparent)", margin: "0 auto 1.2rem" }} />
  );
}

function BloqueVerBoda() {
  return (
    <Link href="/" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        marginTop: "1.4rem",
        background: "linear-gradient(135deg, rgba(212,168,50,0.10) 0%, rgba(212,105,58,0.08) 100%)",
        border: "1px solid rgba(212,168,50,0.30)",
        borderRadius: "3px", padding: "1.2rem 1.4rem", textAlign: "center", cursor: "pointer",
      }}>
        <p className="serif" style={{ fontStyle: "italic", fontSize: "0.88rem", color: "#5C4A42", lineHeight: 1.75, marginBottom: "0.8rem" }}>
          Preparamos una página especial para ustedes, llena de todo lo que necesitan saber sobre nosotros y sobre este día tan importante. La hicimos con mucho amor para que puedan vivirlo con nosotros desde ya.
        </p>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#D4693A", borderBottom: "1px solid rgba(212,105,58,0.4)", paddingBottom: "0.2rem" }}>
          Conoce nuestra historia y todos los detalles de la boda →
        </span>
      </div>
    </Link>
  );
}

function Manchas() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "45%", height: "45%", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,79,79,0.10) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: "35%", height: "35%", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.10) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", top: "40%", left: "10%", width: "25%", height: "25%", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,50,0.08) 0%, transparent 70%)" }} />
    </div>
  );
}

export default function PaginaConfirmar() {
  const { codigo, ronda: rondaParam } = useParams<{ codigo: string; ronda: string }>();
  const ronda = (Math.min(3, Math.max(1, isNaN(parseInt(rondaParam)) ? 1 : parseInt(rondaParam)))) as 1 | 2 | 3;

  const [inv, setInv] = useState<Invitacion | null>(null);
  const [error, setError] = useState("");
  const [confirmaciones, setConfirmaciones] = useState<Record<string, boolean>>({});
  const [declinados, setDeclinados] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  const [yaRespondio, setYaRespondio] = useState(false);

  useEffect(() => {
    fetch(`/api/invitacion?codigo=${codigo}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setInv(d);
        const conf: Record<string, boolean> = {};
        const dec: Record<string, boolean> = {};
        const campoActual = ronda === 1 ? "confirmacion_1" : ronda === 2 ? "confirmacion_2" : "confirmacion_3";
        const campoAnterior = ronda === 2 ? "confirmacion_1" : ronda === 3 ? "confirmacion_2" : null;
        const yaRespondioRonda = d.invitados.some((i: Invitado) => i[campoActual] !== null);
        d.invitados.forEach((i: Invitado) => {
          if (yaRespondioRonda) {
            conf[i.id] = i[campoActual] === true;
            dec[i.id]  = i[campoActual] === false;
          } else if (campoAnterior && i[campoAnterior] !== null) {
            conf[i.id] = i[campoAnterior] === true;
            dec[i.id]  = i[campoAnterior] === false;
          } else {
            conf[i.id] = false;
            dec[i.id]  = false;
          }
        });
        setYaRespondio(yaRespondioRonda);
        setConfirmaciones(conf);
        setDeclinados(dec);
      })
      .catch(() => setError("No pudimos cargar tu invitación."));
  }, [codigo, ronda]);

  async function confirmar() {
    if (!inv) return;
    setEnviando(true);
    await fetch("/api/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, ronda, confirmaciones: inv.invitados.map(i => ({ id: i.id, asiste: confirmaciones[i.id] === true })) }),
    });
    setEnviando(false);
    setListo(true);
  }

  const fondoPage: React.CSSProperties = {
    minHeight: "100svh",
    background: "linear-gradient(160deg, #FDFAF6 0%, #FAF2EA 60%, #F6F8F2 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "2.5rem 1rem",
  };

  const tarjetaStyle: React.CSSProperties = {
    background: "linear-gradient(160deg, #FDFAF6 0%, #FAF2EA 60%, #F6F8F2 100%)",
    borderRadius: "3px",
    padding: "2.4rem 1.8rem 2rem",
    boxShadow: "0 12px 50px rgba(80,40,30,0.14), 0 2px 10px rgba(80,40,30,0.08)",
    position: "relative", overflow: "hidden",
  };

  const lineaDecor = (
    <div style={{ width: "80px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,168,50,0.6), transparent)", margin: "0.7rem auto 0.8rem" }} />
  );

  const pieDecor = (
    <p className="sans" style={{ textAlign: "center", fontSize: "0.44rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#C0AFA0", marginTop: "1rem" }}>
      Carla &amp; Hely · 13 · 06 · 2026
    </p>
  );

  // ── error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div style={fondoPage}>
      <p className="serif" style={{ fontStyle: "italic", color: "#9A8880", textAlign: "center" }}>{error}</p>
    </div>
  );

  // ── cargando ──────────────────────────────────────────────────────────────
  if (!inv) return (
    <div style={fondoPage}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: "36px", height: "36px", border: "1.5px solid #D4A832", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  const msg = RONDAS[ronda];
  const esIndividual = inv.invitados.length === 1;
  const todoMarcado = inv.invitados.every(i => confirmaciones[i.id] === true || declinados[i.id] === true);
  const nombres = saludoNombres(inv.invitados);
  const alguienVa = inv.invitados.some(i => confirmaciones[i.id] === true);

  // ── ya respondió ──────────────────────────────────────────────────────────
  if (yaRespondio) return (
    <div style={fondoPage}>
      <div style={{ width: "min(420px, 100%)", position: "relative" }}>
        <div style={tarjetaStyle}>
          <Manchas />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
              <p className="sans" style={{ fontSize: "0.45rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.5rem" }}>
                Confirmación · Ronda {ronda} de 3
              </p>
              <h1 className="script" style={{ fontSize: "clamp(2.8rem,14vw,4rem)", color: "#2C2320", lineHeight: 1 }}>
                {alguienVa ? "¡Nos vemos pronto!" : "Lo entendemos"}
              </h1>
              {lineaDecor}
              <p className="serif" style={{ fontStyle: "italic", fontSize: "0.95rem", color: "#5C4A42", lineHeight: 1.75 }}>
                {alguienVa
                  ? "Ya confirmaste tu asistencia en esta ronda. Tu respuesta está guardada."
                  : "Ya registramos que no podrás acompañarnos. Gracias por avisarnos."}
              </p>
            </div>

            <Separador />

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.6rem" }}>
              {inv.invitados.map(i => (
                <div key={i.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  background: confirmaciones[i.id]
                    ? "radial-gradient(ellipse at left, rgba(122,148,56,0.10) 0%, transparent 80%)"
                    : "radial-gradient(ellipse at left, rgba(201,79,79,0.07) 0%, transparent 80%)",
                  border: `1px solid ${confirmaciones[i.id] ? "rgba(122,148,56,0.30)" : "rgba(201,79,79,0.22)"}`,
                  borderRadius: "2px",
                }}>
                  <span className="serif" style={{ fontSize: "1rem", color: "#2C2320" }}>{i.nombre}</span>
                  <span className="sans" style={{ fontSize: "0.52rem", letterSpacing: "0.14em", textTransform: "uppercase", color: confirmaciones[i.id] ? "#7A9438" : "#C94F4F" }}>
                    {confirmaciones[i.id] ? "✓ Va" : "No va"}
                  </span>
                </div>
              ))}
            </div>

            <BloqueVerBoda />
            {pieDecor}
          </div>
        </div>
      </div>
    </div>
  );

  // ── éxito recién envió ────────────────────────────────────────────────────
  if (listo) return (
    <div style={fondoPage}>
      <div style={{ width: "min(420px, 100%)", position: "relative" }}>
        <div style={tarjetaStyle}>
          <Manchas />
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p className="sans" style={{ fontSize: "0.45rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.5rem" }}>
              Confirmación · Ronda {ronda} de 3
            </p>
            <h1 className="script" style={{ fontSize: "clamp(3rem,14vw,4.2rem)", color: "#C94F4F", lineHeight: 1 }}>
              Gracias
            </h1>
            {lineaDecor}
            <p className="serif" style={{ fontStyle: "italic", fontSize: "0.95rem", color: "#5C4A42", lineHeight: 1.75 }}>
              {ronda === 3
                ? "¡Nos vemos el 13 de Junio! Tu presencia hará este día aún más especial."
                : ronda === 2
                  ? "Estaremos en contacto pronto con los últimos detalles."
                  : "Recibimos tu respuesta. Estaremos en contacto pronto."}
            </p>
            <BloqueVerBoda />
            {pieDecor}
          </div>
        </div>
      </div>
    </div>
  );

  // ── formulario ────────────────────────────────────────────────────────────
  return (
    <div style={fondoPage}>
      <div style={{ width: "min(420px, 100%)", position: "relative" }}>
        <div style={tarjetaStyle}>
          <Manchas />
          <div style={{ position: "relative", zIndex: 1 }}>

            {/* Encabezado */}
            <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
              <p className="sans" style={{ fontSize: "0.45rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.5rem" }}>
                Carla &amp; Hely · Confirmación · Ronda {ronda} de 3
              </p>
              <h1 className="script" style={{ fontSize: "clamp(2.4rem,12vw,3.4rem)", color: "#2C2320", lineHeight: 1.05, marginBottom: "0.5rem" }}>
                {msg.titulo}
              </h1>
              {lineaDecor}
              <p className="serif" style={{ fontStyle: "italic", fontSize: "0.95rem", color: "#5C4A42", lineHeight: 1.7 }}>
                {msg.subtitulo(nombres)}
              </p>
            </div>

            <Separador />

            {/* Cuerpo */}
            <div style={{
              background: "linear-gradient(135deg, rgba(212,168,50,0.07) 0%, rgba(212,105,58,0.05) 100%)",
              border: "1px solid rgba(212,168,50,0.22)", borderRadius: "2px",
              padding: "1rem 1.2rem", marginBottom: "1.3rem",
            }}>
              <p className="serif" style={{ fontStyle: "italic", fontSize: "0.92rem", color: "#5C4A42", lineHeight: 1.75 }}>
                {msg.cuerpo}
              </p>
            </div>

            {/* Disclaimer */}
            {msg.disclaimer && (
              <div style={{
                background: "radial-gradient(ellipse at top left, rgba(201,79,79,0.06) 0%, transparent 70%)",
                border: "1px solid rgba(201,79,79,0.18)", borderRadius: "2px",
                padding: "0.9rem 1.1rem", marginBottom: "1.3rem",
                display: "flex", gap: "0.7rem", alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "0.85rem", flexShrink: 0, marginTop: "0.1rem" }}>🔒</span>
                <p className="serif" style={{ fontStyle: "italic", fontSize: "0.88rem", color: "#7A3030", lineHeight: 1.7, margin: 0 }}>
                  {msg.disclaimer}
                </p>
              </div>
            )}

            {/* Botones individual */}
            {esIndividual ? (
              <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.3rem" }}>
                <button
                  onClick={() => { setConfirmaciones({ ...confirmaciones, [inv.invitados[0].id]: true }); setDeclinados({ ...declinados, [inv.invitados[0].id]: false }); }}
                  style={{
                    flex: 1, padding: "0.95rem",
                    background: confirmaciones[inv.invitados[0].id] ? "linear-gradient(135deg, #7A9438, #9AB060)" : "transparent",
                    color: confirmaciones[inv.invitados[0].id] ? "white" : "#7A9438",
                    border: `1.5px solid ${confirmaciones[inv.invitados[0].id] ? "#7A9438" : "rgba(122,148,56,0.45)"}`,
                    borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >✓ {msg.btnSi}</button>
                <button
                  onClick={() => { setDeclinados({ ...declinados, [inv.invitados[0].id]: true }); setConfirmaciones({ ...confirmaciones, [inv.invitados[0].id]: false }); }}
                  style={{
                    flex: 1, padding: "0.95rem",
                    background: declinados[inv.invitados[0].id] ? "linear-gradient(135deg, #C94F4F, #D4693A)" : "transparent",
                    color: declinados[inv.invitados[0].id] ? "white" : "#9A8880",
                    border: `1.5px solid ${declinados[inv.invitados[0].id] ? "#C94F4F" : "rgba(154,136,128,0.35)"}`,
                    borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
                    fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >{msg.btnNo}</button>
              </div>
            ) : (
              /* Botones grupal */
              <div style={{ marginBottom: "1.3rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {inv.invitados.map(i => (
                  <div key={i.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    background: confirmaciones[i.id]
                      ? "radial-gradient(ellipse at left, rgba(122,148,56,0.08) 0%, transparent 80%)"
                      : declinados[i.id]
                        ? "radial-gradient(ellipse at left, rgba(201,79,79,0.06) 0%, transparent 80%)"
                        : "transparent",
                    border: `1px solid ${confirmaciones[i.id] ? "rgba(122,148,56,0.28)" : declinados[i.id] ? "rgba(201,79,79,0.20)" : "rgba(212,168,50,0.20)"}`,
                    borderRadius: "2px", transition: "all 0.2s",
                  }}>
                    <span className="serif" style={{ fontSize: "1rem", color: "#2C2320" }}>{i.nombre}</span>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => { setConfirmaciones({ ...confirmaciones, [i.id]: true }); setDeclinados({ ...declinados, [i.id]: false }); }}
                        style={{
                          padding: "0.4rem 0.85rem",
                          background: confirmaciones[i.id] ? "linear-gradient(135deg, #7A9438, #9AB060)" : "transparent",
                          color: confirmaciones[i.id] ? "white" : "#7A9438",
                          border: "1.5px solid rgba(122,148,56,0.55)", borderRadius: "2px",
                          fontFamily: "'Montserrat', sans-serif", fontSize: "0.58rem",
                          letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
                        }}
                      >Sí</button>
                      <button
                        onClick={() => { setDeclinados({ ...declinados, [i.id]: true }); setConfirmaciones({ ...confirmaciones, [i.id]: false }); }}
                        style={{
                          padding: "0.4rem 0.85rem",
                          background: declinados[i.id] ? "linear-gradient(135deg, #C94F4F, #D4693A)" : "transparent",
                          color: declinados[i.id] ? "white" : "#9A8880",
                          border: `1.5px solid ${declinados[i.id] ? "#C94F4F" : "rgba(154,136,128,0.35)"}`,
                          borderRadius: "2px", fontFamily: "'Montserrat', sans-serif", fontSize: "0.58rem",
                          letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
                        }}
                      >No</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botón enviar */}
            <button
              onClick={confirmar}
              disabled={enviando || !todoMarcado}
              style={{
                width: "100%", padding: "0.9rem",
                background: todoMarcado ? "linear-gradient(135deg, #C94F4F, #D4693A)" : "rgba(200,185,170,0.35)",
                color: todoMarcado ? "white" : "#B5A090",
                border: todoMarcado ? "none" : "1px solid rgba(181,160,144,0.4)",
                borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
                fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase",
                cursor: todoMarcado ? "pointer" : "not-allowed",
                transition: "all 0.25s", marginBottom: "0.4rem",
              }}
            >
              {enviando ? "Enviando..." : "Guardar respuesta"}
            </button>

            <BloqueVerBoda />
            {pieDecor}

          </div>
        </div>
      </div>
    </div>
  );
}