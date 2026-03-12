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

      {/* ── Tulipanes — igual que Hero ─────────────── */}
      {/* Izquierdo */}
      <div style={{ position: "absolute", left: "-8px", bottom: "-20px", pointerEvents: "none", opacity: 0.72, zIndex: 10 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <TulipSVG size={100} petalColor="#C94F4F" petalColor2="#D4693A" rotate={8} />
          <div style={{ position: "absolute", bottom: 0, left: 100 * 0.28 + 10 }}>
            <TulipSVG size={72} petalColor="#D4693A" petalColor2="#C94F4F" rotate={0} />
          </div>
        </div>
      </div>
      {/* Derecho */}
      <div style={{ position: "absolute", right: "-8px", top: "-15px", pointerEvents: "none", opacity: 0.68, transform: "scaleX(-1)", zIndex: 10 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <TulipSVG size={88} petalColor="#D4A832" petalColor2="#9B8BB4" rotate={-10} />
          <div style={{ position: "absolute", bottom: 0, left: 88 * 0.28 + 10 }}>
            <TulipSVG size={63} petalColor="#9B8BB4" petalColor2="#D4A832" rotate={-18} />
          </div>
        </div>
      </div>

      {/* ── FASE: SOBRE ─────────────────────────────── */}
      {(fase === "sobre" || fase === "cortando" || fase === "abriendo") && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.8rem", position: "relative", zIndex: 1 }}>

          {/* C & H encima del sobre */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'PinyonScript', serif", fontSize: "3rem", color: "var(--ink, #2C1A0E)", lineHeight: 1, marginBottom: "0.2rem" }}>
              Carla <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", color: "var(--red,#C94F4F)", fontStyle: "italic" }}>&amp;</span> Hely
            </p>
            <p style={{ fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--ink-light,#8A7060)" }}>
              Tienes una invitación
            </p>
          </div>

          {/* El sobre */}
          <div
            ref={sobreRef}
            onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
            onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
            style={{
              position: "relative",
              width: "min(360px, 92vw)", height: "min(252px, 64vw)",
              cursor: fase === "sobre" ? "grab" : fase === "cortando" ? "grabbing" : "default",
              userSelect: "none", touchAction: "none",
              filter: "drop-shadow(0 12px 40px rgba(100,50,40,0.20)) drop-shadow(0 3px 8px rgba(100,50,40,0.12))",
              animation: fase === "sobre" ? "sobreFloat 4s ease-in-out infinite" : "none",
            }}
          >
            <svg viewBox="0 0 360 252" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Gradientes del sobre */}
                <linearGradient id="sobreFondo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFDFB"/>
                  <stop offset="100%" stopColor="#F9F2EE"/>
                </linearGradient>
                <linearGradient id="lateralL" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F2E8E4"/>
                  <stop offset="100%" stopColor="#FAF4F1"/>
                </linearGradient>
                <linearGradient id="lateralR" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#EEE4E0"/>
                  <stop offset="100%" stopColor="#FAF4F1"/>
                </linearGradient>
                <linearGradient id="solapaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9F6"/>
                  <stop offset="100%" stopColor="#F0E6E0"/>
                </linearGradient>
                <linearGradient id="inferiorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EDE4E0"/>
                  <stop offset="100%" stopColor="#E4D8D2"/>
                </linearGradient>
                {/* Puntos decorativos */}
                <pattern id="puntitos" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                  <circle cx="9" cy="9" r="0.9" fill="#C4A090" opacity="0.35"/>
                </pattern>
              </defs>

              {/* Cuerpo principal */}
              <rect x="1" y="1" width="358" height="250" rx="3" fill="url(#sobreFondo)" stroke="#E4D0C8" strokeWidth="1"/>

              {/* Textura de puntos — como el Hero */}
              <rect x="1" y="1" width="358" height="250" rx="3" fill="url(#puntitos)" opacity="1"/>

              {/* Solapas laterales */}
              <polygon points="1,1 1,251 126,142" fill="url(#lateralL)" stroke="#E4D0C8" strokeWidth="0.6"/>
              <polygon points="359,1 359,251 234,142" fill="url(#lateralR)" stroke="#E4D0C8" strokeWidth="0.6"/>

              {/* Solapa inferior */}
              <polygon points="1,251 180,142 359,251" fill="url(#inferiorGrad)" stroke="#E4D0C8" strokeWidth="0.6"/>

              {/* Solapa superior — se abre con la animación */}
              <polygon
                points={`1,1 359,1 180,${solapaY}`}
                fill="url(#solapaGrad)"
                stroke="#E4D0C8" strokeWidth="0.6"
              />

              {/* Borde interior decorativo */}
              <rect x="10" y="10" width="340" height="232" rx="2" fill="none" stroke="#E0CECA" strokeWidth="0.6" strokeDasharray="4,4" opacity="0.7"/>

              {/* Línea de corte progresiva */}
              {(fase === "cortando") && cortePct > 3 && (
                <>
                  <line
                    x1="1" y1="1.5"
                    x2={1 + (cortePct / 100) * 358} y2="1.5"
                    stroke="#C94F4F" strokeWidth="1.5" strokeLinecap="round"
                    opacity={0.6}
                    strokeDasharray="6,3"
                  />
                  {/* Tijera en el punto de corte */}
                  <g transform={`translate(${1 + (cortePct / 100) * 358}, 1)`} opacity="0.8">
                    <circle cx="0" cy="0" r="5" fill="white" stroke="#C94F4F" strokeWidth="0.8"/>
                    <text x="0" y="3.5" textAnchor="middle" fontSize="6" fill="#C94F4F">✂</text>
                  </g>
                </>
              )}

              {/* Solapa abriéndose — mostrar el interior */}
              {solapaAbierta && (
                <rect x="10" y="10" width="340" height="120" rx="1"
                  fill="rgba(255,250,248,0.5)" opacity={Math.min(1, Math.abs(solapaAngulo) / 90)}
                />
              )}

              {/* Ribete rosa en el borde */}
              <rect x="1" y="1" width="358" height="250" rx="3" fill="none" stroke="#D4A8A0" strokeWidth="0.8" opacity="0.5"/>

              {/* Cinta central vertical */}
              <line x1="180" y1="142" x2="180" y2="251" stroke="#D4A8A0" strokeWidth="1" opacity="0.4"/>

              {/* Tulipán decorativo izquierdo dentro del sobre */}
              <g transform="translate(38, 200) scale(0.45)" opacity="0.55">
                <path d="M22 78 Q21 58 22 44" stroke="#7A9438" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M21 62 Q10 52 12 42 Q18 54 21 58Z" fill="#7A9438" opacity="0.5"/>
                <path d="M23 56 Q34 46 32 36 Q26 48 23 52Z" fill="#7A9438" opacity="0.4"/>
                <path d="M22 44 Q10 40 8 26 Q10 14 16 10 Q18 22 22 30Z" fill="#C94F4F" opacity="0.75"/>
                <path d="M22 44 Q34 40 36 26 Q34 14 28 10 Q26 22 22 30Z" fill="#D4693A" opacity="0.70"/>
                <path d="M22 44 Q16 34 16 20 Q18 8 22 6 Q26 8 28 20 Q28 34 22 44Z" fill="#C94F4F" opacity="0.65"/>
              </g>
              {/* Tulipán decorativo derecho */}
              <g transform="translate(322, 200) scale(-0.45, 0.45)" opacity="0.50">
                <path d="M22 78 Q21 58 22 44" stroke="#7A9438" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M21 62 Q10 52 12 42 Q18 54 21 58Z" fill="#7A9438" opacity="0.5"/>
                <path d="M23 56 Q34 46 32 36 Q26 48 23 52Z" fill="#7A9438" opacity="0.4"/>
                <path d="M22 44 Q10 40 8 26 Q10 14 16 10 Q18 22 22 30Z" fill="#D4A832" opacity="0.70"/>
                <path d="M22 44 Q34 40 36 26 Q34 14 28 10 Q26 22 22 30Z" fill="#9B8BB4" opacity="0.65"/>
                <path d="M22 44 Q16 34 16 20 Q18 8 22 6 Q26 8 28 20 Q28 34 22 44Z" fill="#D4A832" opacity="0.60"/>
              </g>

              {/* Sello central — círculo elegante */}
              <g transform="translate(180, 148)">
                <circle cx="0" cy="0" r="32" fill="#FDFAF6" stroke="#E8C8B8" strokeWidth="1"/>
                <circle cx="0" cy="0" r="28" fill="none" stroke="#D4A8A0" strokeWidth="0.5" strokeDasharray="3,3"/>
                <text x="0" y="-4" textAnchor="middle" fontFamily="'PinyonScript', serif" fontSize="22" fill="#C94F4F" opacity="0.9">C &amp; H</text>
                <text x="0" y="12" textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontSize="5" fill="#9A8880" letterSpacing="3">2026</text>
              </g>
            </svg>
          </div>

          {/* Instrucción animada */}
          {fase === "sobre" && (
            <div style={{ textAlign: "center", animation: "hintar 2s ease-in-out infinite" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontStyle: "italic", color: "var(--ink-light,#8A7060)", letterSpacing: "0.05em" }}>
                Desliza hacia la derecha para abrir
              </p>
              <p style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--terracotta,#D4693A)", marginTop: "0.3rem", opacity: 0.8 }}>
                ────── ✂ ──────
              </p>
            </div>
          )}
          {fase === "cortando" && cortePct > 0 && (
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--red,#C94F4F)", fontFamily: "'Montserrat',sans-serif" }}>
              Sigue abriendo... {Math.round(cortePct)}%
            </p>
          )}
          {fase === "abriendo" && (
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--ink-light,#8A7060)", fontFamily: "'Montserrat',sans-serif" }}>
              Abriendo...
            </p>
          )}

          {/* Botón tap fallback */}
          {fase === "sobre" && (
            <button
              onClick={() => abrirSobre()}
              style={{
                background: "none", border: "1px solid var(--terracotta,#D4693A)",
                padding: "0.6rem 2rem", borderRadius: "2px",
                fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem",
                letterSpacing: "0.25em", textTransform: "uppercase",
                color: "var(--terracotta,#D4693A)", cursor: "pointer",
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
      padding: "2.8rem 2rem 2.2rem",
      boxShadow: "0 12px 50px rgba(80,40,30,0.14), 0 2px 10px rgba(80,40,30,0.08)",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Manchas de fondo dentro de la tarjeta — igual que Hero */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", right: "-5%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,79,79,0.12) 0%, rgba(212,105,58,0.05) 55%, transparent 75%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "50%", height: "50%", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.12) 0%, rgba(122,148,56,0.04) 55%, transparent 75%)" }} />
        <div style={{ position: "absolute", top: "45%", left: "0%", width: "30%", height: "30%", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,50,0.10) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Logo Carla & Hely — igual que Hero ── */}
        <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
          <p className="serif" style={{ fontStyle: "italic", fontSize: "0.8rem", color: "#9A8880", letterSpacing: "0.15em", marginBottom: "1rem" }}>
            Sábado · 13 de Junio · 2026
          </p>
          <h1 className="script" style={{ fontSize: "clamp(3.8rem,18vw,5.5rem)", color: "#2C2320", lineHeight: 0.95, letterSpacing: "0.02em" }}>Carla</h1>
          <p className="serif" style={{ fontSize: "1.1rem", color: "#C94F4F", letterSpacing: "0.5em", fontStyle: "italic", margin: "0.3rem 0" }}>&amp;</p>
          <h1 className="script" style={{ fontSize: "clamp(3.8rem,18vw,5.5rem)", color: "#2C2320", lineHeight: 0.95, letterSpacing: "0.02em" }}>Hely</h1>

          {/* Separador ondulado — igual que Hero */}
          <div style={{ margin: "1.2rem auto 0", maxWidth: "280px" }}>
            <svg viewBox="0 0 320 24" fill="none" style={{ width: "100%", height: "24px", display: "block", margin: "0 auto" }}>
              <path d="M10 12 Q80 4 160 12 Q240 20 310 12" stroke="#C94F4F" strokeWidth="0.8" strokeLinecap="round" className="svg-draw" />
              <circle cx="160" cy="12" r="2.5" fill="none" stroke="#D4693A" strokeWidth="0.8" />
              <path d="M148 12 Q154 7 160 12 Q166 17 172 12" stroke="#D4693A" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* ── Saludo personalizado ── */}
        <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
          <p className="serif" style={{ fontSize: "1.25rem", color: "#2C2320", fontStyle: "italic", lineHeight: 1.4 }}>
            {saludo(inv.invitados)}
          </p>
          <p className="serif" style={{ fontSize: "0.95rem", color: "#5C4A42", marginTop: "0.6rem", lineHeight: 1.7 }}>
            {esIndividual
              ? "Con mucha alegría te invitamos a celebrar con nosotros el día más especial de nuestras vidas."
              : "Con mucha alegría los invitamos a celebrar con nosotros el día más especial de nuestras vidas."}
          </p>
        </div>

        {/* ── Línea dorada ── */}
        <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832, transparent)", margin: "0 auto 1.4rem" }} />

        {/* ── Fecha y horas ── */}
        <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
          <p className="serif" style={{ fontSize: "1.7rem", color: "#2C2320", letterSpacing: "0.03em", lineHeight: 1.2 }}>
            Sábado, 13 de Junio
          </p>
          <p className="serif" style={{ fontSize: "1.3rem", color: "#C94F4F", fontWeight: 300, letterSpacing: "0.1em" }}>
            2026
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch", gap: "0", marginTop: "1rem" }}>
            <div style={{ textAlign: "center", padding: "0 1.5rem" }}>
              <p className="sans" style={{ fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.3rem" }}>Ceremonia</p>
              <p className="serif" style={{ fontSize: "1.2rem", color: "#2C2320" }}>6:00 PM</p>
            </div>
            <div style={{ width: "1px", background: "linear-gradient(180deg, transparent, rgba(212,168,50,0.5), transparent)" }} />
            <div style={{ textAlign: "center", padding: "0 1.5rem" }}>
              <p className="sans" style={{ fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.3rem" }}>Recepción</p>
              <p className="serif" style={{ fontSize: "1.2rem", color: "#2C2320" }}>7:30 PM</p>
            </div>
          </div>
        </div>

        {/* ── Línea dorada ── */}
        <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832, transparent)", margin: "0 auto 1.4rem" }} />

        {/* ── Lugar ── */}
        <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
          <p className="sans" style={{ fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.5rem" }}>Lugar</p>
          <p className="serif" style={{ fontSize: "1.15rem", color: "#2C2320", letterSpacing: "0.03em" }}>Brisas del Renacer</p>
          <p className="serif" style={{ fontStyle: "italic", fontSize: "0.88rem", color: "#5C4A42", lineHeight: 1.6, marginTop: "0.2rem" }}>
            A 600 metros de la entrada de Zambrano<br />
            Vía Coro–Churuguara, Falcón
          </p>
        </div>

        {/* ── Versículo — igual que Hero ── */}
        <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
          <div style={{ width: "100%", maxWidth: "240px", height: "1px", background: "linear-gradient(90deg, transparent 0%, #D4A832 40%, #D4693A 60%, transparent 100%)", margin: "0 auto 1rem", opacity: 0.4 }} />
          <p className="serif" style={{ fontStyle: "italic", fontSize: "1rem", color: "#5C4A42", lineHeight: 1.65 }}>
            &ldquo;Todo lo hizo hermoso en su tiempo&rdquo;
          </p>
          <p className="sans" style={{ fontSize: "0.6rem", color: "#D4693A", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "0.3rem" }}>
            Eclesiastés 3 · 11
          </p>
        </div>

        {/* ── Botón ── */}
        {todosConfirmaron ? (
          <div style={{ textAlign: "center" }}>
            <p className="serif" style={{ fontSize: "1.05rem", color: "#7A9438", fontStyle: "italic" }}>
              ¡Ya confirmaste tu asistencia!
            </p>
            <p className="sans" style={{ fontSize: "0.62rem", color: "#9A8880", marginTop: "0.4rem", letterSpacing: "0.05em" }}>
              Estaremos en contacto pronto.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <a href={`/confirmar/${codigo}?r=${rondaActual}`} style={{
              display: "block", background: "#C94F4F", color: "#FDFAF6",
              borderRadius: "2px", padding: "0.9rem 2.5rem",
              fontFamily: "'Montserrat',sans-serif", fontSize: "0.65rem",
              letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer",
              width: "100%", marginBottom: "0.8rem",
              textDecoration: "none", textAlign: "center", boxSizing: "border-box",
            }}>
              Confirmar asistencia
            </a>
            {algunoConfirmo && (
              <p className="sans" style={{ fontSize: "0.62rem", color: "#9A8880" }}>
                Algunas personas ya confirmaron.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}