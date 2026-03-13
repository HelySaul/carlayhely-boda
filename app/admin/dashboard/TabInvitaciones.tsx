"use client";
// ── TabInvitaciones.tsx ───────────────────────────────────────────────────────

import { useState } from "react";
import { type Invitacion, type Invitado, type FiltrosState } from "./types";
import { fechaCorta } from "./helpers";
import { inputStyle, btnPrimary, btnOutline } from "./styles";
import { BarraFiltros } from "./BarraFiltros";

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
  return `${saludo}\n\nCon mucho cariño queremos contarte que ${esGrupo ? "son parte" : "eres parte"} de nuestra boda. Preparamos ${esGrupo ? "su" : "tu"} invitación con amor — ábrela cuando ${esGrupo ? "puedan" : "puedas"} 🤍\n\n${link}`;
}

function mensajeConfirmacion(invitados: Invitado[], ronda: 1 | 2 | 3, link: string): string {
  const saludo  = saludoInvitados(invitados);
  const esGrupo = invitados.length > 1;
  if (ronda === 1) return `${saludo}\n\nCon mucho cariño queremos contarte que ${esGrupo ? "son parte" : "eres parte"} de nuestra boda. Preparamos ${esGrupo ? "su" : "tu"} invitación con amor — ábrela cuando ${esGrupo ? "puedan" : "puedas"} 🤍\n\n${link}`;
  if (ronda === 2) return `${saludo}\n\nYa falta poco y queremos ${esGrupo ? "tenerlos presentes" : "tenerte presente"}. ${esGrupo ? "Les" : "Te"} pedimos que ${esGrupo ? "confirmen su" : "confirmes tu"} asistencia una vez más, para poder organizarlo todo con el cuidado que ${esGrupo ? "merecen" : "mereces"} 🤍\n\n${link}`;
  return `${saludo}\n\nEste es nuestro último aviso antes del gran día. Los espacios son limitados y necesitamos ${esGrupo ? "su confirmación para reservar los suyos" : "tu confirmación para reservar el tuyo"} 🤍\n\n${link}`;
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
    <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.35rem", padding: "0.65rem 0.8rem" }}>
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

// ── LinkRow ───────────────────────────────────────────────────────────────────
function LinkRow({ label, url }: { label: string; url: string }) {
  const [copiado, setCopiado] = useState(false);
  function copiar() { navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 1800); }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
      <span className="sans" style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", minWidth: "110px" }}>{label}</span>
      <span className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-mid)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
      <button onClick={copiar} style={{ ...btnOutline, padding: "0.25rem 0.7rem", fontSize: "0.58rem", flexShrink: 0, ...(copiado ? { borderColor: "var(--olive)", color: "var(--olive)" } : {}) }}>
        {copiado ? "✓ Copiado" : "Copiar"}
      </button>
    </div>
  );
}

// ── BloqueLinks ───────────────────────────────────────────────────────────────
function BloqueLinks({ codigo, rondaActual }: { codigo: string; rondaActual: 1 | 2 | 3 }) {
  const origin  = typeof window !== "undefined" ? window.location.origin : "";
  const linkInv = `${origin}/invitacion/${codigo}`;
  const linkConf = `${origin}/confirmar/${codigo}?r=${rondaActual}`;

  return (
    <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "0.9rem 1rem", marginBottom: "0.8rem" }}>
      <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "0.7rem" }}>Links</p>
      <LinkRow label="Invitación" url={linkInv} />
      {rondaActual === 1
        ? <p className="sans" style={{ fontSize: "0.62rem", color: "var(--ink-light)", fontStyle: "italic" }}>En R1 el link de confirmación es el mismo que el de invitación.</p>
        : <LinkRow label={`Confirmación R${rondaActual}`} url={linkConf} />
      }
    </div>
  );
}

// ── MensajeBlock ──────────────────────────────────────────────────────────────
function MensajeBlock({ titulo, mensaje }: { titulo: string; mensaje: string }) {
  const [copiado, setCopiado] = useState(false);
  function copiar() { navigator.clipboard.writeText(mensaje); setCopiado(true); setTimeout(() => setCopiado(false), 1800); }
  return (
    <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "0.9rem 1rem", marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
        <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--terracotta)" }}>{titulo}</p>
        <button onClick={copiar} style={{ ...btnOutline, padding: "0.25rem 0.7rem", fontSize: "0.58rem", ...(copiado ? { borderColor: "var(--olive)", color: "var(--olive)" } : {}) }}>
          {copiado ? "✓ Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="sans" style={{ fontSize: "0.72rem", color: "var(--ink-mid)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, background: "var(--cream-mid)", padding: "0.7rem", borderRadius: "2px", border: "1px solid var(--border-subtle)" }}>
        {mensaje}
      </pre>
    </div>
  );
}

// ── BloqueMensajes ────────────────────────────────────────────────────────────
function BloqueMensajes({ invitados, codigo, rondaActual }: {
  invitados: Invitado[]; codigo: string; rondaActual: 1 | 2 | 3;
}) {
  const origin   = typeof window !== "undefined" ? window.location.origin : "";
  const linkInv  = `${origin}/invitacion/${codigo}`;
  const linkConf = `${origin}/confirmar/${codigo}?r=${rondaActual}`;

  return (
    <div style={{ marginBottom: "0.8rem" }}>
      <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "0.5rem" }}>Mensajes WhatsApp</p>
      <MensajeBlock titulo="Invitación" mensaje={mensajeInvitacion(invitados, linkInv)} />
      <MensajeBlock titulo={`Confirmación R${rondaActual}`} mensaje={mensajeConfirmacion(invitados, rondaActual, linkConf)} />
    </div>
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
  const total = invitacion.invitados.length;

  function guardarNombre() { onUpdateNombreGrupo(invitacion.id, nuevoNombre.trim() || null); setEditNombre(false); }

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.6rem", background: "var(--cream-mid)" }}>

      {/* Header */}
      <div onClick={() => !editNombre && setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.9rem 1.2rem", cursor: editNombre ? "default" : "pointer", flexWrap: "wrap" }}>
        <span className="sans" style={{ fontSize: "1.05rem", letterSpacing: "0.08em", color: "var(--terracotta)", fontWeight: 700, flexShrink: 0 }}>{invitacion.codigo}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {editNombre ? (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={e => e.stopPropagation()}>
              <input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Nombre del grupo (opcional)" style={{ ...inputStyle, flex: 1, fontSize: "14px", padding: "0.4rem 0.6rem" }} autoFocus />
              <button onClick={guardarNombre} style={{ ...btnPrimary, padding: "0.4rem 0.8rem", fontSize: "0.6rem" }}>OK</button>
              <button onClick={() => { setEditNombre(false); setNuevoNombre(invitacion.nombre ?? ""); }} style={{ ...btnOutline, padding: "0.4rem 0.6rem", fontSize: "0.6rem" }}>×</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              {invitacion.nombre && <strong className="sans" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)" }}>{invitacion.nombre}</strong>}
              <span className="sans" style={{ fontSize: "0.82rem", color: "var(--ink-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                {invitacion.invitados.map(i => i.nombre).join(", ")}
              </span>
              <button onClick={e => { e.stopPropagation(); setEditNombre(true); }} style={{ background: "none", border: "none", color: "var(--terracotta)", cursor: "pointer", fontSize: "0.58rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "underline", padding: 0, flexShrink: 0 }}>
                {invitacion.nombre ? "editar nombre" : "+ nombre grupo"}
              </button>
            </div>
          )}
        </div>

        {/* Indicadores R1 R2 R3 */}
        {!editNombre && (
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexShrink: 0 }}>
            <IndicadorRonda invitados={invitacion.invitados} ronda={1} color="var(--olive)" />
            <IndicadorRonda invitados={invitacion.invitados} ronda={2} color="var(--periwinkle)" />
            <IndicadorRonda invitados={invitacion.invitados} ronda={3} color="var(--gold)" />
          </div>
        )}

        {!editNombre && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", flexShrink: 0 }}>
            <span className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)" }}>{total} {total === 1 ? "persona" : "personas"}</span>
            {invitacion.creado_por && (
              <span className="sans" style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.2rem 0.6rem", borderRadius: "2px" }}>por {invitacion.creado_por}</span>
            )}
          </div>
        )}

        {!editNombre && <span style={{ color: "var(--ink-light)", fontSize: "0.7rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>}
      </div>

      {/* Contenido expandido */}
      {open && (
        <div style={{ padding: "0 1.2rem 1.2rem" }}>
          <BloqueLinks codigo={invitacion.codigo} rondaActual={rondaActual} />
          <BloqueMensajes invitados={invitacion.invitados} codigo={invitacion.codigo} rondaActual={rondaActual} />
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