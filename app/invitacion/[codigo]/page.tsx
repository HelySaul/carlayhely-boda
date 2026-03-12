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

// ── Helpers de nombres ─────────────────────────────────
function nombresLista(invitados: Invitado[]) {
  if (invitados.length === 1) return invitados[0].nombre;
  const todos = invitados.map(i => i.nombre.split(" ")[0]);
  return todos.slice(0, -1).join(", ") + " y " + todos[todos.length - 1];
}
function saludo(invitados: Invitado[]) {
  if (invitados.length === 1) {
    const i = invitados[0];
    const tratamiento = i.sexo === "F" ? "Querida" : i.sexo === "M" ? "Querido" : "Querido/a";
    return `${tratamiento} ${i.nombre.split(" ")[0]},`;
  }
  const primeros = invitados.map(i => i.nombre.split(" ")[0]);
  const todasF = invitados.every(i => i.sexo === "F");
  const tratamiento = todasF ? "Queridas" : "Queridos";
  return `${tratamiento} ${primeros.slice(0, -1).join(", ")} y ${primeros[primeros.length - 1]},`;
}

export default function PaginaInvitacion() {
  const { codigo } = useParams<{ codigo: string }>();
  const router = useRouter();
  const [inv, setInv] = useState<Invitacion | null>(null);
  const [error, setError] = useState("");
  const [fase, setFase] = useState<"sobre" | "cortando" | "abierto" | "confirmando" | "gracias">("sobre");
  const [cortePct, setCortePct] = useState(0); // 0-100 progreso del corte
  const [confirmaciones, setConfirmaciones] = useState<Record<string, boolean>>({});
  const [whatsapps, setWhatsapps] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [declinados, setDeclinados] = useState<Record<string, boolean>>({});
  const [rondaActual, setRondaActual] = useState(1);

  const sobreRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const animFrame = useRef<number>(0);

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
      })
      .catch(() => setError("No pudimos cargar tu invitación."));
  }, [codigo]);

  // ── Lógica del gesto de corte ──────────────────────────
  function getClientPos(e: React.TouchEvent | React.MouseEvent) {
    if ("touches" in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  }

  function onDragStart(e: React.TouchEvent | React.MouseEvent) {
    if (fase !== "sobre") return;
    dragStart.current = getClientPos(e);
    setFase("cortando");
  }

  function onDragMove(e: React.TouchEvent | React.MouseEvent) {
    if (fase !== "cortando" || !dragStart.current || !sobreRef.current) return;
    const pos = getClientPos(e);
    const rect = sobreRef.current.getBoundingClientRect();
    // Progreso basado en movimiento horizontal relativo al ancho del sobre
    const delta = pos.x - dragStart.current.x;
    const pct = Math.min(100, Math.max(0, (delta / rect.width) * 160));
    setCortePct(pct);
    if (pct >= 100) {
      cancelAnimationFrame(animFrame.current);
      abrirSobre();
    }
  }

  function onDragEnd() {
    if (fase === "cortando" && cortePct < 100) {
      // Si no completó el gesto, rebota de vuelta
      setFase("sobre");
      setCortePct(0);
    }
  }

  function abrirSobre() {
    setFase("abierto");
    setCortePct(100);
  }

  // ── Confirmar ──────────────────────────────────────────
  async function confirmar() {
    if (!inv) return;
    setEnviando(true);

    const lista = inv.invitados.map(i => ({
      id: i.id,
      asiste: confirmaciones[i.id] === true,
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

  // ── Estados de carga / error ───────────────────────────
  if (error) return (
    <div style={{ minHeight: "100svh", background: "#FDFAF6", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <p style={{ fontFamily: "'Montserrat',sans-serif", color: "#9B8BB4", textAlign: "center" }}>{error}</p>
    </div>
  );
  if (!inv) return (
    <div style={{ minHeight: "100svh", background: "#FDFAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "40px", height: "40px", border: "2px solid #D4A832", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const esIndividual = inv.invitados.length === 1;
  const todosConfirmaron = inv.invitados.every(i => i.confirmacion_1);
  const algunoConfirmo = inv.invitados.some(i => i.confirmacion_1);
  const hayAlgunoSinWpp = inv.invitados.some(i => !i.whatsapp && confirmaciones[i.id]);

  return (
    <div style={{
      minHeight: "100svh",
      background: "linear-gradient(160deg, #F7EEE8 0%, #F0E0D6 50%, #EDD5C8 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: "'Montserrat', sans-serif",
      overflow: "hidden",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        @font-face { font-family: 'PinyonScript'; src: url('/fonts/PinyonScript-Regular.ttf'); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes sobreAbre { 0%{transform:rotateX(0deg)} 100%{transform:rotateX(-180deg)} }
        @keyframes tarjetaSube { 0%{opacity:0;transform:translateY(60px) scale(0.95)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes graciasFade { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
        @keyframes sobreTemblar { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-1deg)} 75%{transform:rotate(1deg)} }
        @keyframes brilloCorte { 0%{opacity:0;width:0} 50%{opacity:1} 100%{opacity:0;width:100%} }
        .tarjeta-entra { animation: tarjetaSube 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .gracias-entra { animation: graciasFade 0.6s ease forwards; }
      `}</style>

      {/* ── FASE: SOBRE ─────────────────────────────── */}
      {(fase === "sobre" || fase === "cortando") && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>

          {/* Indicación */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#9A7070", fontStyle: "italic", marginBottom: "0.3rem" }}>
              Tienes una invitación
            </p>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B5A090" }}>
              {fase === "sobre" ? "Desliza el sello para abrir →" : "Sigue deslizando..."}
            </p>
          </div>

          {/* El sobre */}
          <div
            ref={sobreRef}
            onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
            onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
            style={{
              position: "relative",
              width: "min(340px, 90vw)", height: "min(240px, 63vw)",
              cursor: fase === "sobre" ? "grab" : "grabbing",
              userSelect: "none", touchAction: "none",
              filter: "drop-shadow(0 8px 30px rgba(160,100,90,0.22)) drop-shadow(0 2px 6px rgba(160,100,90,0.12))",
              animation: fase === "sobre" ? "sobreTemblar 3s ease-in-out infinite" : "none",
            }}
          >
            {/* Sobre blanco elegante con flores */}
            <svg viewBox="0 0 340 240" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sobreBlanco" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF"/>
                  <stop offset="100%" stopColor="#F8F4F2"/>
                </linearGradient>
                <linearGradient id="solapaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF"/>
                  <stop offset="100%" stopColor="#F2EBE8"/>
                </linearGradient>
                <linearGradient id="lateralIzq" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F0E8E4"/>
                  <stop offset="100%" stopColor="#F8F4F2"/>
                </linearGradient>
                <linearGradient id="lateralDer" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F8F4F2"/>
                  <stop offset="100%" stopColor="#EEE6E2"/>
                </linearGradient>
                <linearGradient id="solapaCorte" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#F8F0ED"/>
                  <stop offset="100%" stopColor="#FFFFFF"/>
                </linearGradient>
                <filter id="sombra" x="-5%" y="-5%" width="110%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(180,140,130,0.2)"/>
                </filter>
              </defs>

              {/* Cuerpo del sobre */}
              <rect x="1" y="1" width="338" height="238" rx="3" fill="url(#sobreBlanco)" stroke="#E8D8D2" strokeWidth="1" filter="url(#sombra)"/>

              {/* Triángulo inferior */}
              <polygon points="1,239 170,138 339,239" fill="#F2EAE6" stroke="#E8D8D2" strokeWidth="0.5"/>

              {/* Lateral izquierdo */}
              <polygon points="1,1 1,239 118,138" fill="url(#lateralIzq)" stroke="#EAD8D4" strokeWidth="0.5"/>

              {/* Lateral derecho */}
              <polygon points="339,1 339,239 222,138" fill="url(#lateralDer)" stroke="#EAD8D4" strokeWidth="0.5"/>

              {/* Solapa superior — animada al cortar */}
              <polygon
                points={`1,1 339,1 170,${108 - cortePct * 0.5}`}
                fill="url(#solapaCorte)"
                stroke="#E8D8D2" strokeWidth="0.5"
              />

              {/* Línea de corte */}
              {fase === "cortando" && cortePct > 5 && (
                <line
                  x1="1" y1="1"
                  x2={1 + (cortePct / 100) * 338} y2="1"
                  stroke="#D4A0A0" strokeWidth="1.5" strokeLinecap="round"
                  opacity={0.7}
                />
              )}

              {/* Ribete rosa sutil en el borde */}
              <rect x="1" y="1" width="338" height="238" rx="3" fill="none" stroke="#E8C4BE" strokeWidth="0.8" opacity="0.6"/>

              {/* Línea decorativa interior */}
              <rect x="9" y="9" width="322" height="222" rx="2" fill="none" stroke="#EDD4CE" strokeWidth="0.5" opacity="0.8"/>

              {/* ── FLORES en la esquina inferior izquierda ── */}
              <g transform="translate(68, 158)">
                {/* Rosa grande central */}
                <g>
                  <circle cx="0" cy="0" r="14" fill="#F9F0EE" stroke="#E8C4BE" strokeWidth="0.5"/>
                  <path d="M0,-10 Q5,-5 8,0 Q5,5 0,10 Q-5,5 -8,0 Q-5,-5 0,-10Z" fill="#F4D8D4" opacity="0.9"/>
                  <path d="M0,-7 Q4,-3 6,0 Q4,3 0,7 Q-4,3 -6,0 Q-4,-3 0,-7Z" fill="#EFC4BE" opacity="0.8"/>
                  <path d="M0,-4 Q2.5,-2 3.5,0 Q2.5,2 0,4 Q-2.5,2 -3.5,0 Q-2.5,-2 0,-4Z" fill="#E8B4AE"/>
                  <circle cx="0" cy="0" r="1.5" fill="#D4908A"/>
                  {/* Pétalos exteriores */}
                  <path d="M-14,0 Q-10,-8 -5,-10 Q-2,-6 0,-4 Q-4,-2 -8,0 Q-4,2 0,4 Q-2,6 -5,10 Q-10,8 -14,0Z" fill="#F9F0EE" stroke="#EDD4CE" strokeWidth="0.3" opacity="0.7"/>
                  <path d="M14,0 Q10,-8 5,-10 Q2,-6 0,-4 Q4,-2 8,0 Q4,2 0,4 Q2,6 5,10 Q10,8 14,0Z" fill="#F9F0EE" stroke="#EDD4CE" strokeWidth="0.3" opacity="0.7"/>
                </g>
                {/* Rosa pequeña arriba derecha */}
                <g transform="translate(20, -14)">
                  <circle cx="0" cy="0" r="9" fill="#FBF4F2" stroke="#EDD4CE" strokeWidth="0.4"/>
                  <path d="M0,-6 Q3,-3 5,0 Q3,3 0,6 Q-3,3 -5,0 Q-3,-3 0,-6Z" fill="#F4D8D4" opacity="0.85"/>
                  <path d="M0,-3.5 Q2,-1.5 3,0 Q2,1.5 0,3.5 Q-2,1.5 -3,0 Q-2,-1.5 0,-3.5Z" fill="#EFC4BE"/>
                  <circle cx="0" cy="0" r="1" fill="#E0A8A2"/>
                </g>
                {/* Rosa pequeña abajo derecha */}
                <g transform="translate(22, 10)">
                  <circle cx="0" cy="0" r="8" fill="#FBF4F2" stroke="#EDD4CE" strokeWidth="0.4"/>
                  <path d="M0,-5.5 Q3,-2.5 4.5,0 Q3,2.5 0,5.5 Q-3,2.5 -4.5,0 Q-3,-2.5 0,-5.5Z" fill="#F4D8D4" opacity="0.85"/>
                  <path d="M0,-3 Q1.8,-1.5 2.5,0 Q1.8,1.5 0,3 Q-1.8,1.5 -2.5,0 Q-1.8,-1.5 0,-3Z" fill="#EFC4BE"/>
                  <circle cx="0" cy="0" r="0.8" fill="#E0A8A2"/>
                </g>
                {/* Hojitas */}
                <path d="M-12,8 Q-18,4 -20,10 Q-16,14 -12,8Z" fill="#C8D8B0" opacity="0.7"/>
                <path d="M-10,-12 Q-14,-18 -8,-20 Q-4,-16 -10,-12Z" fill="#C8D8B0" opacity="0.6"/>
                <path d="M10,16 Q8,22 14,22 Q16,18 10,16Z" fill="#C8D8B0" opacity="0.6"/>
                {/* Pequeños detalles plateados */}
                <circle cx="-6" cy="-18" r="1.2" fill="#D8D0C8" opacity="0.6"/>
                <circle cx="28" cy="-18" r="0.8" fill="#D8D0C8" opacity="0.5"/>
                <circle cx="30" cy="16" r="1" fill="#D8D0C8" opacity="0.5"/>
              </g>

              {/* Ribete central vertical (cinta) */}
              <rect x="168" y="108" width="4" height="131" fill="url(#sobreBlanco)" opacity="0.4"/>
              <line x1="170" y1="108" x2="170" y2="239" stroke="#E8C4BE" strokeWidth="0.8" opacity="0.5"/>

              {/* Sello central — iniciales elegantes */}
              <g transform="translate(170, 135)">
                <circle cx="0" cy="0" r="22" fill="white" stroke="#E8C4BE" strokeWidth="1"/>
                <circle cx="0" cy="0" r="19" fill="none" stroke="#EDD4CE" strokeWidth="0.5"/>
                <text x="0" y="6" textAnchor="middle" fontFamily="'PinyonScript', serif" fontSize="18" fill="#C4908A" opacity="0.9">C &amp; H</text>
              </g>
            </svg>


          </div>

          {/* Fallback: botón tap */}
          <button
            onClick={() => abrirSobre()}
            style={{
              marginTop: "0.5rem",
              background: "none", border: "1px solid #D4A8A0",
              padding: "0.6rem 1.8rem", borderRadius: "2px",
              fontFamily: "'Montserrat',sans-serif", fontSize: "0.65rem",
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#9A7070", cursor: "pointer",
            }}
          >
            Toca para abrir
          </button>
        </div>
      )}

      {/* ── FASE: ABIERTO — tarjeta de invitación ─── */}
      {fase === "abierto" && (
        <div className="tarjeta-entra" style={{ width: "min(420px, 95vw)", maxHeight: "90svh", overflowY: "auto" }}>
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



      {/* ── FASE: GRACIAS ────────────────────────── */}
      {fase === "gracias" && (
        <div className="gracias-entra" style={{ textAlign: "center", padding: "2rem" }}>
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
      background: "linear-gradient(160deg, #FDFAF6 0%, #F7F0E4 60%, #F2E8D5 100%)",
      border: "1px solid #C8A96E",
      borderRadius: "2px",
      padding: "2.5rem 2rem",
      boxShadow: "0 8px 40px rgba(80,50,20,0.18), 0 2px 8px rgba(80,50,20,0.10), inset 0 0 0 1px rgba(212,168,50,0.15)",
      position: "relative",
      backgroundImage: `linear-gradient(160deg, #FDFAF6 0%, #F7F0E4 60%, #F2E8D5 100%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    }}>
      {/* Línea dorada superior */}
      <div style={{ position: "absolute", top: "14px", left: "14px", right: "14px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832, #C94F4F, #D4A832, transparent)", opacity: 0.5 }} />
      {/* Línea dorada inferior */}
      <div style={{ position: "absolute", bottom: "14px", left: "14px", right: "14px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832, #C94F4F, #D4A832, transparent)", opacity: 0.5 }} />
      {/* Esquinas decorativas */}
      <CornerDecor />

      {/* Encabezado */}
      <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
        <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#9A7850", marginBottom: "0.8rem" }}>
          Con alegría en el corazón
        </p>
        <h1 style={{ fontFamily: "'PinyonScript', serif", fontSize: "3.2rem", color: "#2C1A0E", lineHeight: 1, marginBottom: "0.3rem" }}>
          Carla &amp; Hely
        </h1>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#7A5C3A" }}>
          te invitan a su boda
        </p>
      </div>

      {/* Saludo personalizado */}
      <div style={{ borderTop: "1px solid #C8A96E", borderBottom: "1px solid #C8A96E", padding: "1.2rem 0", marginBottom: "1.5rem", textAlign: "center" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", color: "#3D2B1F", fontStyle: "italic" }}>
          {saludo(inv.invitados)}
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "#5A3E28", marginTop: "0.5rem", lineHeight: 1.6 }}>
          {esIndividual
            ? "Queremos que seas parte de este día tan especial para nosotros."
            : "Queremos que sean parte de este día tan especial para nosotros."}
        </p>
      </div>

      {/* Fecha y hora */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", color: "#2C1A0E", letterSpacing: "0.05em", lineHeight: 1.2 }}>
          Sábado, 13 de Junio
        </p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "#C94F4F", fontWeight: 300, letterSpacing: "0.08em" }}>
          2026
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "0.8rem" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B5A090" }}>Ceremonia</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#3D2B1F" }}>6:00 PM</p>
          </div>
          <div style={{ width: "1px", background: "#E2D5C0" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B5A090" }}>Recepción</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#3D2B1F" }}>7:30 PM</p>
          </div>
        </div>
      </div>

      {/* Lugar */}
      <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
        <p style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B5A090", marginBottom: "0.3rem" }}>Lugar</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#3D2B1F" }}>Brisas del Renacer</p>
        <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.72rem", color: "#7A5C3A", lineHeight: 1.5 }}>
          A 600 metros de la entrada de Zambrano<br />
          Vía Coro–Churuguara, Falcón
        </p>
      </div>

      {/* Versículo */}
      <div style={{ textAlign: "center", padding: "1rem 1.5rem", marginBottom: "1.8rem", borderTop: "1px solid #E2D5C0" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", color: "#7A5C3A", lineHeight: 1.7 }}>
          &ldquo;Todo lo hizo hermoso en su tiempo&rdquo;
        </p>
        <p style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#B5A090", marginTop: "0.3rem" }}>
          Eclesiastés 3:11
        </p>
      </div>

      {/* CTA */}
      {todosConfirmaron ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#7A9438", fontStyle: "italic" }}>
            ¡Ya confirmaste tu asistencia!
          </p>
          <p style={{ fontSize: "0.65rem", color: "#B5A090", marginTop: "0.3rem" }}>
            Estaremos en contacto pronto.
          </p>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <a href={`/confirmar/${codigo}?r=${rondaActual}`} style={{
            display: "block",
            background: "#C94F4F", color: "#FDFAF6",
            border: "none", borderRadius: "2px",
            padding: "0.9rem 2.5rem",
            fontFamily: "'Montserrat',sans-serif",
            fontSize: "0.7rem", letterSpacing: "0.2em",
            textTransform: "uppercase", cursor: "pointer",
            width: "100%", marginBottom: "0.8rem",
            textDecoration: "none", textAlign: "center",
            boxSizing: "border-box",
          }}>
            Confirmar asistencia
          </a>
          {algunoConfirmo && (
            <p style={{ fontSize: "0.65rem", color: "#B5A090" }}>
              Algunas personas ya confirmaron.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Panel de confirmación ──────────────────────────────
function PanelConfirmar({ inv, esIndividual, confirmaciones, setConfirmaciones, declinados, setDeclinados, whatsapps, setWhatsapps, enviando, hayAlgunoSinWpp, onVolver, onConfirmar }: {
  inv: Invitacion; esIndividual: boolean;
  confirmaciones: Record<string, boolean>; setConfirmaciones: (v: Record<string, boolean>) => void;
  declinados: Record<string, boolean>; setDeclinados: (v: Record<string, boolean>) => void;
  whatsapps: Record<string, string>; setWhatsapps: (v: Record<string, string>) => void;
  enviando: boolean; hayAlgunoSinWpp: boolean;
  onVolver: () => void; onConfirmar: () => void;
}) {
  const todoMarcado = inv.invitados.every(i => confirmaciones[i.id] || declinados[i.id]);

  return (
    <div style={{
      background: "#FDFAF6", border: "1px solid #E2D5C0",
      borderRadius: "3px", padding: "2rem 1.8rem",
      boxShadow: "0 4px 32px rgba(0,0,0,0.1)",
    }}>
      <CornerDecor />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
        <h2 style={{ fontFamily: "'PinyonScript', serif", fontSize: "2.5rem", color: "#3D2B1F", lineHeight: 1, marginBottom: "0.5rem" }}>
          Confirmar asistencia
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "#8A7060", fontStyle: "italic" }}>
          {esIndividual
            ? `¿Podrás acompañarnos, ${inv.invitados[0].nombre.split(" ")[0]}?`
            : `¿Quiénes de ${nombresLista(inv.invitados).split(" y ")[0]}... podrán acompañarnos?`}
        </p>
      </div>

      {/* Nota sobre rondas */}
      <div style={{
        background: "rgba(212,168,50,0.08)", border: "1px solid rgba(212,168,50,0.3)",
        borderRadius: "2px", padding: "1rem 1.2rem", marginBottom: "1.5rem",
      }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "#6A5040", lineHeight: 1.7, fontStyle: "italic" }}>
          Sabemos que pedirte confirmar varias veces puede ser incómodo. Lo hacemos porque los amamos y queremos asegurarnos de que cada detalle de este día esté pensado para {esIndividual ? "ti" : "ustedes"}.
        </p>
      </div>

      {/* Individual — dos botones directos */}
      {esIndividual ? (
        <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.5rem" }}>
          <button
            onClick={() => {
              setConfirmaciones({ ...confirmaciones, [inv.invitados[0].id]: true });
              setDeclinados({ ...declinados, [inv.invitados[0].id]: false });
            }}
            style={{
              flex: 1, padding: "1rem",
              background: confirmaciones[inv.invitados[0].id] ? "#7A9438" : "#FDFAF6",
              color: confirmaciones[inv.invitados[0].id] ? "white" : "#3D2B1F",
              border: `1.5px solid ${confirmaciones[inv.invitados[0].id] ? "#7A9438" : "#E2D5C0"}`,
              borderRadius: "2px", fontFamily: "'Montserrat',sans-serif",
              fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            ✓ Sí voy
          </button>
          <button
            onClick={() => {
              setDeclinados({ ...declinados, [inv.invitados[0].id]: true });
              setConfirmaciones({ ...confirmaciones, [inv.invitados[0].id]: false });
            }}
            style={{
              flex: 1, padding: "1rem",
              background: declinados[inv.invitados[0].id] ? "#C94F4F" : "#FDFAF6",
              color: declinados[inv.invitados[0].id] ? "white" : "#8A7060",
              border: `1.5px solid ${declinados[inv.invitados[0].id] ? "#C94F4F" : "#E2D5C0"}`,
              borderRadius: "2px", fontFamily: "'Montserrat',sans-serif",
              fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            No podré ir
          </button>
        </div>
      ) : (
        /* Grupal — checklist */
        <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {inv.invitados.map(i => (
            <div key={i.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.8rem 1rem",
              background: confirmaciones[i.id] ? "rgba(122,148,56,0.08)" : declinados[i.id] ? "rgba(201,79,79,0.06)" : "#F9F4EE",
              border: `1px solid ${confirmaciones[i.id] ? "rgba(122,148,56,0.3)" : declinados[i.id] ? "rgba(201,79,79,0.2)" : "#E2D5C0"}`,
              borderRadius: "2px", transition: "all 0.2s",
            }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "#3D2B1F" }}>
                {i.nombre}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => { setConfirmaciones({ ...confirmaciones, [i.id]: true }); setDeclinados({ ...declinados, [i.id]: false }); }}
                  style={{
                    padding: "0.4rem 0.9rem",
                    background: confirmaciones[i.id] ? "#7A9438" : "transparent",
                    color: confirmaciones[i.id] ? "white" : "#7A9438",
                    border: "1.5px solid #7A9438", borderRadius: "2px",
                    fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem",
                    letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                  }}
                >Sí</button>
                <button
                  onClick={() => { setDeclinados({ ...declinados, [i.id]: true }); setConfirmaciones({ ...confirmaciones, [i.id]: false }); }}
                  style={{
                    padding: "0.4rem 0.9rem",
                    background: declinados[i.id] ? "#C94F4F" : "transparent",
                    color: declinados[i.id] ? "white" : "#C94F4F",
                    border: "1.5px solid #C94F4F", borderRadius: "2px",
                    fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem",
                    letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                  }}
                >No</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp — solo para quien confirmó y no tiene */}
      {hayAlgunoSinWpp && (
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#B5A090", marginBottom: "0.8rem" }}>
            Para mantenernos en contacto
          </p>
          {inv.invitados.filter(i => !i.whatsapp && confirmaciones[i.id]).map(i => (
            <div key={i.id} style={{ marginBottom: "0.6rem" }}>
              {!esIndividual && (
                <p style={{ fontSize: "0.7rem", color: "#8A7060", marginBottom: "0.3rem" }}>{i.nombre.split(" ")[0]}</p>
              )}
              <input
                value={whatsapps[i.id] || ""}
                onChange={e => setWhatsapps({ ...whatsapps, [i.id]: e.target.value })}
                placeholder="+58 412 0000000"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "0.7rem 0.9rem", fontSize: "16px",
                  background: "#F9F4EE", border: "1px solid #E2D5C0",
                  borderRadius: "2px", fontFamily: "'Montserrat',sans-serif",
                  color: "#3D2B1F", outline: "none",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Botones acción */}
      <button
        onClick={onConfirmar}
        disabled={enviando || !todoMarcado}
        style={{
          width: "100%", padding: "0.9rem",
          background: todoMarcado ? "#C94F4F" : "#E2D5C0",
          color: todoMarcado ? "white" : "#B5A090",
          border: "none", borderRadius: "2px",
          fontFamily: "'Montserrat',sans-serif", fontSize: "0.7rem",
          letterSpacing: "0.2em", textTransform: "uppercase",
          cursor: todoMarcado ? "pointer" : "not-allowed",
          marginBottom: "0.8rem", transition: "all 0.2s",
        }}
      >
        {enviando ? "Enviando..." : "Enviar respuesta"}
      </button>
      <button onClick={onVolver} style={{
        width: "100%", padding: "0.7rem",
        background: "transparent", border: "1px solid #E2D5C0",
        borderRadius: "2px", fontFamily: "'Montserrat',sans-serif",
        fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase",
        color: "#B5A090", cursor: "pointer",
      }}>
        ← Volver a la invitación
      </button>
    </div>
  );
}

// ── Esquinas decorativas ───────────────────────────────
function CornerDecor() {
  const style = (top: boolean, left: boolean): React.CSSProperties => ({
    position: "absolute",
    top: top ? "10px" : "auto", bottom: top ? "auto" : "10px",
    left: left ? "10px" : "auto", right: left ? "auto" : "10px",
    width: "20px", height: "20px",
    borderTop: top ? "1px solid #D4A832" : "none",
    borderBottom: top ? "none" : "1px solid #D4A832",
    borderLeft: left ? "1px solid #D4A832" : "none",
    borderRight: left ? "none" : "1px solid #D4A832",
    opacity: 0.6,
  });
  return (
    <>
      <div style={style(true, true)} />
      <div style={style(true, false)} />
      <div style={style(false, true)} />
      <div style={style(false, false)} />
    </>
  );
}