"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

interface Invitado {
  id: string;
  nombre: string;
  whatsapp: string | null;
  sexo: "M" | "F" | null;
  confirmacion_1: boolean;
  confirmacion_2: boolean;
  confirmacion_3: boolean;
}
interface Invitacion {
  id: string;
  codigo: string;
  nombre: string | null;
  invitados: Invitado[];
}

function nombresLista(invitados: Invitado[]) {
  if (invitados.length === 1) return invitados[0].nombre;
  const todos = invitados.map(i => i.nombre.split(" ")[0]);
  return todos.slice(0, -1).join(", ") + " y " + todos[todos.length - 1];
}
function saludo(invitados: Invitado[]) {
  if (invitados.length === 1) {
    const i = invitados[0];
    const t = i.sexo === "F" ? "Querida" : i.sexo === "M" ? "Querido" : "Querido/a";
    return `${t} ${i.nombre.split(" ")[0]},`;
  }
  const primeros = invitados.map(i => i.nombre.split(" ")[0]);
  const todasF = invitados.every(i => i.sexo === "F");
  return `${todasF ? "Queridas" : "Queridos"} ${primeros.slice(0, -1).join(", ")} y ${primeros[primeros.length - 1]},`;
}

// ── Tulipán SVG (igual que Hero) ────────────────────────
function TulipSVG({ size, petalColor, petalColor2, rotate = 0 }: {
  size: number; petalColor: string; petalColor2?: string; rotate?: number;
}) {
  const c2 = petalColor2 || petalColor;
  return (
    <svg width={size * 0.55} height={size} viewBox="0 0 44 80" fill="none"
      style={{ transform: `rotate(${rotate}deg)`, display: "block", overflow: "visible" }}>
      <path d="M22 78 Q21 58 22 44" stroke="#7A9438" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M21 62 Q10 52 12 42 Q18 54 21 58Z" fill="#7A9438" opacity="0.55"/>
      <path d="M23 56 Q34 46 32 36 Q26 48 23 52Z" fill="#7A9438" opacity="0.45"/>
      <path d="M22 44 Q10 40 8 26 Q10 14 16 10 Q18 22 22 30Z" fill={petalColor} opacity="0.80"/>
      <path d="M22 44 Q34 40 36 26 Q34 14 28 10 Q26 22 22 30Z" fill={c2} opacity="0.75"/>
      <path d="M22 44 Q16 34 16 20 Q18 8 22 6 Q26 8 28 20 Q28 34 22 44Z" fill={petalColor} opacity="0.70"/>
      <path d="M20 16 Q21 12 22 10 Q22 16 21 22Z" fill="white" opacity="0.18"/>
    </svg>
  );
}

export default function PaginaInvitacion() {
  const { codigo } = useParams<{ codigo: string }>();
  const router = useRouter();
  const [inv, setInv] = useState<Invitacion | null>(null);
  const [error, setError] = useState("");
  const [fase, setFase] = useState<"sobre" | "cortando" | "abriendo" | "abierto" | "gracias">("sobre");
  const [cortePct, setCortePct] = useState(0);
  const [confirmaciones, setConfirmaciones] = useState<Record<string, boolean>>({});
  const [whatsapps, setWhatsapps] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [declinados, setDeclinados] = useState<Record<string, boolean>>({});
  const [rondaActual, setRondaActual] = useState(1);
  // animación de apertura
  const [solapaAngulo, setSolapaAngulo] = useState(0); // 0→-180 grados

  const sobreRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/invitacion?codigo=${codigo}`).then(r => r.json()),
      fetch(`/api/config`).then(r => r.json()),
    ]).then(([d, cfg]) => {
      if (d.error) { setError(d.error); return; }
      setInv(d);
      setRondaActual(cfg.ronda ?? 1);
      const conf: Record<string, boolean> = {};
      const dec: Record<string, boolean> = {};
      d.invitados.forEach((i: Invitado) => { conf[i.id] = false; dec[i.id] = false; });
      setConfirmaciones(conf);
      setDeclinados(dec);
    }).catch(() => setError("No pudimos cargar tu invitación."));
  }, [codigo]);

  function getX(e: React.TouchEvent | React.MouseEvent) {
    if ("touches" in e) return e.touches[0].clientX;
    return (e as React.MouseEvent).clientX;
  }

  function onDragStart(e: React.TouchEvent | React.MouseEvent) {
    if (fase !== "sobre") return;
    dragStart.current = { x: getX(e) };
    setFase("cortando");
  }

  function onDragMove(e: React.TouchEvent | React.MouseEvent) {
    if (fase !== "cortando" || !dragStart.current || !sobreRef.current) return;
    const delta = getX(e) - dragStart.current.x;
    const rect = sobreRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, (delta / rect.width) * 160));
    setCortePct(pct);
    if (pct >= 100) abrirSobre();
  }

  function onDragEnd() {
    if (fase === "cortando" && cortePct < 100) {
      setFase("sobre");
      setCortePct(0);
      dragStart.current = null;
    }
  }

  function abrirSobre() {
    dragStart.current = null;
    setFase("abriendo");
    setCortePct(100);
    // Animar la solapa abriéndose lentamente
    let angulo = 0;
    const step = () => {
      angulo -= 1.2; // ~2.5 segundos para abrir completamente
      setSolapaAngulo(angulo);
      if (angulo > -180) {
        requestAnimationFrame(step);
      } else {
        setTimeout(() => setFase("abierto"), 600);
      }
    };
    requestAnimationFrame(step);
  }

  async function confirmar() {
    if (!inv) return;
    setEnviando(true);
    const lista = inv.invitados.map(i => ({
      id: i.id, asiste: confirmaciones[i.id] === true,
      whatsapp: whatsapps[i.id] || undefined,
    }));
    await fetch("/api/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, ronda: 1, confirmaciones: lista }),
    });
    setEnviando(false);
    setFase("gracias");
    setTimeout(() => router.push("/"), 3500);
  }

  if (error) return (
    <div style={{ minHeight: "100svh", background: "#FDFAF6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <p style={{ fontFamily: "'Montserrat',sans-serif", color: "#9B8BB4", textAlign: "center" }}>{error}</p>
    </div>
  );
  if (!inv) return (
    <div style={{ minHeight: "100svh", background: "#FDFAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "40px", height: "40px", border: "2px solid #C94F4F", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const esIndividual = inv.invitados.length === 1;
  const todosConfirmaron = inv.invitados.every(i => i.confirmacion_1);
  const algunoConfirmo = inv.invitados.some(i => i.confirmacion_1);
  const hayAlgunoSinWpp = inv.invitados.some(i => !i.whatsapp && confirmaciones[i.id]);

  // Interpolación de la solapa durante la apertura
  const solapaAbierta = fase === "abriendo" || fase === "abierto";
  const solapaY = solapaAbierta
    ? Math.max(108 - Math.abs(solapaAngulo) * 1.2, -100)
    : 108 - cortePct * 0.5;

  return (
    <div style={{
      minHeight: "100svh",
      background: "linear-gradient(160deg, #FDFAF6 0%, #FAF2EA 50%, #F6F8F2 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: "'Montserrat', sans-serif",
      position: "relative", overflow: "hidden",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        @font-face { font-family: 'PinyonScript'; src: url('/fonts/PinyonScript-Regular.ttf'); }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes sobreFloat { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-6px) rotate(0.5deg)} }
        @keyframes tarjetaSube { 0%{opacity:0;transform:translateY(50px) scale(0.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes graciasFade { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
        @keyframes hintar { 0%,100%{transform:translateX(0)} 50%{transform:translateX(8px)} }
        .tarjeta-entra { animation: tarjetaSube 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
        .gracias-entra { animation: graciasFade 0.6s ease forwards; }
      `}</style>

      {/* ── Manchas de fondo — igual que Hero ─────── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "0", width: "clamp(220px,55vw,420px)", height: "clamp(220px,55vw,420px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,79,79,0.18) 0%, rgba(212,105,58,0.08) 50%, transparent 75%)" }} />
        <div style={{ position: "absolute", bottom: "0%", left: "0", width: "clamp(180px,45vw,340px)", height: "clamp(180px,45vw,340px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.18) 0%, rgba(122,148,56,0.06) 55%, transparent 75%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "5%", width: "clamp(80px,18vw,140px)", height: "clamp(80px,18vw,140px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,50,0.14) 0%, transparent 70%)" }} />
      </div>

      {/* ── Tulipanes laterales — FUERA del sobre, flanqueándolo ── */}
      {/* Izquierdo — abajo */}
      <div style={{ position: "absolute", left: "0", bottom: "0", pointerEvents: "none", opacity: 0.75, zIndex: 10 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <TulipSVG size={120} petalColor="#C94F4F" petalColor2="#D4693A" rotate={6} />
          <div style={{ position: "absolute", bottom: 0, left: 38 }}>
            <TulipSVG size={85} petalColor="#D4693A" petalColor2="#C94F4F" rotate={-4} />
          </div>
        </div>
      </div>
      {/* Derecho — arriba, espejado */}
      <div style={{ position: "absolute", right: "0", top: "0", pointerEvents: "none", opacity: 0.68, transform: "scaleX(-1)", zIndex: 10 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <TulipSVG size={105} petalColor="#D4A832" petalColor2="#9B8BB4" rotate={-8} />
          <div style={{ position: "absolute", bottom: 0, left: 33 }}>
            <TulipSVG size={75} petalColor="#9B8BB4" petalColor2="#D4A832" rotate={-16} />
          </div>
        </div>
      </div>

      {/* ── FASE: SOBRE ─────────────────────────────── */}
      {(fase === "sobre" || fase === "cortando" || fase === "abriendo") && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.8rem", position: "relative", zIndex: 1 }}>

          {/* Carla & Hely encima */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'PinyonScript', serif", fontSize: "3rem", color: "#2C2320", lineHeight: 1, marginBottom: "0.25rem" }}>
              Carla <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: "#C94F4F", fontStyle: "italic" }}>&amp;</span> Hely
            </p>
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.32em", textTransform: "uppercase", color: "#9A8880" }}>
              Tienes una invitación
            </p>
          </div>

          {/* El sobre — cerrado elegante */}
          <div
            ref={sobreRef}
            onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
            onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
            style={{
              position: "relative",
              width: "min(340px, 88vw)", height: "min(230px, 60vw)",
              cursor: fase === "sobre" ? "grab" : fase === "cortando" ? "grabbing" : "default",
              userSelect: "none", touchAction: "none",
              filter: "drop-shadow(0 16px 48px rgba(80,40,30,0.16)) drop-shadow(0 4px 12px rgba(80,40,30,0.10))",
              animation: fase === "sobre" ? "sobreFloat 4s ease-in-out infinite" : "none",
            }}
          >
            <svg viewBox="0 0 340 230" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sobreFondo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF"/>
                  <stop offset="100%" stopColor="#F9F3F0"/>
                </linearGradient>
                <linearGradient id="sobreSombra" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(180,140,130,0.08)"/>
                  <stop offset="100%" stopColor="rgba(180,140,130,0.18)"/>
                </linearGradient>
                <linearGradient id="solapaSup" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF"/>
                  <stop offset="100%" stopColor="#F4ECEB"/>
                </linearGradient>
                <linearGradient id="solapaInf" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#F0E8E5"/>
                  <stop offset="100%" stopColor="#F9F3F0"/>
                </linearGradient>
                <linearGradient id="lateralL" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EDE5E2"/>
                  <stop offset="100%" stopColor="#F9F3F0"/>
                </linearGradient>
                <linearGradient id="lateralR" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#EAE2DF"/>
                  <stop offset="100%" stopColor="#F9F3F0"/>
                </linearGradient>
                {/* Patrón de puntos finos */}
                <pattern id="dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="8" cy="8" r="0.7" fill="#C8B0A8" opacity="0.3"/>
                </pattern>
                <filter id="suave">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(160,100,80,0.12)"/>
                </filter>
              </defs>

              {/* Cuerpo del sobre */}
              <rect x="1" y="1" width="338" height="228" rx="4" fill="url(#sobreFondo)" stroke="#E0D0C8" strokeWidth="0.8"/>
              {/* Textura puntitos sutil */}
              <rect x="1" y="1" width="338" height="228" rx="4" fill="url(#dots)"/>

              {/* Solapa inferior (sobre cerrado — se ve siempre) */}
              <polygon points="1,229 170,130 339,229" fill="url(#solapaInf)" stroke="#E0D0C8" strokeWidth="0.6"/>

              {/* Solapas laterales */}
              <polygon points="1,1 1,229 118,128" fill="url(#lateralL)" stroke="#DDD0CA" strokeWidth="0.5"/>
              <polygon points="339,1 339,229 222,128" fill="url(#lateralR)" stroke="#DDD0CA" strokeWidth="0.5"/>

              {/* Solapa superior — animada al abrir */}
              <polygon
                points={`1,1 339,1 170,${solapaY}`}
                fill="url(#solapaSup)"
                stroke="#E0D0C8" strokeWidth="0.6"
              />

              {/* Borde decorativo interior — línea fina rosa */}
              <rect x="8" y="8" width="324" height="214" rx="3" fill="none" stroke="#E8C8C0" strokeWidth="0.5" opacity="0.7"/>

              {/* Sello superior centrado — como un lacre */}
              <g transform="translate(170, 38)">
                {/* Fondo blanco del sello */}
                <circle cx="0" cy="0" r="28" fill="white" stroke="#E8C8C0" strokeWidth="0.8"/>
                {/* Círculo punteado interior */}
                <circle cx="0" cy="0" r="23" fill="none" stroke="#D4A8A0" strokeWidth="0.5" strokeDasharray="2.5,2.5"/>
                {/* Iniciales */}
                <text x="0" y="-2" textAnchor="middle" fontFamily="'PinyonScript', serif" fontSize="20" fill="#C94F4F" opacity="0.9">C &amp; H</text>
                <text x="0" y="12" textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontSize="4.5" fill="#9A8880" letterSpacing="2.5">2026</text>
              </g>

              {/* Línea de corte al deslizar */}
              {fase === "cortando" && cortePct > 3 && (
                <>
                  <line
                    x1="1" y1="1.5"
                    x2={1 + (cortePct / 100) * 338} y2="1.5"
                    stroke="#C94F4F" strokeWidth="1.2" strokeLinecap="round"
                    opacity={0.5} strokeDasharray="5,3"
                  />
                  <g transform={`translate(${1 + (cortePct / 100) * 338}, 1)`} opacity="0.75">
                    <circle cx="0" cy="0" r="5" fill="white" stroke="#C94F4F" strokeWidth="0.8"/>
                    <text x="0" y="3.5" textAnchor="middle" fontSize="6" fill="#C94F4F">✂</text>
                  </g>
                </>
              )}

              {/* Interior visible al abrir */}
              {solapaAbierta && (
                <rect x="8" y="8" width="324" height="110" rx="2"
                  fill="rgba(253,250,246,0.6)" opacity={Math.min(1, Math.abs(solapaAngulo) / 80)}
                />
              )}
            </svg>
          </div>

          {/* Instrucción */}
          {fase === "sobre" && (
            <div style={{ textAlign: "center", animation: "hintar 2.5s ease-in-out infinite" }}>
              <p className="serif" style={{ fontStyle: "italic", fontSize: "0.92rem", color: "#9A8880", letterSpacing: "0.04em" }}>
                Desliza hacia la derecha para abrir
              </p>
              <p className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#D4693A", marginTop: "0.35rem", opacity: 0.7 }}>
                ────── ✂ ──────
              </p>
            </div>
          )}
          {fase === "cortando" && cortePct > 0 && (
            <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C94F4F" }}>
              Sigue abriendo...
            </p>
          )}
          {fase === "abriendo" && (
            <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A8880" }}>
              Abriendo...
            </p>
          )}

          {/* Botón fallback */}
          {fase === "sobre" && (
            <button
              onClick={() => abrirSobre()}
              style={{
                background: "none", border: "1px solid #D4693A",
                padding: "0.65rem 2.2rem", borderRadius: "2px",
                fontFamily: "'Montserrat',sans-serif", fontSize: "0.58rem",
                letterSpacing: "0.28em", textTransform: "uppercase",
                color: "#D4693A", cursor: "pointer",
              }}
            >
              Toca para abrir
            </button>
          )}
        </div>
      )}

      {/* ── FASE: ABIERTO — tarjeta ─────────────── */}
      {fase === "abierto" && (
        <div className="tarjeta-entra" style={{ width: "min(420px, 95vw)", maxHeight: "90svh", overflowY: "auto", position: "relative", zIndex: 1 }}>
          <Tarjeta
            inv={inv}
            esIndividual={esIndividual}
            todosConfirmaron={todosConfirmaron}
            algunoConfirmo={algunoConfirmo}
            rondaActual={rondaActual}
            codigo={codigo}
          />
        </div>
      )}

      {/* ── FASE: GRACIAS ───────────────────────── */}
      {fase === "gracias" && (
        <div className="gracias-entra" style={{ textAlign: "center", padding: "2rem", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "'PinyonScript', serif", fontSize: "3.5rem", color: "#C94F4F", marginBottom: "1rem" }}>Gracias</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#5A4535", fontStyle: "italic", marginBottom: "0.5rem" }}>
            {esIndividual
              ? `Tu respuesta nos llena de alegría, ${inv.invitados[0].nombre.split(" ")[0]}.`
              : `Su respuesta nos llena de alegría.`}
          </p>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#B5A090" }}>
            Redirigiendo...
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tarjeta de invitación ──────────────────────────────
function Tarjeta({ inv, esIndividual, todosConfirmaron, algunoConfirmo, rondaActual, codigo }: {
  inv: Invitacion; esIndividual: boolean;
  todosConfirmaron: boolean; algunoConfirmo: boolean;
  rondaActual: number; codigo: string;
}) {
  return (
    <div style={{
      background: "linear-gradient(160deg, #FDFAF6 0%, #FAF2EA 60%, #F6F8F2 100%)",
      borderRadius: "3px",
      boxShadow: "0 12px 50px rgba(80,40,30,0.14), 0 2px 10px rgba(80,40,30,0.08)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "row",
    }}>

      {/* ── Franja lateral izquierda con tulipanes ── */}
      <div style={{
        width: "56px", flexShrink: 0,
        background: "linear-gradient(180deg, #FDFAF6 0%, #F9F0E8 50%, #F5EDE0 100%)",
        borderRight: "1px solid rgba(212,168,50,0.25)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "1.2rem",
        gap: "0",
      }}>
        {/* Línea dorada vertical */}
        <div style={{ position: "absolute", top: "12px", bottom: "12px", left: "50%", width: "1px", background: "linear-gradient(180deg, transparent, rgba(212,168,50,0.4) 20%, rgba(212,168,50,0.4) 80%, transparent)", transform: "translateX(-50%)" }} />

        {/* Tulipanes verticales */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", paddingTop: "8px" }}>
          {/* Tulipán 1 — rojo */}
          <TulipMini color1="#C94F4F" color2="#D4693A" stem="#7A9438" offsetX={2} rotate={4} />
          {/* Línea entre */}
          <div style={{ width: "1px", height: "18px", background: "linear-gradient(180deg, rgba(212,168,50,0.3), rgba(212,168,50,0.5))" }} />
          {/* Tulipán 2 — dorado */}
          <TulipMini color1="#D4A832" color2="#C94F4F" stem="#7A9438" offsetX={-2} rotate={-3} />
          <div style={{ width: "1px", height: "18px", background: "linear-gradient(180deg, rgba(212,168,50,0.5), rgba(212,168,50,0.3))" }} />
          {/* Tulipán 3 — lavanda */}
          <TulipMini color1="#9B8BB4" color2="#D4A832" stem="#7A9438" offsetX={2} rotate={5} />
          <div style={{ width: "1px", height: "18px", background: "linear-gradient(180deg, rgba(212,168,50,0.3), rgba(212,168,50,0.5))" }} />
          {/* Tulipán 4 — terracotta */}
          <TulipMini color1="#D4693A" color2="#9B8BB4" stem="#7A9438" offsetX={-2} rotate={-4} />
          <div style={{ width: "1px", height: "18px", background: "linear-gradient(180deg, rgba(212,168,50,0.5), rgba(212,168,50,0.3))" }} />
          {/* Tulipán 5 — rojo */}
          <TulipMini color1="#C94F4F" color2="#D4693A" stem="#7A9438" offsetX={1} rotate={3} />
        </div>
      </div>

      {/* ── Contenido principal ── */}
      <div style={{ flex: 1, padding: "2.4rem 1.6rem 2rem 1.4rem", position: "relative" }}>

        {/* Manchas de fondo */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-20%", right: "-5%", width: "55%", height: "55%", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,79,79,0.10) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "-15%", right: "5%", width: "40%", height: "40%", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.09) 0%, transparent 70%)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* C & H — logo grande arriba */}
          <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
            <h1 className="script" style={{ fontSize: "clamp(3.2rem,15vw,4.8rem)", color: "#2C2320", lineHeight: 0.95 }}>Carla</h1>
            <p className="serif" style={{ fontSize: "1rem", color: "#C94F4F", letterSpacing: "0.5em", fontStyle: "italic", margin: "0.15rem 0" }}>&amp;</p>
            <h1 className="script" style={{ fontSize: "clamp(3.2rem,15vw,4.8rem)", color: "#2C2320", lineHeight: 0.95 }}>Hely</h1>

            {/* Separador ondulado */}
            <div style={{ margin: "0.9rem auto 0", maxWidth: "220px" }}>
              <svg viewBox="0 0 280 20" fill="none" style={{ width: "100%", height: "20px", display: "block" }}>
                <path d="M10 10 Q70 3 140 10 Q210 17 270 10" stroke="#C94F4F" strokeWidth="0.8" strokeLinecap="round"/>
                <circle cx="140" cy="10" r="2" fill="none" stroke="#D4693A" strokeWidth="0.8"/>
                <path d="M130 10 Q135 6 140 10 Q145 14 150 10" stroke="#D4693A" strokeWidth="0.8" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Saludo */}
          <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
            <p className="serif" style={{ fontSize: "1.1rem", color: "#2C2320", fontStyle: "italic" }}>
              {saludo(inv.invitados)}
            </p>
            <p className="serif" style={{ fontSize: "0.88rem", color: "#5C4A42", marginTop: "0.5rem", lineHeight: 1.7 }}>
              {esIndividual
                ? "Con mucha alegría te invitamos a celebrar con nosotros este día tan especial."
                : "Con mucha alegría los invitamos a celebrar con nosotros este día tan especial."}
            </p>
          </div>

          {/* Línea dorada */}
          <div style={{ width: "50px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832, transparent)", margin: "0 auto 1.2rem" }} />

          {/* Fecha */}
          <div style={{ textAlign: "center", marginBottom: "1.1rem" }}>
            <p className="sans" style={{ fontSize: "0.5rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.4rem" }}>
              Sábado · 13 de Junio · 2026
            </p>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch" }}>
              <div style={{ textAlign: "center", padding: "0 1.2rem" }}>
                <p className="sans" style={{ fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.2rem" }}>Ceremonia</p>
                <p className="serif" style={{ fontSize: "1.15rem", color: "#2C2320" }}>6:00 PM</p>
              </div>
              <div style={{ width: "1px", background: "linear-gradient(180deg, transparent, rgba(212,168,50,0.45), transparent)" }} />
              <div style={{ textAlign: "center", padding: "0 1.2rem" }}>
                <p className="sans" style={{ fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.2rem" }}>Recepción</p>
                <p className="serif" style={{ fontSize: "1.15rem", color: "#2C2320" }}>7:30 PM</p>
              </div>
            </div>
          </div>

          {/* Línea dorada */}
          <div style={{ width: "50px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832, transparent)", margin: "0 auto 1.1rem" }} />

          {/* Lugar */}
          <div style={{ textAlign: "center", marginBottom: "1.3rem" }}>
            <p className="serif" style={{ fontSize: "1.05rem", color: "#2C2320" }}>Brisas del Renacer</p>
            <p className="serif" style={{ fontStyle: "italic", fontSize: "0.82rem", color: "#5C4A42", lineHeight: 1.6, marginTop: "0.2rem" }}>
              A 600 metros de la entrada de Zambrano<br />
              Vía Coro–Churuguara, Falcón
            </p>
          </div>

          {/* Versículo */}
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ width: "100%", maxWidth: "200px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832 40%, #D4693A 60%, transparent)", margin: "0 auto 0.9rem", opacity: 0.4 }} />
            <p className="serif" style={{ fontStyle: "italic", fontSize: "0.92rem", color: "#5C4A42", lineHeight: 1.65 }}>
              &ldquo;Todo lo hizo hermoso en su tiempo&rdquo;
            </p>
            <p className="sans" style={{ fontSize: "0.55rem", color: "#D4693A", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "0.3rem" }}>
              Eclesiastés 3 · 11
            </p>
          </div>

          {/* Botón */}
          {todosConfirmaron ? (
            <div style={{ textAlign: "center" }}>
              <p className="serif" style={{ fontSize: "1rem", color: "#7A9438", fontStyle: "italic" }}>
                ¡Ya confirmaste tu asistencia!
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <a href={`/confirmar/${codigo}?r=${rondaActual}`} style={{
                display: "block", background: "#C94F4F", color: "#FDFAF6",
                borderRadius: "2px", padding: "0.85rem 1.5rem",
                fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem",
                letterSpacing: "0.22em", textTransform: "uppercase",
                textDecoration: "none", textAlign: "center",
              }}>
                Confirmar asistencia
              </a>
              {algunoConfirmo && (
                <p className="sans" style={{ fontSize: "0.6rem", color: "#9A8880", marginTop: "0.5rem" }}>
                  Algunas personas ya confirmaron.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Tulipán pequeño para la franja lateral
function TulipMini({ color1, color2, stem, offsetX = 0, rotate = 0 }: {
  color1: string; color2: string; stem: string; offsetX?: number; rotate?: number;
}) {
  return (
    <svg width="28" height="46" viewBox="0 0 44 80" fill="none"
      style={{ transform: `rotate(${rotate}deg) translateX(${offsetX}px)`, display: "block" }}>
      <path d="M22 78 Q21 62 22 50" stroke={stem} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M21 68 Q13 60 14 52 Q19 62 21 66Z" fill={stem} opacity="0.45"/>
      <path d="M23 62 Q31 54 30 46 Q25 56 23 60Z" fill={stem} opacity="0.38"/>
      <path d="M22 50 Q12 46 10 34 Q12 22 17 18 Q19 28 22 36Z" fill={color1} opacity="0.82"/>
      <path d="M22 50 Q32 46 34 34 Q32 22 27 18 Q25 28 22 36Z" fill={color2} opacity="0.76"/>
      <path d="M22 50 Q17 40 17 27 Q19 16 22 14 Q25 16 27 27 Q27 40 22 50Z" fill={color1} opacity="0.72"/>
    </svg>
  );
}