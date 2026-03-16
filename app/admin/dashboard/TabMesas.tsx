"use client";
// ── TabMesas.tsx ──────────────────────────────────────────────────────────────

import { useState } from "react";
import { useIsDesktop, authHeaders } from "./helpers";
import { btnPrimary, btnOutline, inputStyle, labelStyle } from "./styles";
import { CanvasMesas } from "./CanvasMesas";

export interface Mesa {
  id: string;
  numero: number;
  alias: string | null;
  pos_x?: number;
  pos_y?: number;
  invitaciones: {
    id: string;
    codigo: string;
    nombre: string | null;
    invitados: { id: string; nombre: string; sexo?: string | null }[];
  }[];
}

export interface InvitacionSimple {
  id: string;
  codigo: string;
  nombre: string | null;
  invitados: { id: string; nombre: string; sexo?: string | null }[];
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
  const [nuevoAlias, setNuevoAlias] = useState("");
  const [creando, setCreando] = useState(false);

  const sinMesa = invitaciones.filter(i => !i.mesa_id);

  async function crearMesa() {
    setCreando(true);
    await fetch("/api/admin/mesas", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ alias: nuevoAlias || null }),
    });
    setNuevoAlias(""); setCreando(false);
    onRefresh();
  }

  async function asignarMesa(invitacionId: string, mesaId: string | null) {
    await fetch(`/api/admin/invitaciones?id=${invitacionId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ mesa_id: mesaId }),
    });
    onRefresh();
  }

  async function eliminarMesa(id: string, numero: number) {
    if (!confirm(`¿Eliminar Mesa ${numero}? Las invitaciones quedarán sin mesa asignada.`)) return;
    await fetch(`/api/admin/mesas?id=${id}`, { method: "DELETE", headers: authHeaders() });
    onRefresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

      {/* Crear nueva mesa */}
      {puedeEditar && (
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end", flexWrap: "wrap", padding: "1rem", border: "1px solid var(--border-subtle)", borderRadius: "2px" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Nombre de mesa (opcional)</label>
            <input value={nuevoAlias} onChange={e => setNuevoAlias(e.target.value)} placeholder="Ej. Familia García"
              style={inputStyle} />
          </div>
          <button onClick={crearMesa} disabled={creando}
            style={{ ...btnPrimary, padding: "0.55rem 1rem", fontSize: "0.65rem" }}>
            + Mesa
          </button>
        </div>
      )}

      {/* Desktop: canvas visual */}
      {isDesktop ? (
        <CanvasMesas
          mesas={mesas}
          invitaciones={invitaciones}
          onRefresh={onRefresh}
          puedeEditar={puedeEditar}
        />
      ) : (
        /* Mobile: lista con selectores */
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>

          {/* Sin mesa */}
          <div style={{ border: "2px dashed var(--border-subtle)", borderRadius: "2px", padding: "0.8rem" }}>
            <p className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.6rem" }}>
              Sin mesa · {sinMesa.length}
            </p>
            {sinMesa.length === 0
              ? <p className="sans" style={{ fontSize: "0.72rem", color: "var(--ink-light)", fontStyle: "italic" }}>Todos asignados</p>
              : sinMesa.map(inv => (
                <TarjetaMobile key={inv.id} inv={inv} mesas={mesas} puedeEditar={puedeEditar} onAsignar={asignarMesa} />
              ))
            }
          </div>

          {/* Mesas */}
          {mesas.map(mesa => (
            <div key={mesa.id} style={{ border: "1px solid var(--border-subtle)", borderTop: "3px solid var(--terracotta)", borderRadius: "2px", padding: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <div>
                  <span className="sans" style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--terracotta)" }}>Mesa {mesa.numero}</span>
                  {mesa.alias && <span className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", marginLeft: "0.4rem" }}>{mesa.alias}</span>}
                </div>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <span className="sans" style={{ fontSize: "0.6rem", color: "var(--ink-light)" }}>
                    {mesa.invitaciones.reduce((a, i) => a + i.invitados.length, 0)}p
                  </span>
                  {puedeEditar && (
                    <button onClick={() => eliminarMesa(mesa.id, mesa.numero)}
                      style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "0.9rem", padding: 0 }}>×</button>
                  )}
                </div>
              </div>
              {mesa.invitaciones.map(inv => (
                <TarjetaMobile key={inv.id} inv={inv} mesas={mesas} puedeEditar={puedeEditar} onAsignar={asignarMesa} mesaActual={mesa.id} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TarjetaMobile ─────────────────────────────────────────────────────────────
function TarjetaMobile({ inv, mesas, puedeEditar, onAsignar, mesaActual }: {
  inv: InvitacionSimple; mesas: Mesa[]; puedeEditar: boolean;
  onAsignar: (invId: string, mesaId: string | null) => void;
  mesaActual?: string;
}) {
  const nombres = inv.invitados.map(i => i.nombre).join(", ");
  return (
    <div style={{ padding: "0.5rem 0.6rem", marginBottom: "0.4rem", border: "1px solid var(--border-subtle)", borderRadius: "2px" }}>
      {inv.nombre && <p className="sans" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.1rem" }}>{inv.nombre}</p>}
      <p className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", marginBottom: "0.25rem" }}>{nombres}</p>
      <p className="sans" style={{ fontSize: "0.58rem", color: "var(--terracotta)", marginBottom: "0.3rem" }}>{inv.codigo}</p>
      {puedeEditar && (
        <select value={mesaActual ?? ""} onChange={e => onAsignar(inv.id, e.target.value || null)}
          style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.65rem", width: "100%", padding: "0.35rem 0.4rem", border: "1px solid var(--border-subtle)", borderRadius: "2px", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>
          <option value="">Sin mesa</option>
          {mesas.map(m => (
            <option key={m.id} value={m.id}>Mesa {m.numero}{m.alias ? ` — ${m.alias}` : ""}</option>
          ))}
        </select>
      )}
    </div>
  );
}