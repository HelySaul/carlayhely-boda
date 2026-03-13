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
    const t = i.sexo === "F" ? "Querida" : "Querido";
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
  const [fase, setFase] = useState<"sobre" | "floreciendo" | "abierto" | "gracias">("sobre");
  const [confirmaciones, setConfirmaciones] = useState<Record<string, boolean>>({});
  const [whatsapps, setWhatsapps] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [declinados, setDeclinados] = useState<Record<string, boolean>>({});
  const [rondaActual, setRondaActual] = useState(1);

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

  function abrirSobre() {
    setFase("floreciendo");
    setTimeout(() => setFase("abierto"), 2200);
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

  return (
    <div style={{
      minHeight: "100svh",
      background: "linear-gradient(160deg, #FDFAF6 0%, #FAF2EA 50%, #F6F8F2 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem 1rem",
      fontFamily: "'Montserrat', sans-serif",
      position: "relative",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        @font-face { font-family: 'PinyonScript'; src: url('/fonts/PinyonScript-Regular.ttf'); }
        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes tarjetaSube  { 0%{opacity:0;transform:translateY(50px) scale(0.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes graciasFade  { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
        @keyframes sobreFlota   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-5px)} }
        @keyframes pulso        { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.03)} }
        @keyframes florExplota  {
          0%   { opacity:0; transform: translate(0,0) scale(0.1) rotate(0deg); }
          20%  { opacity:1; }
          60%  { opacity:1; transform: translate(var(--fx), var(--fy)) scale(1.15) rotate(var(--fr)); }
          85%  { opacity:0.5; transform: translate(calc(var(--fx)*1.55), calc(var(--fy)*1.55)) scale(0.85) rotate(calc(var(--fr)*1.5)); }
          100% { opacity:0; transform: translate(calc(var(--fx)*2.3), calc(var(--fy)*2.3)) scale(0.2) rotate(calc(var(--fr)*2)); }
        }
        @keyframes fondoFlores  {
          0%   { opacity:0; }
          25%  { opacity:1; }
          70%  { opacity:1; }
          100% { opacity:0; }
        }
        .tarjeta-entra { animation: tarjetaSube 0.9s cubic-bezier(0.22,1,0.36,1) forwards; }
        .gracias-entra { animation: graciasFade 0.6s ease forwards; }
      `}</style>

      {/* ── Manchas de fondo — igual que Hero ─────── */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "0", width: "clamp(220px,55vw,420px)", height: "clamp(220px,55vw,420px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,79,79,0.32) 0%, rgba(212,105,58,0.14) 50%, transparent 75%)" }} />
        <div style={{ position: "absolute", bottom: "0%", left: "0", width: "clamp(180px,45vw,340px)", height: "clamp(180px,45vw,340px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.30) 0%, rgba(122,148,56,0.10) 55%, transparent 75%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "5%", width: "clamp(80px,18vw,140px)", height: "clamp(80px,18vw,140px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,50,0.22) 0%, transparent 70%)" }} />
      </div>

      {/* Tulipanes sutiles en el fondo — esquinas de la página */}
      <div style={{ position: "absolute", left: 0, bottom: 0, pointerEvents: "none", opacity: 0.28, zIndex: 0 }}>
        <TulipSVG size={130} petalColor="#C94F4F" petalColor2="#D4693A" rotate={8} />
      </div>
      <div style={{ position: "absolute", left: 22, bottom: 0, pointerEvents: "none", opacity: 0.18, zIndex: 0 }}>
        <TulipSVG size={90} petalColor="#D4A832" petalColor2="#C94F4F" rotate={-4} />
      </div>
      <div style={{ position: "absolute", right: 0, top: 0, pointerEvents: "none", opacity: 0.22, zIndex: 0, transform: "scaleX(-1)" }}>
        <TulipSVG size={110} petalColor="#9B8BB4" petalColor2="#D4A832" rotate={-10} />
      </div>
      <div style={{ position: "absolute", right: 20, top: 0, pointerEvents: "none", opacity: 0.15, zIndex: 0, transform: "scaleX(-1)" }}>
        <TulipSVG size={75} petalColor="#D4693A" petalColor2="#9B8BB4" rotate={-18} />
      </div>

      {/* ── FASE: SOBRE ─────────────────────────────── */}
      {fase === "sobre" && (
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

          {/* ── Tarjeta estilo cartulina embossed — horizontal ── */}
          <div
            onClick={() => abrirSobre()}
            style={{
              position: "relative",
              width: "min(360px, 90vw)",
              cursor: "pointer",
              animation: "sobreFlota 4s ease-in-out infinite",
              filter: "drop-shadow(0 18px 50px rgba(60,30,20,0.15)) drop-shadow(0 4px 14px rgba(60,30,20,0.09))",
            }}
          >
            <svg
              viewBox="0 0 360 190"
              style={{ width: "100%", display: "block" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Fondo cartulina marfil */}
                <linearGradient id="cartulina" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEFCF9"/>
                  <stop offset="40%" stopColor="#FBF7F2"/>
                  <stop offset="100%" stopColor="#F7F2EC"/>
                </linearGradient>
                {/* Cinta central satinada */}
                <linearGradient id="cinta" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(230,210,200,0.0)"/>
                  <stop offset="20%" stopColor="rgba(230,210,200,0.22)"/>
                  <stop offset="50%" stopColor="rgba(235,218,208,0.38)"/>
                  <stop offset="80%" stopColor="rgba(230,210,200,0.22)"/>
                  <stop offset="100%" stopColor="rgba(230,210,200,0.0)"/>
                </linearGradient>
                {/* Sombra horizontal solapa */}
                <linearGradient id="solapaSombraH" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(160,130,110,0.18)"/>
                  <stop offset="100%" stopColor="rgba(160,130,110,0.0)"/>
                </linearGradient>
                {/* Sombra suave para dar volumen a las rosas */}
                <filter id="rosaSombra" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="rgba(100,70,60,0.22)"/>
                </filter>
                <filter id="rosaSombraChica" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0.5" dy="1.5" stdDeviation="1.8" floodColor="rgba(100,70,60,0.18)"/>
                </filter>
                {/* Plata metálica */}
                <linearGradient id="plata" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8E8E8"/>
                  <stop offset="40%" stopColor="#D0D0D0"/>
                  <stop offset="70%" stopColor="#C4C4C4"/>
                  <stop offset="100%" stopColor="#B8B8B8"/>
                </linearGradient>
                <linearGradient id="plataBrillo" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F0F0F0"/>
                  <stop offset="50%" stopColor="#C8C8C8"/>
                  <stop offset="100%" stopColor="#A8A8A8"/>
                </linearGradient>
                {/* Textura embossed — patrón floral en relieve */}
                <pattern id="emboss" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  {/* Rama curva */}
                  <path d="M5 35 Q12 20 20 15 Q28 10 35 5" stroke="rgba(180,160,145,0.13)" strokeWidth="0.8" fill="none"/>
                  {/* Hojita izquierda */}
                  <path d="M12 26 Q8 20 12 16 Q14 22 12 26Z" fill="rgba(180,160,145,0.10)"/>
                  {/* Hojita derecha */}
                  <path d="M22 18 Q26 12 30 14 Q26 18 22 18Z" fill="rgba(180,160,145,0.09)"/>
                  {/* Florcita */}
                  <circle cx="20" cy="15" r="2.5" fill="none" stroke="rgba(180,160,145,0.11)" strokeWidth="0.6"/>
                  <circle cx="20" cy="15" r="1" fill="rgba(180,160,145,0.12)"/>
                  {/* Otra ramita */}
                  <path d="M0 20 Q6 15 10 8" stroke="rgba(180,160,145,0.09)" strokeWidth="0.6" fill="none"/>
                  <path d="M6 14 Q3 10 6 7 Q8 11 6 14Z" fill="rgba(180,160,145,0.08)"/>
                </pattern>
              </defs>

              {/* ── Cuerpo cartulina ── */}
              <rect x="0" y="0" width="360" height="190" rx="3" fill="url(#cartulina)"/>
              {/* Patrón embossed en toda la superficie */}
              <rect x="0" y="0" width="360" height="190" rx="3" fill="url(#emboss)"/>
              {/* Sombra interior sutil en bordes para dar grosor */}
              <rect x="0" y="0" width="360" height="190" rx="3" fill="none"
                stroke="rgba(160,130,110,0.12)" strokeWidth="2"/>

              {/* ── Solapa horizontal superior — línea sutil tipo sobre de tarjeta de crédito ── */}
              <line x1="0" y1="28" x2="360" y2="28" stroke="rgba(185,160,145,0.28)" strokeWidth="0.8"/>
              {/* Sombra suave debajo de la solapa */}
              <rect x="0" y="28" width="360" height="4" fill="url(#solapaSombraH)" opacity="0.5"/>
              {/* Pequeña muesca central indicando que se puede abrir */}
              <path d="M175 28 Q180 33 185 28" stroke="rgba(185,160,145,0.40)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>

              {/* ── Cinta vertical central sutil ── */}
              <rect x="170" y="0" width="20" height="190" fill="url(#cinta)"/>

              {/* ══ ARREGLO FLORAL — estilo acuarela orgánico ══ */}

              {/* Hojas y follaje detrás — difusos, orgánicos */}
              <g opacity="0.55">
                {/* Hoja izquierda grande */}
                <path d="M148 72 Q138 58 142 44 Q150 56 152 68Z" fill="#8A9A62" opacity="0.5"/>
                <path d="M148 72 Q140 60 146 46 Q153 60 150 70Z" fill="#9AAA72" opacity="0.35"/>
                {/* Hoja izquierda pequeña */}
                <path d="M158 65 Q150 54 154 44 Q160 54 161 63Z" fill="#8A9A62" opacity="0.45"/>
                {/* Hoja derecha grande */}
                <path d="M212 72 Q222 58 218 44 Q210 56 208 68Z" fill="#8A9A62" opacity="0.5"/>
                <path d="M212 72 Q220 60 214 46 Q207 60 210 70Z" fill="#9AAA72" opacity="0.35"/>
                {/* Hoja derecha pequeña */}
                <path d="M202 65 Q210 54 206 44 Q200 54 199 63Z" fill="#8A9A62" opacity="0.45"/>
                {/* Ramita central */}
                <path d="M178 68 Q176 55 180 42" stroke="#9AAA72" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6"/>
                <path d="M182 68 Q184 55 180 42" stroke="#8A9A62" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5"/>
              </g>

              {/* Ramitas plateadas — berries metálicos orgánicos */}
              <g opacity="0.82">
                {/* Rama izquierda — curva natural */}
                <path d="M162 62 Q155 50 149 38 Q146 30 148 22" stroke="url(#plata)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                <circle cx="148" cy="22" r="3.8" fill="url(#plataBrillo)"/>
                <circle cx="144" cy="27" r="3" fill="url(#plataBrillo)" opacity="0.9"/>
                <circle cx="150" cy="17" r="2.5" fill="url(#plataBrillo)" opacity="0.85"/>
                <circle cx="153" cy="24" r="2.2" fill="url(#plataBrillo)" opacity="0.8"/>
                <path d="M155 52 Q150 42 146 32" stroke="url(#plata)" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7"/>
                <circle cx="146" cy="32" r="2.5" fill="url(#plataBrillo)" opacity="0.75"/>
                <circle cx="143" cy="36" r="2" fill="url(#plataBrillo)" opacity="0.7"/>
                {/* Rama derecha — espejada con ligera variación */}
                <path d="M198 62 Q205 50 211 38 Q214 30 212 22" stroke="url(#plata)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                <circle cx="212" cy="22" r="3.8" fill="url(#plataBrillo)"/>
                <circle cx="216" cy="27" r="3" fill="url(#plataBrillo)" opacity="0.9"/>
                <circle cx="210" cy="17" r="2.5" fill="url(#plataBrillo)" opacity="0.85"/>
                <circle cx="207" cy="24" r="2.2" fill="url(#plataBrillo)" opacity="0.8"/>
                <path d="M205 52 Q210 42 214 32" stroke="url(#plata)" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.7"/>
                <circle cx="214" cy="32" r="2.5" fill="url(#plataBrillo)" opacity="0.75"/>
                <circle cx="217" cy="36" r="2" fill="url(#plataBrillo)" opacity="0.7"/>
                {/* Ramitas centrales */}
                <path d="M178 55 Q174 44 172 32" stroke="url(#plata)" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.65"/>
                <circle cx="172" cy="32" r="2" fill="url(#plataBrillo)" opacity="0.7"/>
                <circle cx="170" cy="27" r="1.6" fill="url(#plataBrillo)" opacity="0.65"/>
                <path d="M182 55 Q186 44 188 32" stroke="url(#plata)" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.65"/>
                <circle cx="188" cy="32" r="2" fill="url(#plataBrillo)" opacity="0.7"/>
                <circle cx="190" cy="27" r="1.6" fill="url(#plataBrillo)" opacity="0.65"/>
              </g>

              {/* ── Rosa pequeña izquierda — estilo acuarela, pétalos asimétricos ── */}
              <g transform="translate(157, 60)" filter="url(#rosaSombraChica)">
                {/* Pétalos exteriores asimétricos — capa 1 */}
                <path d="M3,-17 Q11,-12 13,-2 Q11,9 3,13 Q-5,14 -11,7 Q-14,-3 -9,-12 Q-4,-17 3,-17Z" fill="#FEFEFE" stroke="#EAE0D8" strokeWidth="0.5"/>
                {/* Pétalo izquierdo saliente */}
                <path d="M-9,-8 Q-16,-10 -16,-4 Q-14,1 -9,2Z" fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.9"/>
                {/* Pétalo derecho saliente */}
                <path d="M11,-4 Q17,-6 17,0 Q16,5 11,6Z" fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.9"/>
                {/* Pétalo inferior */}
                <path d="M3,12 Q8,15 6,19 Q1,17 -3,15 Q-2,11 3,12Z" fill="#F8F4F0" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.85"/>
                {/* Capa media */}
                <path d="M3,-11 Q8,-7 9,0 Q8,7 2,9 Q-4,8 -7,2 Q-7,-5 -3,-9 Q0,-11 3,-11Z" fill="#F5F1EC" stroke="#DDD4CC" strokeWidth="0.4"/>
                {/* Interior */}
                <path d="M3,-6 Q6,-3 6,1 Q5,5 2,6 Q-2,5 -4,1 Q-4,-3 -1,-5 Q1,-6 3,-6Z" fill="#EDE7E0"/>
                {/* Centro */}
                <ellipse cx="2" cy="1" rx="2.5" ry="2" fill="#E0D6CE"/>
                <ellipse cx="2" cy="1" rx="1.2" ry="1" fill="#D4C8C0"/>
              </g>

              {/* ── Rosa grande central — acuarela, mayor volumen ── */}
              <g transform="translate(180, 52)" filter="url(#rosaSombra)">
                {/* Pétalos exteriores — capa 1, muy abiertos */}
                <path d="M2,-23 Q13,-17 16,-5 Q15,9 5,16 Q-5,19 -14,12 Q-19,1 -15,-12 Q-8,-22 2,-23Z" fill="#FEFEFE" stroke="#EAE0D8" strokeWidth="0.6"/>
                {/* Pétalos sueltos — dan sensación real */}
                <path d="M-15,-8 Q-23,-12 -22,-4 Q-20,4 -14,5Z" fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.88"/>
                <path d="M15,-2 Q23,-5 22,3 Q21,9 15,10Z" fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.88"/>
                <path d="M2,17 Q8,21 5,26 Q0,24 -5,21 Q-3,16 2,17Z" fill="#F8F4F0" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.85"/>
                <path d="M-12,10 Q-19,15 -17,20 Q-10,19 -8,14Z" fill="#F8F4F0" stroke="#E4DAD0" strokeWidth="0.4" opacity="0.8"/>
                <path d="M14,10 Q21,15 19,20 Q12,19 10,14Z" fill="#F8F4F0" stroke="#E4DAD0" strokeWidth="0.4" opacity="0.8"/>
                {/* Capa 2 */}
                <path d="M2,-16 Q10,-11 12,-2 Q11,8 3,12 Q-5,13 -11,6 Q-14,-4 -9,-12 Q-4,-16 2,-16Z" fill="#FAF7F3" stroke="#E0D6CC" strokeWidth="0.5"/>
                {/* Capa 3 */}
                <path d="M2,-10 Q7,-6 8,0 Q7,7 1,9 Q-5,8 -8,2 Q-7,-5 -3,-9 Q0,-10 2,-10Z" fill="#F4EEE8"/>
                {/* Capa 4 interior */}
                <path d="M2,-5 Q5,-2 5,1 Q4,5 1,6 Q-3,5 -5,2 Q-4,-2 -1,-4 Q1,-5 2,-5Z" fill="#ECE4DC"/>
                {/* Centro vivo */}
                <ellipse cx="1.5" cy="1" rx="3.5" ry="3" fill="#E4D8CE"/>
                <ellipse cx="1.5" cy="1" rx="2" ry="1.7" fill="#D8CCBF"/>
                <ellipse cx="1.5" cy="1" rx="1" ry="0.8" fill="#CABDB4"/>
              </g>

              {/* ── Rosa pequeña derecha — ligeramente diferente a la izquierda ── */}
              <g transform="translate(203, 61)" filter="url(#rosaSombraChica)">
                <path d="M-2,-16 Q7,-12 10,-2 Q8,9 0,13 Q-8,14 -13,6 Q-15,-4 -10,-12 Q-6,-16 -2,-16Z" fill="#FEFEFE" stroke="#EAE0D8" strokeWidth="0.5"/>
                {/* Pétalos sueltos */}
                <path d="M10,-3 Q16,-6 15,1 Q14,6 10,7Z" fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.9"/>
                <path d="M-13,-4 Q-19,-7 -18,0 Q-17,5 -13,6Z" fill="#FAFAF8" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.88"/>
                <path d="M-1,12 Q3,16 1,19 Q-3,17 -6,14 Q-4,10 -1,12Z" fill="#F8F4F0" stroke="#E8DDD4" strokeWidth="0.4" opacity="0.85"/>
                {/* Capa media */}
                <path d="M-2,-10 Q5,-7 7,0 Q5,7 -1,9 Q-7,8 -10,2 Q-10,-5 -6,-9 Q-4,-10 -2,-10Z" fill="#F5F1EC" stroke="#DDD4CC" strokeWidth="0.4"/>
                {/* Interior */}
                <path d="M-1,-5 Q3,-3 4,1 Q3,5 0,6 Q-4,5 -6,1 Q-5,-3 -2,-5 Q-2,-5 -1,-5Z" fill="#EDE7E0"/>
                <ellipse cx="-1" cy="1" rx="2.5" ry="2" fill="#E0D6CE"/>
                <ellipse cx="-1" cy="1" rx="1.2" ry="1" fill="#D4C8C0"/>
              </g>

              {/* Destellos plata sueltos */}
              <circle cx="168" cy="42" r="1.8" fill="url(#plataBrillo)" opacity="0.65"/>
              <circle cx="192" cy="42" r="1.8" fill="url(#plataBrillo)" opacity="0.65"/>
              <circle cx="176" cy="35" r="1.4" fill="url(#plataBrillo)" opacity="0.6"/>
              <circle cx="184" cy="35" r="1.4" fill="url(#plataBrillo)" opacity="0.6"/>
              <circle cx="180" cy="28" r="1.2" fill="url(#plataBrillo)" opacity="0.55"/>
            </svg>
          </div>

          {/* Texto indicación */}
          <div style={{ textAlign: "center", animation: "pulso 2.8s ease-in-out infinite", marginTop: "0.5rem" }}>
            <p className="serif" style={{ fontStyle: "italic", fontSize: "0.95rem", color: "#9A8880", letterSpacing: "0.04em" }}>
              Toca para abrir tu invitación
            </p>
          </div>
        </div>
      )}

      {/* ── FASE: FLORECIENDO — explosión de flores ── */}
      {fase === "floreciendo" && <ExplosionFlores />}

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
// ── Explosión de flores ────────────────────────────────────────────────────
const FLORES_CONFIG = [
  // [ offsetX%, offsetY%, rotacion, petalColor, petalColor2, size, delay ]
  // Centro → arriba
  [  0, -90, 0,    "#C94F4F", "#D4693A", 70, 0    ],
  [ 15, -85, 20,   "#D4A832", "#C94F4F", 55, 0.04 ],
  [-15, -80, -18,  "#9B8BB4", "#D4A832", 60, 0.06 ],
  // Arriba derecha
  [ 55, -75, 30,   "#D4693A", "#C94F4F", 65, 0.02 ],
  [ 80, -60, -10,  "#C94F4F", "#9B8BB4", 50, 0.08 ],
  [ 95, -40, 45,   "#7A9438", "#D4A832", 58, 0.05 ],
  // Derecha
  [ 110,-15, -25,  "#D4A832", "#D4693A", 72, 0.03 ],
  [ 105, 15, 15,   "#9B8BB4", "#C94F4F", 52, 0.07 ],
  [ 95,  45, -35,  "#C94F4F", "#7A9438", 63, 0.01 ],
  // Abajo derecha
  [ 75,  70, 50,   "#D4693A", "#9B8BB4", 56, 0.09 ],
  [ 45,  88, -20,  "#7A9438", "#C94F4F", 68, 0.04 ],
  [ 20,  95, 10,   "#D4A832", "#D4693A", 54, 0.06 ],
  // Abajo
  [  0,  98, -5,   "#C94F4F", "#D4A832", 70, 0.02 ],
  [-20,  92, 30,   "#9B8BB4", "#7A9438", 58, 0.08 ],
  [-45,  82, -40,  "#D4693A", "#C94F4F", 62, 0.05 ],
  // Abajo izquierda
  [-72,  68, 15,   "#7A9438", "#D4A832", 55, 0.03 ],
  [-92,  42, -22,  "#C94F4F", "#9B8BB4", 67, 0.07 ],
  [-105, 12, 38,   "#D4A832", "#C94F4F", 52, 0.01 ],
  // Izquierda
  [-108,-18, -12,  "#D4693A", "#7A9438", 60, 0.09 ],
  [-98, -45, 28,   "#9B8BB4", "#D4693A", 57, 0.04 ],
  [-82, -65, -30,  "#C94F4F", "#D4A832", 65, 0.06 ],
  // Arriba izquierda
  [-58, -78, 18,   "#7A9438", "#C94F4F", 53, 0.02 ],
  [-30, -88, -8,   "#D4A832", "#9B8BB4", 70, 0.08 ],
  // Extra centro-izquierda y centro-derecha (llenan el medio)
  [ 35, -50, -22,  "#C94F4F", "#D4693A", 48, 0.05 ],
  [-35, -52, 14,   "#9B8BB4", "#D4A832", 50, 0.03 ],
  [ 60,  20, -40,  "#D4693A", "#7A9438", 46, 0.07 ],
  [-60,  18, 25,   "#D4A832", "#C94F4F", 49, 0.09 ],
] as const;

function ExplosionFlores() {
  return (
    <>
      {/* Keyframes individuales por flor — inyectados directo en el DOM */}
      <style>{`
        ${FLORES_CONFIG.map(([fx, fy, fr,,,,delay], i) => `
          @keyframes flor${i} {
            0%   { opacity:0; transform: translate(-50%,-50%) scale(0.08) rotate(0deg); }
            18%  { opacity:1; }
            58%  { opacity:1; transform: translate(calc(-50% + ${fx}vmin), calc(-50% + ${fy}vmin)) scale(1.15) rotate(${fr}deg); }
            82%  { opacity:0.4; transform: translate(calc(-50% + ${(fx as number)*1.6}vmin), calc(-50% + ${(fy as number)*1.6}vmin)) scale(0.8) rotate(${(fr as number)*1.5}deg); }
            100% { opacity:0; transform: translate(calc(-50% + ${(fx as number)*2.4}vmin), calc(-50% + ${(fy as number)*2.4}vmin)) scale(0.15) rotate(${(fr as number)*2}deg); }
          }
        `).join('')}
        @keyframes flashBlanco {
          0%   { opacity: 0; }
          15%  { opacity: 0.85; }
          65%  { opacity: 0.85; }
          100% { opacity: 0; }
        }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 50,
        pointerEvents: "none",
        overflow: "hidden",
      }}>
        {/* Flash crema de fondo */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(253,250,246,0.92) 0%, rgba(250,242,234,0.75) 50%, rgba(246,248,242,0.4) 100%)",
          animation: "flashBlanco 2.2s ease forwards",
        }} />

        {FLORES_CONFIG.map(([fx, fy, fr, p1, p2, sz, delay], i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              animation: `flor${i} 2.2s cubic-bezier(0.25,0.8,0.3,1) ${(delay as number)}s both`,
            }}
          >
            <TulipSVG
              size={sz as number}
              petalColor={p1 as string}
              petalColor2={p2 as string}
              rotate={fr as number}
            />
          </div>
        ))}
      </div>
    </>
  );
}

// ── Tarjeta de invitación ──────────────────────────────────────────────────
function Tarjeta({ inv, esIndividual, todosConfirmaron, algunoConfirmo, rondaActual, codigo }: {
  inv: Invitacion; esIndividual: boolean;
  todosConfirmaron: boolean; algunoConfirmo: boolean;
  rondaActual: number; codigo: string;
}) {
  const invitado = inv.invitados[0];
  const esF = esIndividual && invitado?.sexo === "F";

  return (
    <div style={{
      background: "linear-gradient(160deg, #FDFAF6 0%, #FAF2EA 60%, #F6F8F2 100%)",
      borderRadius: "3px",
      padding: "2.6rem 2rem 2rem",
      boxShadow: "0 12px 50px rgba(80,40,30,0.14), 0 2px 10px rgba(80,40,30,0.08)",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Manchas de fondo — igual que Hero, más vivas */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "45%", height: "45%", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,79,79,0.14) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: "35%", height: "35%", borderRadius: "50%", background: "radial-gradient(circle, rgba(122,148,56,0.13) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%", left: "10%", width: "25%", height: "25%", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,50,0.10) 0%, transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* C & H — logo arriba, estilo Hero */}
        <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
          <h1 className="script" style={{ fontSize: "clamp(3.5rem,16vw,5rem)", color: "#2C2320", lineHeight: 0.95 }}>Carla</h1>
          {/* Separador corazón estilo OurStory */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", maxWidth: "240px", margin: "0.3rem auto 0.2rem" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,79,79,0.4))" }} />
            <span className="serif" style={{ color: "#C94F4F", fontSize: "1.2rem", fontStyle: "italic", lineHeight: 1 }}>♡</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(201,79,79,0.4), transparent)" }} />
          </div>
          <h1 className="script" style={{ fontSize: "clamp(3.5rem,16vw,5rem)", color: "#2C2320", lineHeight: 0.95 }}>Hely</h1>
          {/* Separador ondulado — igual que Hero */}
          <div style={{ margin: "0.9rem auto 0", maxWidth: "220px" }}>
            <svg viewBox="0 0 280 20" fill="none" style={{ width: "100%", height: "20px", display: "block" }}>
              <path d="M10 10 Q70 3 140 10 Q210 17 270 10" stroke="#C94F4F" strokeWidth="0.8" strokeLinecap="round"/>
              <circle cx="140" cy="10" r="2" fill="none" stroke="#D4693A" strokeWidth="0.8"/>
              <path d="M130 10 Q135 6 140 10 Q145 14 150 10" stroke="#D4693A" strokeWidth="0.8" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Saludo personalizado por sexo */}
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

        {/* Separador dorado */}
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

        {/* Separador dorado */}
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
          <div style={{ width: "180px", height: "1px", background: "linear-gradient(90deg, transparent, #D4A832 40%, #D4693A 60%, transparent)", margin: "0 auto 0.9rem", opacity: 0.4 }} />
          <p className="serif" style={{ fontStyle: "italic", fontSize: "0.92rem", color: "#5C4A42", lineHeight: 1.65 }}>
            &ldquo;Todo lo hizo hermoso en su tiempo&rdquo;
          </p>
          <p className="sans" style={{ fontSize: "0.55rem", color: "#D4693A", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "0.3rem" }}>
            Eclesiastés 3 · 11
          </p>
        </div>

        {/* Botón confirmar */}
        {todosConfirmaron ? (
          <div style={{ textAlign: "center" }}>
            <p className="serif" style={{ fontSize: "1rem", color: "#7A9438", fontStyle: "italic" }}>
              {esIndividual ? "¡Ya confirmaste tu asistencia!" : "¡Ya confirmaron su asistencia!"}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <a href={`/confirmar/${codigo}?r=${rondaActual}`} style={{
              display: "block", background: "#C94F4F", color: "#FDFAF6",
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