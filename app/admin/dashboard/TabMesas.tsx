"use client";
// ── TabMesas.tsx ──────────────────────────────────────────────────────────────

import { useState } from "react";
import { useIsDesktop } from "./helpers";
import { authHeaders } from "./helpers";
import { btnPrimary, inputStyle, labelStyle } from "./styles";

export interface Mesa {
  id: string;
  numero: number;
  alias: string | null;
  invitaciones: {
    id: string;
    codigo: string;
    nombre: string | null;
    invitados: { id: string; nombre: string }[];
  }[];
}

export interface InvitacionSimple {
  id: string;
  codigo: string;
  nombre: string | null;
  invitados: { id: string; nombre: string }[];
  mesa_id?: string | null;
}

interface Props {
  mesas: Mesa[];
  invitaciones: InvitacionSimple[];
  onRefresh: () => void;
  puedeEditar: boolean;
}

export function TabMesas({ mesas, invitaciones, onRefresh, puedeEditar }: Props) {
  const isDesktop = useIsDesktop();
  const [nuevaNum, setNuevaNum] = useState("");
  const [nuevoAlias, setNuevoAlias] = useState("");
  const [creando, setCreando] = useState(false);
  const [dragInvId, setDragInvId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const sinMesa = invitaciones.filter(i => !i.mesa_id);

  async function crearMesa() {
    console.log('entra aqui')
    if (!nuevaNum) return;
    setCreando(true);
    await fetch("/api/admin/mesas", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ numero: parseInt(nuevaNum), alias: nuevoAlias || null }),
    });
    setNuevaNum(""); setNuevoAlias(""); setCreando(false);
    onRefresh();
  }

  async function eliminarMesa(id: string, numero: number) {
    if (!confirm(`¿Eliminar Mesa ${numero}? Las invitaciones quedarán sin mesa asignada.`)) return;
    await fetch(`/api/admin/mesas?id=${id}`, { method: "DELETE", headers: authHeaders() });
    onRefresh();
  }

  async function asignarMesa(invitacionId: string, mesaId: string | null) {
    await fetch(`/api/admin/invitaciones?id=${invitacionId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ mesa_id: mesaId }),
    });
    onRefresh();
  }

  // ── Drag & drop handlers ──────────────────────────────────────────────────
  function onDragStart(invId: string) { setDragInvId(invId); }
  function onDragOver(e: React.DragEvent, mesaId: string) { e.preventDefault(); setDragOver(mesaId); }
  function onDragLeave() { setDragOver(null); }
  async function onDrop(e: React.DragEvent, mesaId: string) {
    e.preventDefault(); setDragOver(null);
    if (dragInvId) { await asignarMesa(dragInvId, mesaId); setDragInvId(null); }
  }
  async function onDropSinMesa(e: React.DragEvent) {
    e.preventDefault(); setDragOver(null);
    if (dragInvId) { await asignarMesa(dragInvId, null); setDragInvId(null); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

      {/* Crear nueva mesa */}
      {puedeEditar && (
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end", flexWrap: "wrap", padding: "1rem", border: "1px solid var(--border-subtle)", borderRadius: "2px" }}>
          <div>
            <label style={labelStyle}>Número</label>
            <input value={nuevaNum} onChange={e => setNuevaNum(e.target.value)} placeholder="1" type="number" min="1"
              style={{ ...inputStyle, width: "70px" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Alias (opcional)</label>
            <input value={nuevoAlias} onChange={e => setNuevoAlias(e.target.value)} placeholder="Ej. Familia García"
              style={inputStyle} />
          </div>
          <button onClick={crearMesa} disabled={creando || !nuevaNum} style={{ ...btnPrimary, padding: "0.55rem 1rem", fontSize: "0.65rem" }}>
            + Mesa
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", flexDirection: isDesktop ? "row" : "column", alignItems: "flex-start" }}>

        {/* ── Panel izquierdo: Sin mesa asignada ── */}
        <div
          style={{
            width: isDesktop ? "220px" : "100%", flexShrink: 0,
            border: `2px dashed ${dragOver === "sin-mesa" ? "var(--terracotta)" : "var(--border-subtle)"}`,
            borderRadius: "2px", padding: "0.8rem",
            transition: "border-color 0.15s",
            background: dragOver === "sin-mesa" ? "rgba(212,105,58,0.04)" : "transparent",
          }}
          onDragOver={e => { e.preventDefault(); setDragOver("sin-mesa"); }}
          onDragLeave={onDragLeave}
          onDrop={onDropSinMesa}
        >
          <p className="sans" style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.6rem" }}>
            Sin mesa · {sinMesa.length}
          </p>
          {sinMesa.length === 0
            ? <p className="sans" style={{ fontSize: "0.72rem", color: "var(--ink-light)", fontStyle: "italic" }}>Todos asignados</p>
            : sinMesa.map(inv => (
              <TarjetaGrupo key={inv.id} inv={inv} isDesktop={isDesktop}
                mesas={mesas} puedeEditar={puedeEditar}
                onDragStart={onDragStart}
                onAsignar={asignarMesa}
              />
            ))
          }
        </div>

        {/* ── Panel derecho: Mesas ── */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: isDesktop ? "repeat(auto-fill, minmax(220px, 1fr))" : "1fr", gap: "0.8rem" }}>
          {mesas.length === 0 && (
            <p className="sans" style={{ fontSize: "0.8rem", color: "var(--ink-light)", padding: "2rem 0" }}>
              No hay mesas creadas.
            </p>
          )}
          {mesas.map(mesa => (
            <div key={mesa.id}
              style={{
                border: `2px solid ${dragOver === mesa.id ? "var(--terracotta)" : "var(--border-subtle)"}`,
                borderTop: `3px solid var(--terracotta)`,
                borderRadius: "2px", padding: "0.8rem",
                background: dragOver === mesa.id ? "rgba(212,105,58,0.04)" : "transparent",
                transition: "border-color 0.15s",
              }}
              onDragOver={e => onDragOver(e, mesa.id)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, mesa.id)}
            >
              {/* Header mesa */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <div>
                  <span className="sans" style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--terracotta)" }}>
                    Mesa {mesa.numero}
                  </span>
                  {mesa.alias && (
                    <span className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", marginLeft: "0.4rem" }}>
                      {mesa.alias}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                  <span className="sans" style={{ fontSize: "0.6rem", color: "var(--ink-light)" }}>
                    {mesa.invitaciones.reduce((acc, i) => acc + i.invitados.length, 0)} p.
                  </span>
                  {puedeEditar && (
                    <button onClick={() => eliminarMesa(mesa.id, mesa.numero)}
                      style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "0.9rem", padding: 0, lineHeight: 1 }}>×</button>
                  )}
                </div>
              </div>

              {/* Grupos en esta mesa */}
              {mesa.invitaciones.length === 0
                ? <p className="sans" style={{ fontSize: "0.7rem", color: "var(--ink-light)", fontStyle: "italic" }}>
                    {isDesktop ? "Arrastra grupos aquí" : "Sin grupos asignados"}
                  </p>
                : mesa.invitaciones.map(inv => (
                  <TarjetaGrupo key={inv.id} inv={inv} isDesktop={isDesktop}
                    mesas={mesas} puedeEditar={puedeEditar}
                    onDragStart={onDragStart}
                    onAsignar={asignarMesa}
                    mesaActual={mesa.id}
                  />
                ))
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TarjetaGrupo ──────────────────────────────────────────────────────────────
function TarjetaGrupo({ inv, isDesktop, mesas, puedeEditar, onDragStart, onAsignar, mesaActual }: {
  inv: InvitacionSimple;
  isDesktop: boolean;
  mesas: Mesa[];
  puedeEditar: boolean;
  onDragStart: (id: string) => void;
  onAsignar: (invId: string, mesaId: string | null) => void;
  mesaActual?: string;
}) {
  const nombres = inv.invitados.map(i => i.nombre.split(" ")[0]).join(", ");

  return (
    <div
      draggable={isDesktop && puedeEditar}
      onDragStart={() => onDragStart(inv.id)}
      style={{
        padding: "0.5rem 0.6rem",
        marginBottom: "0.4rem",
        border: "1px solid var(--border-subtle)",
        borderRadius: "2px",
        cursor: isDesktop && puedeEditar ? "grab" : "default",
        background: "transparent",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.4rem" }}>
        <div style={{ minWidth: 0 }}>
          {inv.nombre && (
            <p className="sans" style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {inv.nombre}
            </p>
          )}
          <p className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {nombres} · {inv.invitados.length}p
          </p>
        </div>
        <span className="sans" style={{ fontSize: "0.58rem", color: "var(--terracotta)", flexShrink: 0 }}>{inv.codigo}</span>
      </div>

      {/* Selector mobile */}
      {!isDesktop && puedeEditar && (
        <select
          value={mesaActual ?? ""}
          onChange={e => onAsignar(inv.id, e.target.value || null)}
          style={{ ...{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem", marginTop: "0.4rem", width: "100%", padding: "0.3rem 0.4rem", border: "1px solid var(--border-subtle)", borderRadius: "2px", background: "transparent", color: "var(--ink)", cursor: "pointer" } }}
        >
          <option value="">Sin mesa</option>
          {mesas.map(m => (
            <option key={m.id} value={m.id}>Mesa {m.numero}{m.alias ? ` — ${m.alias}` : ""}</option>
          ))}
        </select>
      )}
    </div>
  );
}