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

      {/* Sin tulipanes laterales */}

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
                <circle cx="0" cy="0" r="28" fill="white" stroke="#E8C8C0" strokeWidth="0.8"/>
                <circle cx="0" cy="0" r="23" fill="none" stroke="#D4A8A0" strokeWidth="0.5" strokeDasharray="2.5,2.5"/>
                <text x="0" y="-2" textAnchor="middle" fontFamily="'PinyonScript', serif" fontSize="20" fill="#C94F4F" opacity="0.9">C &amp; H</text>
                <text x="0" y="12" textAnchor="middle" fontFamily="'Montserrat', sans-serif" fontSize="4.5" fill="#9A8880" letterSpacing="2.5">2026</text>
              </g>

              {/* Ramo de rosas lado izquierdo del sello — blancas/crema */}
              <g transform="translate(105, 62)" opacity="0.88">
                {/* Tallos */}
                <path d="M0 0 Q-2 -12 -1 -22" stroke="#8A9A62" strokeWidth="1" strokeLinecap="round"/>
                <path d="M0 0 Q3 -10 5 -20" stroke="#9AAA72" strokeWidth="0.9" strokeLinecap="round"/>
                <path d="M0 0 Q-6 -8 -9 -18" stroke="#8A9A62" strokeWidth="0.8" strokeLinecap="round"/>
                {/* Hojas */}
                <path d="M-1 -14 Q-8 -16 -9 -22 Q-4 -18 -2 -14Z" fill="#8A9A62" opacity="0.55"/>
                <path d="M3 -12 Q10 -14 10 -20 Q5 -16 3 -12Z" fill="#9AAA72" opacity="0.50"/>
                {/* Rosa grande — blanca */}
                <g transform="translate(-1, -22)">
                  <path d="M0,-9 Q6,-6 8,0 Q6,6 0,8 Q-5,7 -7,2 Q-8,-4 -4,-7 Q-2,-9 0,-9Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.5"/>
                  <path d="M0,-5.5 Q4,-3 5,0 Q3.5,4 0,5 Q-3.5,4 -5,0 Q-3.5,-3 0,-5.5Z" fill="#F5F0EE" stroke="#DDD0CA" strokeWidth="0.3"/>
                  <path d="M0,-2.5 Q2,-1 2.5,0.5 Q2,2.5 0,3 Q-2,2.5 -2.5,0.5 Q-2,-1 0,-2.5Z" fill="#EDE5E0"/>
                  <circle cx="0" cy="0" r="1.2" fill="#D8CCC6"/>
                  {/* pétalo extra */}
                  <path d="M-9,0 Q-11,-5 -6,-9 Q-4,-5 -6,0Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.3" opacity="0.8"/>
                  <path d="M9,0 Q11,-5 6,-9 Q4,-5 6,0Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.3" opacity="0.8"/>
                </g>
                {/* Rosa pequeña izquierda */}
                <g transform="translate(-9, -20)">
                  <path d="M0,-6 Q4,-4 5,0 Q3,4 0,5 Q-3,4 -4,0 Q-3,-4 0,-6Z" fill="#FDF9F8" stroke="#EAD8D4" strokeWidth="0.4"/>
                  <path d="M0,-3.5 Q2.5,-2 3,0 Q2,2.5 0,3 Q-2,2.5 -3,0 Q-2,-2 0,-3.5Z" fill="#F0E8E4"/>
                  <circle cx="0" cy="0" r="1" fill="#D8CCC6"/>
                </g>
                {/* Rosa pequeña derecha */}
                <g transform="translate(5, -21)">
                  <path d="M0,-5 Q3,-3 4,0 Q3,4 0,5 Q-3,4 -4,0 Q-3,-3 0,-5Z" fill="#FDF9F8" stroke="#EAD8D4" strokeWidth="0.4"/>
                  <path d="M0,-3 Q2,-1.5 2.5,0 Q2,2 0,3 Q-2,2 -2.5,0 Q-2,-1.5 0,-3Z" fill="#F0E8E4"/>
                  <circle cx="0" cy="0" r="0.9" fill="#D8CCC6"/>
                </g>
                {/* Perlas */}
                <circle cx="-4" cy="-28" r="1.5" fill="#EEEAE6" opacity="0.75"/>
                <circle cx="6" cy="-26" r="1.1" fill="#E4E0DC" opacity="0.65"/>
              </g>

              {/* Ramo de rosas lado derecho del sello — espejado */}
              <g transform="translate(235, 62) scale(-1,1)" opacity="0.85">
                <path d="M0 0 Q-2 -12 -1 -22" stroke="#8A9A62" strokeWidth="1" strokeLinecap="round"/>
                <path d="M0 0 Q3 -10 5 -20" stroke="#9AAA72" strokeWidth="0.9" strokeLinecap="round"/>
                <path d="M0 0 Q-6 -8 -9 -18" stroke="#8A9A62" strokeWidth="0.8" strokeLinecap="round"/>
                <path d="M-1 -14 Q-8 -16 -9 -22 Q-4 -18 -2 -14Z" fill="#8A9A62" opacity="0.55"/>
                <path d="M3 -12 Q10 -14 10 -20 Q5 -16 3 -12Z" fill="#9AAA72" opacity="0.50"/>
                <g transform="translate(-1, -22)">
                  <path d="M0,-9 Q6,-6 8,0 Q6,6 0,8 Q-5,7 -7,2 Q-8,-4 -4,-7 Q-2,-9 0,-9Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.5"/>
                  <path d="M0,-5.5 Q4,-3 5,0 Q3.5,4 0,5 Q-3.5,4 -5,0 Q-3.5,-3 0,-5.5Z" fill="#F5F0EE" stroke="#DDD0CA" strokeWidth="0.3"/>
                  <path d="M0,-2.5 Q2,-1 2.5,0.5 Q2,2.5 0,3 Q-2,2.5 -2.5,0.5 Q-2,-1 0,-2.5Z" fill="#EDE5E0"/>
                  <circle cx="0" cy="0" r="1.2" fill="#D8CCC6"/>
                  <path d="M-9,0 Q-11,-5 -6,-9 Q-4,-5 -6,0Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.3" opacity="0.8"/>
                  <path d="M9,0 Q11,-5 6,-9 Q4,-5 6,0Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.3" opacity="0.8"/>
                </g>
                <g transform="translate(-9, -20)">
                  <path d="M0,-6 Q4,-4 5,0 Q3,4 0,5 Q-3,4 -4,0 Q-3,-4 0,-6Z" fill="#FDF9F8" stroke="#EAD8D4" strokeWidth="0.4"/>
                  <path d="M0,-3.5 Q2.5,-2 3,0 Q2,2.5 0,3 Q-2,2.5 -3,0 Q-2,-2 0,-3.5Z" fill="#F0E8E4"/>
                  <circle cx="0" cy="0" r="1" fill="#D8CCC6"/>
                </g>
                <g transform="translate(5, -21)">
                  <path d="M0,-5 Q3,-3 4,0 Q3,4 0,5 Q-3,4 -4,0 Q-3,-3 0,-5Z" fill="#FDF9F8" stroke="#EAD8D4" strokeWidth="0.4"/>
                  <path d="M0,-3 Q2,-1.5 2.5,0 Q2,2 0,3 Q-2,2 -2.5,0 Q-2,-1.5 0,-3Z" fill="#F0E8E4"/>
                  <circle cx="0" cy="0" r="0.9" fill="#D8CCC6"/>
                </g>
                <circle cx="-4" cy="-28" r="1.5" fill="#EEEAE6" opacity="0.75"/>
                <circle cx="6" cy="-26" r="1.1" fill="#E4E0DC" opacity="0.65"/>
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
        <div className="tarjeta-entra" style={{ width: "min(420px, 95vw)", position: "relative", zIndex: 1, paddingBottom: "2rem" }}>
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
  const invitado = inv.invitados[0];
  const esF = esIndividual && invitado?.sexo === "F";

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: "3px",
      boxShadow: "0 16px 60px rgba(60,30,20,0.13), 0 2px 12px rgba(60,30,20,0.07)",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Cinta vertical sutil */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        left: "50%", transform: "translateX(-50%)",
        width: "28px", zIndex: 0,
        background: "linear-gradient(180deg, rgba(225,205,195,0.15) 0%, rgba(215,192,182,0.25) 50%, rgba(225,205,195,0.15) 100%)",
        borderLeft: "0.5px solid rgba(205,180,170,0.2)",
        borderRight: "0.5px solid rgba(205,180,170,0.2)",
        pointerEvents: "none",
      }} />

      {/* Ramo de rosas esquina superior izquierda */}
      <div style={{ position: "absolute", top: "-6px", left: "-6px", zIndex: 2, pointerEvents: "none" }}>
        <svg width="145" height="135" viewBox="0 0 145 135" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Tallos */}
          <path d="M56 132 Q53 105 49 84 Q45 64 39 48" stroke="#9AAA72" strokeWidth="1.4" strokeLinecap="round" opacity="0.65"/>
          <path d="M60 132 Q62 108 67 90 Q72 74 74 58" stroke="#8A9A62" strokeWidth="1.2" strokeLinecap="round" opacity="0.60"/>
          <path d="M52 132 Q43 111 36 92 Q29 74 21 58" stroke="#9AAA72" strokeWidth="1.1" strokeLinecap="round" opacity="0.55"/>
          {/* Hojas */}
          <path d="M46 78 Q33 68 31 55 Q41 61 46 73Z" fill="#8A9A62" opacity="0.50"/>
          <path d="M63 85 Q76 75 79 62 Q67 68 63 81Z" fill="#9AAA72" opacity="0.45"/>
          <path d="M39 98 Q25 93 21 80 Q33 85 39 95Z" fill="#8A9A62" opacity="0.42"/>
          <path d="M57 63 Q64 51 72 49 Q70 61 60 65Z" fill="#9AAA72" opacity="0.45"/>
          {/* Rosa grande central — blanca */}
          <g transform="translate(51, 44)">
            <circle cx="0" cy="0" r="18" fill="#F5F0EE" opacity="0.5"/>
            <path d="M0,-14 Q8,-10 12,-2 Q10,8 2,13 Q-6,14 -12,8 Q-15,-2 -10,-10 Q-6,-14 0,-14Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.5"/>
            <path d="M0,-9 Q6,-6 8,0 Q6,6 0,9 Q-6,6 -8,0 Q-6,-6 0,-9Z" fill="#F5F0EE" stroke="#DDD0CA" strokeWidth="0.4"/>
            <path d="M0,-5 Q3,-3 4,0 Q3,3 0,5 Q-3,3 -4,0 Q-3,-3 0,-5Z" fill="#ECE4DF"/>
            <circle cx="0" cy="0" r="2" fill="#D8CCC6"/>
            <path d="M-14,2 Q-17,-7 -10,-13 Q-6,-8 -8,0Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.3" opacity="0.8"/>
            <path d="M14,2 Q17,-7 10,-13 Q6,-8 8,0Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.3" opacity="0.8"/>
            <path d="M2,15 Q9,13 13,7 Q8,5 3,10Z" fill="#F8F4F2" stroke="#E4D8D2" strokeWidth="0.3" opacity="0.75"/>
            <path d="M-2,15 Q-9,13 -13,7 Q-8,5 -3,10Z" fill="#F8F4F2" stroke="#E4D8D2" strokeWidth="0.3" opacity="0.75"/>
          </g>
          {/* Rosa mediana derecha — blanca */}
          <g transform="translate(79, 60)">
            <path d="M0,-12 Q8,-8 11,-1 Q9,8 2,11 Q-5,12 -10,5 Q-13,-4 -8,-10 Q-4,-13 0,-12Z" fill="#FAFAFA" stroke="#E4D8D2" strokeWidth="0.5"/>
            <path d="M0,-7 Q5,-4 7,1 Q5,6 0,8 Q-5,6 -7,1 Q-5,-4 0,-7Z" fill="#F5F0EE" stroke="#DDD0CA" strokeWidth="0.35"/>
            <path d="M0,-3.5 Q2.5,-2 3,0 Q2.5,2.5 0,3.5 Q-2.5,2.5 -3,0 Q-2.5,-2 0,-3.5Z" fill="#ECE4DF"/>
            <circle cx="0" cy="0" r="1.5" fill="#D8CCC6"/>
          </g>
          {/* Rosa pequeña izquierda */}
          <g transform="translate(23, 50)">
            <path d="M0,-10 Q7,-6 9,1 Q7,7 1,9 Q-5,8 -8,2 Q-9,-5 -4,-8 Q-2,-10 0,-10Z" fill="#FDF9F8" stroke="#EAD8D4" strokeWidth="0.5"/>
            <path d="M0,-6 Q4,-3 5.5,1 Q4,5 0,6 Q-4,5 -5.5,1 Q-4,-3 0,-6Z" fill="#F8F2EF" stroke="#E4CCC6" strokeWidth="0.35"/>
            <path d="M0,-3 Q2,-1.5 2.5,0.5 Q2,2.5 0,3 Q-2,2.5 -2.5,0.5 Q-2,-1.5 0,-3Z" fill="#EEE4E0"/>
            <circle cx="0" cy="0" r="1.2" fill="#D8CCC6"/>
          </g>
          {/* Perlas / detalles plateados */}
          <circle cx="69" cy="31" r="2.8" fill="#EEEAE6" opacity="0.7"/>
          <circle cx="63" cy="25" r="2" fill="#E4E0DC" opacity="0.6"/>
          <circle cx="76" cy="38" r="1.6" fill="#EEEAE6" opacity="0.55"/>
          <circle cx="59" cy="37" r="1.3" fill="#E4E0DC" opacity="0.5"/>
          <circle cx="82" cy="28" r="1.4" fill="#EEEAE6" opacity="0.5"/>
          {/* Florecitas relleno */}
          <g transform="translate(41, 29)">
            <circle cx="0" cy="0" r="5.5" fill="#FDF9F8" stroke="#EAD8D4" strokeWidth="0.5"/>
            <circle cx="0" cy="0" r="2.8" fill="#EEE6E2"/>
            <circle cx="0" cy="0" r="1.2" fill="#D8CCC6"/>
          </g>
          <g transform="translate(71, 23)">
            <circle cx="0" cy="0" r="4.5" fill="#FDF9F8" stroke="#E4D8D2" strokeWidth="0.4"/>
            <circle cx="0" cy="0" r="2.2" fill="#EDE5E0"/>
            <circle cx="0" cy="0" r="0.9" fill="#D8CCC6"/>
          </g>
          <g transform="translate(88, 44)">
            <circle cx="0" cy="0" r="3.5" fill="#FDF9F8" stroke="#E4D8D2" strokeWidth="0.4"/>
            <circle cx="0" cy="0" r="1.7" fill="#EDE5E0"/>
          </g>
        </svg>
      </div>

      {/* Contenido — padding top grande para dejar espacio al ramo */}
      <div style={{ position: "relative", zIndex: 1, padding: "8rem 2rem 2.2rem" }}>

        {/* C & H — logo arriba */}
        <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
          <h1 className="script" style={{ fontSize: "clamp(3.5rem,16vw,5rem)", color: "#2C2320", lineHeight: 0.95 }}>Carla</h1>
          <p className="serif" style={{ fontSize: "1rem", color: "#C94F4F", letterSpacing: "0.5em", fontStyle: "italic", margin: "0.15rem 0" }}>&amp;</p>
          <h1 className="script" style={{ fontSize: "clamp(3.5rem,16vw,5rem)", color: "#2C2320", lineHeight: 0.95 }}>Hely</h1>
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
          <p className="serif" style={{ fontSize: "1.15rem", color: "#2C2320", fontStyle: "italic" }}>
            {saludo(inv.invitados)}
          </p>
          <p className="serif" style={{ fontSize: "0.92rem", color: "#5C4A42", marginTop: "0.55rem", lineHeight: 1.75 }}>
            {esIndividual
              ? esF
                ? "Queremos que seas nuestra invitada especial en este día tan significativo para nosotros."
                : "Queremos que seas nuestro invitado especial en este día tan significativo para nosotros."
              : "Queremos que sean parte de este día tan especial para nosotros."}
          </p>
        </div>

        <div style={{ width: "50px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832, transparent)", margin: "0 auto 1.2rem" }} />

        {/* Fecha y horas */}
        <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
          <p className="sans" style={{ fontSize: "0.5rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.5rem" }}>
            Sábado · 13 de Junio · 2026
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch" }}>
            <div style={{ textAlign: "center", padding: "0 1.3rem" }}>
              <p className="sans" style={{ fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.25rem" }}>Ceremonia</p>
              <p className="serif" style={{ fontSize: "1.2rem", color: "#2C2320" }}>6:00 PM</p>
            </div>
            <div style={{ width: "1px", background: "linear-gradient(180deg, transparent, rgba(212,168,50,0.45), transparent)" }} />
            <div style={{ textAlign: "center", padding: "0 1.3rem" }}>
              <p className="sans" style={{ fontSize: "0.48rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9A8880", marginBottom: "0.25rem" }}>Recepción</p>
              <p className="serif" style={{ fontSize: "1.2rem", color: "#2C2320" }}>7:30 PM</p>
            </div>
          </div>
        </div>

        <div style={{ width: "50px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832, transparent)", margin: "0 auto 1.2rem" }} />

        {/* Lugar */}
        <div style={{ textAlign: "center", marginBottom: "1.3rem" }}>
          <p className="serif" style={{ fontSize: "1.05rem", color: "#2C2320" }}>Brisas del Renacer</p>
          <p className="serif" style={{ fontStyle: "italic", fontSize: "0.84rem", color: "#5C4A42", lineHeight: 1.65, marginTop: "0.2rem" }}>
            A 600 metros de la entrada de Zambrano<br />
            Vía Coro–Churuguara, Falcón
          </p>
        </div>

        {/* Versículo */}
        <div style={{ textAlign: "center", marginBottom: "1.6rem" }}>
          <div style={{ width: "180px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832 40%, #D4693A 60%, transparent)", margin: "0 auto 0.9rem", opacity: 0.35 }} />
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
              {esIndividual ? "¡Ya confirmaste tu asistencia!" : "¡Ya confirmaron su asistencia!"}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <a href={`/confirmar/${codigo}?r=${rondaActual}`} style={{
              display: "block", background: "#C94F4F", color: "#FFFFFF",
              borderRadius: "2px", padding: "0.88rem 2rem",
              fontFamily: "'Montserrat',sans-serif", fontSize: "0.62rem",
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
  );
}