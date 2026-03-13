"use client";
// ── TabInvitaciones.tsx ───────────────────────────────────────────────────────

import { useState } from "react";
import { type Invitacion, type Invitado, type FiltrosState } from "./types";
import { fechaCorta } from "./helpers";
import { inputStyle, btnPrimary, btnOutline } from "./styles";
import { BarraFiltros } from "./BarraFiltros";

// ── CheckConfirm ──────────────────────────────────────────────────────────────
function CheckConfirm({ checked, fecha, label, color, onChange }: {
  checked: boolean; fecha: string | null; label: string; color: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: color, width: "14px", height: "14px" }} />
      <span className="sans" style={{ fontSize: "0.52rem", letterSpacing: "0.06em", textTransform: "uppercase", color: checked ? color : "var(--ink-light)" }}>{label}</span>
      {checked && fecha && <span className="sans" style={{ fontSize: "0.48rem", color: "var(--ink-light)" }}>{fechaCorta(fecha)}</span>}
    </label>
  );
}

// ── FilaInvitado ──────────────────────────────────────────────────────────────
function FilaInvitado({ inv, codigo, onUpdate, onUpdateTexto, onDelete }: {
  inv: Invitado; codigo: string;
  onUpdate: (id: string, field: string, val: boolean) => void;
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
        <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
          <CheckConfirm checked={inv.confirmacion_1} fecha={inv.confirmacion_1_fecha} label="1ra"     color="var(--olive)"      onChange={v => onUpdate(inv.id, "confirmacion_1", v)} />
          <CheckConfirm checked={inv.confirmacion_2} fecha={inv.confirmacion_2_fecha} label="2da"     color="var(--periwinkle)" onChange={v => onUpdate(inv.id, "confirmacion_2", v)} />
          <CheckConfirm checked={inv.confirmacion_3} fecha={inv.confirmacion_3_fecha} label="3ra"     color="var(--gold)"       onChange={v => onUpdate(inv.id, "confirmacion_3", v)} />
          <CheckConfirm checked={inv.asistio}        fecha={null}                     label="Asistió" color="var(--terracotta)" onChange={v => onUpdate(inv.id, "asistio", v)} />
        </div>
      )}
    </div>
  );
}

// ── TarjetaInvitacion ─────────────────────────────────────────────────────────
function TarjetaInvitacion({ invitacion, onUpdateInv, onUpdateTexto, onUpdateNombreGrupo, onDeleteInv, onDeleteInvitacion, onAddPersona }: {
  invitacion: Invitacion;
  onUpdateInv: (invId: string, invId2: string, field: string, val: boolean) => void;
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
  const conf1 = invitacion.invitados.filter(i => i.confirmacion_1).length;
  const conf3 = invitacion.invitados.filter(i => i.confirmacion_3).length;

  function guardarNombre() {
    onUpdateNombreGrupo(invitacion.id, nuevoNombre.trim() || null);
    setEditNombre(false);
  }

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.6rem", background: "var(--cream-mid)" }}>
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
              {invitacion.nombre && <strong className="sans" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", letterSpacing: "0.01em" }}>{invitacion.nombre}</strong>}
              <span className="sans" style={{ fontSize: "0.82rem", color: "var(--ink-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                {invitacion.invitados.map(i => i.nombre).join(", ")}
              </span>
              <button onClick={e => { e.stopPropagation(); setEditNombre(true); }} style={{ background: "none", border: "none", color: "var(--terracotta)", cursor: "pointer", fontSize: "0.58rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "underline", padding: 0, flexShrink: 0 }}>
                {invitacion.nombre ? "editar nombre" : "+ nombre grupo"}
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", flexShrink: 0 }}>
          <span className="sans" style={{ fontSize: "0.72rem", color: "var(--ink-light)" }}>{total} {total === 1 ? "persona" : "personas"} · {conf1} conf · {conf3} 3ra</span>
          {invitacion.creado_por && (
            <span className="sans" style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.2rem 0.7rem", borderRadius: "2px" }}>por {invitacion.creado_por}</span>
          )}
        </div>
        {!editNombre && <span style={{ color: "var(--ink-light)", fontSize: "0.7rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>}
      </div>

      {open && (
        <div style={{ padding: "0 1.2rem 1.2rem" }}>
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
export function TabInvitaciones({ invitaciones, filtros, onNueva, onUpdateInv, onUpdateTexto, onUpdateNombreGrupo, onDeleteInv, onDeleteInvitacion, onAddPersona }: {
  invitaciones: Invitacion[];
  filtros: FiltrosState;
  onNueva: () => void;
  onUpdateInv: (invId: string, invId2: string, field: string, val: boolean) => void;
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
          <TarjetaInvitacion key={r.id} invitacion={r}
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