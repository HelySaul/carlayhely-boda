"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Invitado {
  id: string;
  nombre: string;
  whatsapp: string | null;
  confirmacion_1: boolean;
  confirmacion_2: boolean;
  confirmacion_3: boolean;
}
interface Invitacion {
  id: string;
  codigo: string;
  invitados: Invitado[];
}

function saludo1(invitados: Invitado[]) {
  const primeros = invitados.map(i => i.nombre.split(" ")[0]);
  if (primeros.length === 1) return primeros[0];
  return primeros.slice(0, -1).join(", ") + " y " + primeros[primeros.length - 1];
}

const MENSAJES = {
  2: {
    titulo: "Ya casi llegamos",
    subtitulo: (nombres: string) => `${nombres}, gracias por confirmar antes. Queremos asegurarnos de que todo esté listo para recibirles.`,
    nota: "Sabemos que es la segunda vez que te pedimos esto. Cada confirmación nos ayuda a afinar los detalles para que ese día sea perfecto.",
    btn: "Confirmar de nuevo",
  },
  3: {
    titulo: "¡El gran día se acerca!",
    subtitulo: (nombres: string) => `${nombres}, ya falta muy poco. Queremos tenerte presente en cada detalle.`,
    nota: "Esta es la última confirmación, lo prometemos. Gracias por tu paciencia — es porque queremos que ese día sea tan especial como merecen.",
    btn: "¡Confirmo que voy!",
  },
};

function CornerDecor() {
  const s = (top: boolean, left: boolean): React.CSSProperties => ({
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
  return (<><div style={s(true,true)}/><div style={s(true,false)}/><div style={s(false,true)}/><div style={s(false,false)}/></>);
}

export default function PaginaConfirmar() {
  const { codigo } = useParams<{ codigo: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const ronda = Math.min(3, Math.max(2, parseInt(searchParams.get("r") ?? "2"))) as 2 | 3;

  const [inv, setInv] = useState<Invitacion | null>(null);
  const [error, setError] = useState("");
  const [confirmaciones, setConfirmaciones] = useState<Record<string, boolean>>({});
  const [declinados, setDeclinados] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    fetch(`/api/invitacion?codigo=${codigo}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setInv(d);
        const conf: Record<string, boolean> = {};
        const dec: Record<string, boolean> = {};
        // Pre-marcar según ronda anterior
        const campoAnterior = ronda === 2 ? "confirmacion_1" : "confirmacion_2";
        d.invitados.forEach((i: Invitado) => {
          conf[i.id] = i[campoAnterior] ?? false;
          dec[i.id] = !(i[campoAnterior] ?? true);
        });
        setConfirmaciones(conf);
        setDeclinados(dec);
      })
      .catch(() => setError("No pudimos cargar tu invitación."));
  }, [codigo, ronda]);

  async function confirmar() {
    if (!inv) return;
    setEnviando(true);
    const lista = inv.invitados.map(i => ({ id: i.id, asiste: confirmaciones[i.id] === true }));
    await fetch("/api/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, ronda, confirmaciones: lista }),
    });
    setEnviando(false);
    setListo(true);
    setTimeout(() => router.push("/"), 3500);
  }

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

  const msg = MENSAJES[ronda];
  const esIndividual = inv.invitados.length === 1;
  const todoMarcado = inv.invitados.every(i => confirmaciones[i.id] || declinados[i.id]);
  const nombres = saludo1(inv.invitados);

  if (listo) return (
    <div style={{
      minHeight: "100svh",
      background: "linear-gradient(160deg, #F9F4EE 0%, #F2EBE0 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "2rem", textAlign: "center",
      animation: "graciasFade 0.6s ease forwards",
    }}>
      <style>{`
        @font-face { font-family: 'PinyonScript'; src: url('/fonts/PinyonScript-Regular.ttf'); }
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Montserrat:wght@300;400&display=swap');
        @keyframes graciasFade { 0%{opacity:0;transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
      `}</style>
      <p style={{ fontFamily: "'PinyonScript', serif", fontSize: "3.5rem", color: "#C94F4F", marginBottom: "1rem" }}>Gracias</p>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#5A4535", fontStyle: "italic" }}>
        {ronda === 3 ? "¡Nos vemos el 13 de Junio!" : "Estaremos en contacto pronto."}
      </p>
      <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#B5A090", marginTop: "1rem" }}>Redirigiendo...</p>
    </div>
  );

  return (
    <div style={{
      minHeight: "100svh",
      background: "linear-gradient(160deg, #F9F4EE 0%, #F2EBE0 50%, #EDE3D5 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem 1rem", fontFamily: "'Montserrat', sans-serif",
    }}>
      <style>{`
        @font-face { font-family: 'PinyonScript'; src: url('/fonts/PinyonScript-Regular.ttf'); }
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Montserrat:wght@300;400;500&display=swap');
      `}</style>

      <div style={{
        width: "min(420px, 95vw)",
        background: "#FDFAF6", border: "1px solid #E2D5C0",
        borderRadius: "3px", padding: "2.5rem 2rem",
        boxShadow: "0 4px 32px rgba(0,0,0,0.1)",
        position: "relative",
      }}>
        <CornerDecor />

        {/* Encabezado */}
        <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
          <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.55rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#B5A090", marginBottom: "0.5rem" }}>
            Carla &amp; Hely · 13 · 06 · 2026
          </p>
          <h1 style={{ fontFamily: "'PinyonScript', serif", fontSize: "2.8rem", color: "#3D2B1F", lineHeight: 1, marginBottom: "0.6rem" }}>
            {msg.titulo}
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "#6A5040", fontStyle: "italic", lineHeight: 1.6 }}>
            {msg.subtitulo(nombres)}
          </p>
        </div>

        {/* Nota */}
        <div style={{
          background: "rgba(212,168,50,0.08)", border: "1px solid rgba(212,168,50,0.3)",
          borderRadius: "2px", padding: "1rem 1.2rem", marginBottom: "1.5rem",
        }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "#6A5040", lineHeight: 1.7, fontStyle: "italic" }}>
            {msg.nota}
          </p>
        </div>

        {/* Individual */}
        {esIndividual ? (
          <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.5rem" }}>
            <button
              onClick={() => { setConfirmaciones({ ...confirmaciones, [inv.invitados[0].id]: true }); setDeclinados({ ...declinados, [inv.invitados[0].id]: false }); }}
              style={{
                flex: 1, padding: "1rem",
                background: confirmaciones[inv.invitados[0].id] ? "#7A9438" : "#FDFAF6",
                color: confirmaciones[inv.invitados[0].id] ? "white" : "#3D2B1F",
                border: `1.5px solid ${confirmaciones[inv.invitados[0].id] ? "#7A9438" : "#E2D5C0"}`,
                borderRadius: "2px", fontFamily: "'Montserrat',sans-serif",
                fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >✓ Sí voy</button>
            <button
              onClick={() => { setDeclinados({ ...declinados, [inv.invitados[0].id]: true }); setConfirmaciones({ ...confirmaciones, [inv.invitados[0].id]: false }); }}
              style={{
                flex: 1, padding: "1rem",
                background: declinados[inv.invitados[0].id] ? "#C94F4F" : "#FDFAF6",
                color: declinados[inv.invitados[0].id] ? "white" : "#8A7060",
                border: `1.5px solid ${declinados[inv.invitados[0].id] ? "#C94F4F" : "#E2D5C0"}`,
                borderRadius: "2px", fontFamily: "'Montserrat',sans-serif",
                fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >No podré ir</button>
          </div>
        ) : (
          /* Grupal */
          <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {inv.invitados.map(i => (
              <div key={i.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.8rem 1rem",
                background: confirmaciones[i.id] ? "rgba(122,148,56,0.08)" : declinados[i.id] ? "rgba(201,79,79,0.06)" : "#F9F4EE",
                border: `1px solid ${confirmaciones[i.id] ? "rgba(122,148,56,0.3)" : declinados[i.id] ? "rgba(201,79,79,0.2)" : "#E2D5C0"}`,
                borderRadius: "2px", transition: "all 0.2s",
              }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "#3D2B1F" }}>{i.nombre}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => { setConfirmaciones({ ...confirmaciones, [i.id]: true }); setDeclinados({ ...declinados, [i.id]: false }); }}
                    style={{ padding: "0.4rem 0.9rem", background: confirmaciones[i.id] ? "#7A9438" : "transparent", color: confirmaciones[i.id] ? "white" : "#7A9438", border: "1.5px solid #7A9438", borderRadius: "2px", fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                    Sí
                  </button>
                  <button onClick={() => { setDeclinados({ ...declinados, [i.id]: true }); setConfirmaciones({ ...confirmaciones, [i.id]: false }); }}
                    style={{ padding: "0.4rem 0.9rem", background: declinados[i.id] ? "#C94F4F" : "transparent", color: declinados[i.id] ? "white" : "#C94F4F", border: "1.5px solid #C94F4F", borderRadius: "2px", fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                    No
                  </button>
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
            background: todoMarcado ? "#C94F4F" : "#E2D5C0",
            color: todoMarcado ? "white" : "#B5A090",
            border: "none", borderRadius: "2px",
            fontFamily: "'Montserrat',sans-serif", fontSize: "0.7rem",
            letterSpacing: "0.2em", textTransform: "uppercase",
            cursor: todoMarcado ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {enviando ? "Enviando..." : msg.btn}
        </button>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/" style={{ fontSize: "0.65rem", color: "#B5A090", letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase" }}>
            Ver la página de la boda
          </Link>
        </div>
      </div>
    </div>
  );
}