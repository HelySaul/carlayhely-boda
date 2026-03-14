"use client";
// ── TabInvitaciones.tsx ───────────────────────────────────────────────────────

import { useState, useCallback, useRef } from "react";
import { Mail as MailIcon, CalendarCheck as CalendarCheckIcon } from "lucide-react";
import { type Invitacion, type Invitado, type FiltrosState } from "./types";
import { fechaCorta } from "./helpers";
import { ModalShell } from "./ModalShell";
import { inputStyle, btnPrimary, btnOutline } from "./styles";
import { BarraFiltros } from "./BarraFiltros";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ mensaje, visible }: { mensaje: string; visible: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: "1.8rem", left: "50%",
      transform: `translateX(-50%) translateY(${visible ? "0" : "12px"})`,
      opacity: visible ? 1 : 0,
      transition: "opacity 0.22s ease, transform 0.22s ease",
      pointerEvents: "none", zIndex: 999,
      background: "var(--ink)", color: "var(--cream)",
      padding: "0.5rem 1.1rem", borderRadius: "20px",
      fontFamily: "'Montserrat', sans-serif",
      fontSize: "0.65rem", letterSpacing: "0.08em",
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      whiteSpace: "nowrap",
    }}>
      {mensaje}
    </div>
  );
}

function useToast() {
  const [state, setState] = useState({ mensaje: "", visible: false });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback((mensaje: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState({ mensaje, visible: true });
    timeoutRef.current = setTimeout(() => setState(s => ({ ...s, visible: false })), 2000);
  }, []);

  return { toast: state, mostrar };
}

// ── Helpers de texto ──────────────────────────────────────────────────────────

function primerNombre(nombre: string) { return nombre.split(" ")[0]; }

function saludoInvitados(invitados: Invitado[]): string {
  const nombres = invitados.map(i => primerNombre(i.nombre));
  const lista = nombres.length === 1
    ? nombres[0]
    : nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];
  if (invitados.length === 1) {
    return invitados[0].sexo === "F" ? `Querida ${lista},` : `Querido ${lista},`;
  }
  const todasF = invitados.every(i => i.sexo === "F");
  return todasF ? `Queridas ${lista},` : `Queridos ${lista},`;
}

function mensajeInvitacion(invitados: Invitado[], link: string): string {
  const saludo  = saludoInvitados(invitados);
  const esGrupo = invitados.length > 1;
  return `${saludo}\n\n${link}\n\nCon mucho cariño queremos contarte que ${esGrupo ? "son parte" : "eres parte"} de nuestra boda. Preparamos ${esGrupo ? "su" : "tu"} invitación con amor — ábrela cuando ${esGrupo ? "puedan" : "puedas"} 🤍`;
}

function mensajeConfirmacion(invitados: Invitado[], ronda: 1 | 2 | 3, link: string): string {
  const saludo  = saludoInvitados(invitados);
  const esGrupo = invitados.length > 1;
  if (ronda === 1) return `${saludo}\n\n${link}\n\nCon mucho cariño queremos contarte que ${esGrupo ? "son parte" : "eres parte"} de nuestra boda. Preparamos ${esGrupo ? "su" : "tu"} invitación con amor — ábrela cuando ${esGrupo ? "puedan" : "puedas"} 🤍`;
  if (ronda === 2) return `${saludo}\n\n${link}\n\nYa falta poco y queremos ${esGrupo ? "tenerlos presentes" : "tenerte presente"}. ${esGrupo ? "Les" : "Te"} pedimos que ${esGrupo ? "confirmen su" : "confirmes tu"} asistencia una vez más, para poder organizarlo todo con el cuidado que ${esGrupo ? "merecen" : "mereces"} 🤍`;
  return `${saludo}\n\n${link}\n\nEste es nuestro último aviso antes del gran día. Los espacios son limitados y necesitamos ${esGrupo ? "su confirmación para reservar los suyos" : "tu confirmación para reservar el tuyo"} 🤍`;
}

// ── Three-way check ───────────────────────────────────────────────────────────
type TriState = boolean | null;

function TriCheck({ value, label, fecha, color, onChange }: {
  value: TriState; label: string; fecha: string | null; color: string;
  onChange: (next: TriState) => void;
}) {
  function ciclar() {
    if (value === null) onChange(true);
    else if (value === true) onChange(false);
    else onChange(null);
  }
  const icon    = value === true ? "✓" : value === false ? "✗" : "·";
  const fgColor = value === true ? color : value === false ? "var(--red)" : "var(--ink-light)";
  const bg      = value === true ? `${color}18` : value === false ? "rgba(201,79,79,0.08)" : "transparent";
  const border  = value === true ? `1px solid ${color}55` : value === false ? "1px solid rgba(201,79,79,0.3)" : "1px solid var(--border-subtle)";

  return (
    <button onClick={ciclar} title={value === null ? "Sin respuesta" : value ? "Confirmó" : "Rechazó"} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: "0.1rem",
      background: bg, border, borderRadius: "3px",
      padding: "0.25rem 0.45rem", cursor: "pointer", minWidth: "36px",
      transition: "all 0.15s",
    }}>
      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: fgColor, lineHeight: 1 }}>{icon}</span>
      <span className="sans" style={{ fontSize: "0.48rem", letterSpacing: "0.06em", textTransform: "uppercase", color: fgColor }}>{label}</span>
      {value !== null && fecha && (
        <span className="sans" style={{ fontSize: "0.44rem", color: "var(--ink-light)" }}>{fechaCorta(fecha)}</span>
      )}
    </button>
  );
}

// ── Indicador de ronda (header, sin abrir) ────────────────────────────────────
function IndicadorRonda({ invitados, ronda, color }: {
  invitados: Invitado[]; ronda: 1 | 2 | 3; color: string;
}) {
  const campo     = ronda === 1 ? "confirmacion_1" : ronda === 2 ? "confirmacion_2" : "confirmacion_3";
  const valores   = invitados.map(i => i[campo] as TriState);
  const total     = valores.length;
  const conf      = valores.filter(v => v === true).length;
  const rech      = valores.filter(v => v === false).length;
  const sin       = valores.filter(v => v === null).length;

  let icono: string;
  let fg: string;
  if (sin === total)  { icono = "—"; fg = "var(--ink-light)"; }
  else if (conf === total) { icono = "✓"; fg = color; }
  else if (rech === total) { icono = "✗"; fg = "var(--red)"; }
  else {
    const partes: string[] = [];
    if (conf > 0) partes.push("✓");
    if (rech > 0) partes.push("✗");
    if (sin > 0)  partes.push("—");
    icono = partes.join(" "); fg = "var(--ink-mid)";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.1rem", minWidth: "28px" }}>
      <span className="sans" style={{ fontSize: "0.44rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-light)" }}>R{ronda}</span>
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: fg, lineHeight: 1 }}>{icono}</span>
    </div>
  );
}

// ── FilaInvitado ──────────────────────────────────────────────────────────────
function FilaInvitado({ inv, codigo, onUpdate, onUpdateTexto, onDelete }: {
  inv: Invitado; codigo: string;
  onUpdate: (id: string, field: string, val: TriState) => void;
  onUpdateTexto: (id: string, nombre: string, whatsapp: string, sexo: string | null) => void;
  onDelete: (id: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre]     = useState(inv.nombre);
  const [whatsapp, setWhatsapp] = useState(inv.whatsapp ?? "");
  const [sexo, setSexo]         = useState(inv.sexo ?? "");

  function guardar() {
    onUpdateTexto(inv.id, nombre.trim() || inv.nombre, whatsapp.trim(), sexo || null);
    setEditando(false);
  }

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.35rem", padding: "0.65rem 0.8rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "0.5rem" }}>
        <div style={{ flex: 1 }}>
          {editando ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" style={{ ...inputStyle, fontSize: "16px" }} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (opcional)" style={{ ...inputStyle, fontSize: "16px", flex: 1 }} />
                <select value={sexo} onChange={e => setSexo(e.target.value)} style={{ ...inputStyle, fontSize: "16px", flex: "0 0 70px", cursor: "pointer" }}>
                  <option value="">—</option><option value="M">M</option><option value="F">F</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={guardar} style={{ ...btnPrimary, padding: "0.35rem 0.8rem", fontSize: "0.6rem" }}>Guardar</button>
                <button onClick={() => { setEditando(false); setNombre(inv.nombre); setWhatsapp(inv.whatsapp ?? ""); }} style={{ ...btnOutline, padding: "0.35rem 0.8rem", fontSize: "0.6rem" }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <span className="sans" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--ink)" }}>{inv.nombre}</span>
              {inv.sexo && <span className="sans" style={{ fontSize: "0.6rem", color: "var(--ink-light)", background: "var(--cream-mid)", padding: "0.1rem 0.4rem", borderRadius: "2px" }}>{inv.sexo}</span>}
              {inv.whatsapp && <span className="sans" style={{ fontSize: "0.6rem", color: "var(--ink-light)" }}>{inv.whatsapp}</span>}
              <button onClick={() => setEditando(true)} style={{ background: "none", border: "none", color: "var(--terracotta)", cursor: "pointer", fontSize: "0.62rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "underline", padding: 0 }}>editar</button>
            </div>
          )}
        </div>
        {!editando && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <span className="sans" style={{ fontSize: "0.62rem", color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.15rem 0.5rem", borderRadius: "2px" }}>{codigo}</span>
            <button onClick={() => { if (confirm(`¿Eliminar a ${inv.nombre}?`)) onDelete(inv.id); }} style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "1rem", padding: 0, lineHeight: 1 }}>×</button>
          </div>
        )}
      </div>
      {!editando && (
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
          <TriCheck value={inv.confirmacion_1 as TriState} fecha={inv.confirmacion_1_fecha} label="R1" color="var(--olive)"      onChange={v => onUpdate(inv.id, "confirmacion_1", v)} />
          <TriCheck value={inv.confirmacion_2 as TriState} fecha={inv.confirmacion_2_fecha} label="R2" color="var(--periwinkle)" onChange={v => onUpdate(inv.id, "confirmacion_2", v)} />
          <TriCheck value={inv.confirmacion_3 as TriState} fecha={inv.confirmacion_3_fecha} label="R3" color="var(--gold)"       onChange={v => onUpdate(inv.id, "confirmacion_3", v)} />
          <TriCheck value={inv.asistio as TriState}        fecha={null}                     label="Asistió" color="var(--terracotta)" onChange={v => onUpdate(inv.id, "asistio", v)} />
          <span className="sans" style={{ fontSize: "0.52rem", color: "var(--ink-light)", marginLeft: "0.2rem" }}>· → ✓ → ✗</span>
        </div>
      )}
    </div>
  );
}

// ── ModalMensaje ──────────────────────────────────────────────────────────────
function ModalMensaje({ titulo, mensaje, onClose, onCopy }: {
  titulo: string; mensaje: string; onClose: () => void; onCopy?: (msg: string) => void;
}) {
  function copiar() {
    navigator.clipboard.writeText(mensaje);
    onCopy?.("Mensaje copiado");
    onClose();
  }
  return (
    <ModalShell onClose={onClose} maxWidth="520px" zIndex={600}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <p className="sans" style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--terracotta)" }}>{titulo}</p>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--ink-light)", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1 }}>×</button>
      </div>
      <pre className="sans" style={{ fontSize: "0.82rem", color: "var(--ink-mid)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: "0 0 1.2rem", background: "var(--cream-mid)", padding: "0.9rem", borderRadius: "2px", border: "1px solid var(--border-subtle)" }}>
        {mensaje}
      </pre>
      <button onClick={copiar} style={{ ...btnPrimary, width: "100%", padding: "0.75rem", fontSize: "0.65rem" }}>
        Copiar mensaje
      </button>
    </ModalShell>
  );
}

// ── BloqueAcciones ────────────────────────────────────────────────────────────
function BloqueAcciones({ invitados, codigo, rondaActual, onCopy }: {
  invitados: Invitado[]; codigo: string; rondaActual: 1 | 2 | 3; onCopy: (msg: string) => void;
}) {
  const [modal, setModal] = useState<"inv" | "conf" | null>(null);
  const origin   = typeof window !== "undefined" ? window.location.origin : "";
  const linkInv  = `${origin}/invitacion/${codigo}`;
  const linkConf = `${origin}/confirmar/${codigo}/${rondaActual}`;
  const msgInv   = mensajeInvitacion(invitados, linkInv);
  const msgConf  = mensajeConfirmacion(invitados, rondaActual, linkConf);

  const iconBtn: React.CSSProperties = {
    width: "36px", height: "36px",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid var(--border-subtle)",
    borderRadius: "4px", cursor: "pointer", flexShrink: 0,
    transition: "border-color 0.15s, background 0.15s",
    color: "var(--ink-mid)",
  };

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>

        {/* Mensaje invitación — abre modal */}
        <button
          title="Ver mensaje de invitación"
          onClick={e => { e.stopPropagation(); setModal("inv"); }}
          style={iconBtn}
        >
          <MailIcon size={15} />
        </button>

        {/* Mensaje confirmación R2/R3 — solo si ronda >= 2 */}
        {rondaActual >= 2 && (
          <button
            title={`Ver mensaje confirmación R${rondaActual}`}
            onClick={e => { e.stopPropagation(); setModal("conf"); }}
            style={iconBtn}
          >
            <CalendarCheckIcon size={15} />
          </button>
        )}
      </div>

      {modal === "inv"  && <ModalMensaje titulo="Mensaje invitación" mensaje={msgInv} onClose={() => setModal(null)} onCopy={onCopy} />}
      {modal === "conf" && <ModalMensaje titulo={`Mensaje confirmación R${rondaActual}`} mensaje={msgConf} onClose={() => setModal(null)} onCopy={onCopy} />}
    </>
  );
}

// ── TarjetaInvitacion ─────────────────────────────────────────────────────────
function TarjetaInvitacion({ invitacion, rondaActual, onUpdateInv, onUpdateTexto, onUpdateNombreGrupo, onDeleteInv, onDeleteInvitacion, onAddPersona }: {
  invitacion: Invitacion; rondaActual: 1 | 2 | 3;
  onUpdateInv: (invId: string, invId2: string, field: string, val: TriState) => void;
  onUpdateTexto: (invitacionId: string, invId: string, nombre: string, whatsapp: string, sexo?: string | null) => void;
  onUpdateNombreGrupo: (id: string, nombre: string | null) => void;
  onDeleteInv: (invId: string, invId2: string) => void;
  onDeleteInvitacion: (id: string) => void;
  onAddPersona: (r: Invitacion) => void;
}) {
  const [open, setOpen]               = useState(false);
  const [editNombre, setEditNombre]   = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(invitacion.nombre ?? "");
  const { toast, mostrar }            = useToast();
  const total = invitacion.invitados.length;

  function guardarNombre() { onUpdateNombreGrupo(invitacion.id, nuevoNombre.trim() || null); setEditNombre(false); }

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.6rem" }}>
      <Toast mensaje={toast.mensaje} visible={toast.visible} />

      {/* Header */}
      <div onClick={() => !editNombre && setOpen(o => !o)} style={{ padding: "0.9rem 1rem", cursor: editNombre ? "default" : "pointer" }}>

        {/* Fila 1: código · indicadores · flecha */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.45rem" }}>
          <span className="sans" style={{ fontSize: "1rem", letterSpacing: "0.08em", color: "var(--terracotta)", fontWeight: 700, flexShrink: 0 }}>{invitacion.codigo}</span>
          {!editNombre && (
            <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <IndicadorRonda invitados={invitacion.invitados} ronda={1} color="var(--olive)" />
              <IndicadorRonda invitados={invitacion.invitados} ronda={2} color="var(--periwinkle)" />
              <IndicadorRonda invitados={invitacion.invitados} ronda={3} color="var(--gold)" />
            </div>
          )}
          <div style={{ flex: 1 }} />
          {!editNombre && (
            <span style={{ color: "var(--ink-light)", fontSize: "0.65rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
          )}
        </div>

        {/* Fila 2: nombre/invitados · meta */}
        {editNombre ? (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={e => e.stopPropagation()}>
            <input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Nombre del grupo (opcional)" style={{ ...inputStyle, flex: 1, fontSize: "14px", padding: "0.4rem 0.6rem" }} autoFocus />
            <button onClick={guardarNombre} style={{ ...btnPrimary, padding: "0.4rem 0.8rem", fontSize: "0.6rem" }}>OK</button>
            <button onClick={() => { setEditNombre(false); setNuevoNombre(invitacion.nombre ?? ""); }} style={{ ...btnOutline, padding: "0.4rem 0.6rem", fontSize: "0.6rem" }}>×</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {invitacion.nombre && (
                <strong className="sans" style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.15rem" }}>{invitacion.nombre}</strong>
              )}
              <span className="sans" style={{ fontSize: "0.78rem", color: "var(--ink-light)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {invitacion.invitados.map(i => i.nombre).join(", ")}
              </span>
              <button onClick={e => { e.stopPropagation(); setEditNombre(true); }} style={{ background: "none", border: "none", color: "var(--terracotta)", cursor: "pointer", fontSize: "0.58rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "underline", padding: 0, marginTop: "0.25rem" }}>
                {invitacion.nombre ? "editar nombre" : "+ nombre grupo"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", flexShrink: 0 }}>
              <span className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)" }}>{total} {total === 1 ? "persona" : "personas"}</span>
              {invitacion.creado_por && (
                <span className="sans" style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.15rem 0.5rem", borderRadius: "2px" }}>por {invitacion.creado_por}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contenido expandido */}
      {open && (
        <div style={{ padding: "0 1.2rem 1.2rem" }}>
            <BloqueAcciones invitados={invitacion.invitados} codigo={invitacion.codigo} rondaActual={rondaActual} onCopy={mostrar} />
          {invitacion.invitados.map(inv => (
            <FilaInvitado key={inv.id} inv={inv} codigo={invitacion.codigo}
              onUpdate={(id, field, val) => onUpdateInv(invitacion.id, id, field, val)}
              onUpdateTexto={(id, nombre, whatsapp, sexo) => onUpdateTexto(invitacion.id, id, nombre, whatsapp, sexo)}
              onDelete={(id) => onDeleteInv(invitacion.id, id)}
            />
          ))}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
            <button onClick={() => onAddPersona(invitacion)} style={btnOutline}>+ Agregar persona</button>
            <button onClick={() => { if (confirm(`¿Eliminar invitación ${invitacion.codigo}?`)) onDeleteInvitacion(invitacion.id); }} style={{ ...btnOutline, color: "var(--red)", borderColor: "var(--red)" }}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TabInvitaciones ───────────────────────────────────────────────────────────
export function TabInvitaciones({ invitaciones, filtros, rondaActual, onNueva, onUpdateInv, onUpdateTexto, onUpdateNombreGrupo, onDeleteInv, onDeleteInvitacion, onAddPersona }: {
  invitaciones: Invitacion[];
  filtros: FiltrosState;
  rondaActual: 1 | 2 | 3;
  onNueva: () => void;
  onUpdateInv: (invId: string, invId2: string, field: string, val: TriState) => void;
  onUpdateTexto: (invitacionId: string, invId: string, nombre: string, whatsapp: string, sexo?: string | null) => void;
  onUpdateNombreGrupo: (id: string, nombre: string | null) => void;
  onDeleteInv: (invId: string, invId2: string) => void;
  onDeleteInvitacion: (id: string) => void;
  onAddPersona: (r: Invitacion) => void;
}) {
  return (
    <>
      <BarraFiltros {...filtros} extra={<button onClick={onNueva} style={btnPrimary}>+ Nueva</button>} />
      <p className="sans" style={{ fontSize: "0.8rem", color: "var(--ink-light)", marginBottom: "0.8rem" }}>{invitaciones.length} invitaciones</p>
      {invitaciones.length === 0
        ? <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Sin resultados.</p>
        : invitaciones.map(r => (
          <TarjetaInvitacion key={r.id} invitacion={r} rondaActual={rondaActual}
            onUpdateInv={onUpdateInv} onUpdateTexto={onUpdateTexto}
            onUpdateNombreGrupo={onUpdateNombreGrupo}
            onDeleteInv={onDeleteInv} onDeleteInvitacion={onDeleteInvitacion}
            onAddPersona={onAddPersona}
          />
        ))
      }
    </>
  );
}