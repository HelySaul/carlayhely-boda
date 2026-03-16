"use client";
// ── CanvasMesas.tsx ───────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect } from "react";
import { authHeaders } from "./helpers";

export interface MesaCanvas {
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

export interface InvSimple {
  id: string;
  codigo: string;
  nombre: string | null;
  invitados: { id: string; nombre: string; sexo?: string | null }[];
  mesa_id?: string | null;
}

interface Props {
  mesas: MesaCanvas[];
  invitaciones: InvSimple[];
  onRefresh: () => void;
  puedeEditar: boolean;
}

const CANVAS_W = 2400;
const CANVAS_H = 1800;
const AVATAR_R = 18;

function mesaRadio(n: number) {
  const circ = Math.max(n, 4) * (AVATAR_R * 2 + 10);
  return Math.max(70, circ / (2 * Math.PI));
}

function posicionesAlrededor(r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
  });
}

function inicialNombre(n: string) { return n.trim().charAt(0).toUpperCase(); }

function colorPorInicial(c: string) {
  const cols = ["#C94F4F","#D4693A","#D4A832","#7A9438","#9B8BB4","#7A8FBC"];
  return cols[c.charCodeAt(0) % cols.length];
}

// ── MesaCirculo ───────────────────────────────────────────────────────────────
function MesaCirculo({ mesa, onDragMesaStart, onDragOver, onDrop, onDragLeave, isDragOver, puedeEditar, onEliminar }: {
  mesa: MesaCanvas & { pos_x: number; pos_y: number };
  onDragMesaStart: (e: React.MouseEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void;
  isDragOver: boolean;
  puedeEditar: boolean;
  onEliminar: (id: string, numero: number) => void;
}) {
  const [tooltip, setTooltip] = useState<{ nombre: string; x: number; y: number } | null>(null);
  const todos = mesa.invitaciones.flatMap(i => i.invitados);
  const r = mesaRadio(todos.length);
  const posAv = posicionesAlrededor(r + AVATAR_R + 8, todos.length);
  const SIZE = (r + AVATAR_R + 28) * 2 + 60; // +60 para nombres arriba
  const cx = SIZE / 2;
  const cy = SIZE / 2 + 30; // bajar el centro para dejar espacio arriba

  // Nombres de grupos para header
  const lineasHeader: string[] = mesa.invitaciones.map(inv =>
    inv.nombre || inv.invitados.map(x => x.nombre.split(" ")[0]).join(" & ")
  );

  return (
    <div
      style={{
        position: "absolute",
        left: mesa.pos_x,
        top: mesa.pos_y,
        width: SIZE,
        transform: "translate(-50%, -50%)",
        cursor: puedeEditar ? "grab" : "default",
        userSelect: "none",
      }}
      onMouseDown={e => puedeEditar && onDragMesaStart(e, mesa.id)}
      onDragOver={e => onDragOver(e, mesa.id)}
      onDrop={e => onDrop(e, mesa.id)}
      onDragLeave={onDragLeave}
    >
      <svg width={SIZE} height={SIZE + 10} style={{ overflow: "visible" }}>

        {/* Círculo mesa */}
        <circle cx={cx} cy={cy} r={r}
          fill={isDragOver ? "rgba(212,105,58,0.15)" : "rgba(212,105,58,0.08)"}
          stroke={isDragOver ? "#D4693A" : "rgba(212,105,58,0.4)"}
          strokeWidth={isDragOver ? 2.5 : 1.5}
        />

        {/* Número */}
        <text x={cx} y={cy - 8} textAnchor="middle"
          style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "22px", fontWeight: 800, fill: "var(--terracotta)" }}>
          {mesa.numero}
        </text>

        {/* Alias */}
        {mesa.alias && (
          <text x={cx} y={cy + 14} textAnchor="middle"
            style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "11px", fill: "var(--ink-mid)" }}>
            {mesa.alias}
          </text>
        )}

        {/* Total personas */}
        <text x={cx} y={cy + (mesa.alias ? 30 : 14)} textAnchor="middle"
          style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "11px", fill: "var(--ink-light)" }}>
          {todos.length} {todos.length === 1 ? "persona" : "personas"}
        </text>

        {/* Cabecitas */}
        {todos.map((inv, i) => {
          const p = posAv[i];
          const ax = cx + p.x;
          const ay = cy + p.y;
          const ini = inicialNombre(inv.nombre);
          const col = colorPorInicial(ini);
          return (
            <g key={inv.id} style={{ cursor: "pointer" }}
              onMouseEnter={() => setTooltip({ nombre: inv.nombre, x: ax, y: ay })}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => setTooltip(t => t?.nombre === inv.nombre ? null : { nombre: inv.nombre, x: ax, y: ay })}
            >
              <circle cx={ax} cy={ay} r={AVATAR_R} fill={col} opacity={0.88} stroke="#FDFAF6" strokeWidth={2}/>
              <text x={ax} y={ay + 5} textAnchor="middle"
                style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "13px", fontWeight: 700, fill: "#FDFAF6", pointerEvents: "none" }}>
                {ini}
              </text>
            </g>
          );
        })}

        {/* Nombres de grupos — arriba en vertical, negrita */}
        {lineasHeader.map((linea, i) => (
          <text key={i}
            x={cx} y={cy - r - AVATAR_R - 16 - (lineasHeader.length - 1 - i) * 18}
            textAnchor="middle"
            style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "12px", fontWeight: 700, fill: "var(--ink)" }}>
            {linea}
          </text>
        ))}

        {/* Botón eliminar */}
        {puedeEditar && (
          <g style={{ cursor: "pointer" }}
            onClick={e => { e.stopPropagation(); onEliminar(mesa.id, mesa.numero); }}>
            <circle cx={cx + r - 4} cy={cy - r + 4} r={11} fill="#FDFAF6" stroke="rgba(201,79,79,0.3)" strokeWidth={1}/>
            <text x={cx + r - 4} y={cy - r + 9} textAnchor="middle"
              style={{ fontFamily: "sans-serif", fontSize: "14px", fill: "var(--ink-light)" }}>×</text>
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute",
          left: tooltip.x, top: tooltip.y - 36,
          transform: "translateX(-50%)",
          background: "var(--ink)", color: "var(--cream)",
          padding: "0.25rem 0.6rem", borderRadius: "4px",
          fontFamily: "'Montserrat',sans-serif", fontSize: "0.62rem",
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 200,
        }}>
          {tooltip.nombre}
        </div>
      )}
    </div>
  );
}

// ── CanvasMesas ───────────────────────────────────────────────────────────────
export function CanvasMesas({ mesas, invitaciones, onRefresh, puedeEditar }: Props) {
  const [dragOverMesa, setDragOverMesa] = useState<string | null>(null);
  const [dragInvId, setDragInvId]       = useState<string | null>(null);
  const [busqueda, setBusqueda]         = useState("");
  const [mesasLocal, setMesasLocal]     = useState<MesaCanvas[]>(mesas);
  const draggingMesa = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => { setMesasLocal(mesas); }, [mesas]);

  // ── Drag de mesa ──────────────────────────────────────────────────────────
  const onDragMesaStart = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const mesa = mesasLocal.find(m => m.id === id);
    if (!mesa) return;
    draggingMesa.current = { id, startX: e.clientX, startY: e.clientY, origX: mesa.pos_x ?? 160, origY: mesa.pos_y ?? 160 };

    function onMove(ev: MouseEvent) {
      if (!draggingMesa.current) return;
      const dx = ev.clientX - draggingMesa.current.startX;
      const dy = ev.clientY - draggingMesa.current.startY;
      setMesasLocal(ms => ms.map(m => m.id === draggingMesa.current!.id
        ? { ...m, pos_x: Math.max(120, Math.min(CANVAS_W - 120, draggingMesa.current!.origX + dx)), pos_y: Math.max(120, Math.min(CANVAS_H - 120, draggingMesa.current!.origY + dy)) }
        : m
      ));
    }

    function onUp(ev: MouseEvent) {
      if (!draggingMesa.current) return;
      const dx = ev.clientX - draggingMesa.current.startX;
      const dy = ev.clientY - draggingMesa.current.startY;
      const newX = Math.max(120, Math.min(CANVAS_W - 120, draggingMesa.current.origX + dx));
      const newY = Math.max(120, Math.min(CANVAS_H - 120, draggingMesa.current.origY + dy));
      const mesaId = draggingMesa.current.id;
      draggingMesa.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setMesasLocal(ms => ms.map(m => m.id === mesaId ? { ...m, pos_x: newX, pos_y: newY } : m));
      fetch(`/api/admin/mesas?id=${mesaId}`, {
        method: "PATCH", headers: authHeaders(),
        body: JSON.stringify({ pos_x: newX, pos_y: newY }),
      });
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [mesasLocal]);

  // ── Drag de invitación ────────────────────────────────────────────────────
  function onInvDragStart(invId: string) { setDragInvId(invId); }

  async function onDropInv(e: React.DragEvent, mesaId: string) {
    e.preventDefault(); setDragOverMesa(null);
    if (!dragInvId) return;
    await fetch(`/api/admin/invitaciones?id=${dragInvId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ mesa_id: mesaId }),
    });
    setDragInvId(null); onRefresh();
  }

  async function onDropCanvas(e: React.DragEvent) {
    e.preventDefault();
    if (!dragInvId) return;
    await fetch(`/api/admin/invitaciones?id=${dragInvId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ mesa_id: null }),
    });
    setDragInvId(null); onRefresh();
  }

  async function eliminarMesa(id: string, numero: number) {
    if (!confirm(`¿Eliminar Mesa ${numero}?`)) return;
    await fetch(`/api/admin/mesas?id=${id}`, { method: "DELETE", headers: authHeaders() });
    onRefresh();
  }

  const sinMesa    = invitaciones.filter(i => !i.mesa_id);
  const conMesa    = invitaciones.filter(i => !!i.mesa_id);

  const busqLower  = busqueda.toLowerCase();
  function filtrar(inv: InvSimple) {
    if (!busqueda) return true;
    return (inv.nombre ?? "").toLowerCase().includes(busqLower)
      || inv.invitados.some(x => x.nombre.toLowerCase().includes(busqLower))
      || inv.codigo.includes(busqueda);
  }

  const sinMesaFiltradas = sinMesa.filter(filtrar);
  const conMesaFiltradas = conMesa.filter(filtrar);

  const inputSt: React.CSSProperties = {
    width: "100%", padding: "0.4rem 0.6rem", boxSizing: "border-box",
    border: "1px solid var(--border-subtle)", borderRadius: "2px",
    fontFamily: "'Montserrat',sans-serif", fontSize: "0.7rem",
    color: "var(--ink)", background: "transparent", outline: "none",
    marginBottom: "0.8rem",
  };

  return (
    <div style={{ display: "flex", gap: "1rem", height: "calc(100vh - 260px)", minHeight: "550px" }}>

      {/* Panel lateral */}
      <div style={{ width: "200px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.4rem", overflowY: "auto" }}>

        {/* Buscador */}
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar grupo o persona..."
          style={inputSt}
        />

        {/* Sin mesa */}
        <p className="sans" style={{ fontSize: "0.52rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.2rem" }}>
          Sin mesa · {sinMesa.length}
        </p>
        <div
          style={{ border: "2px dashed var(--border-subtle)", borderRadius: "2px", padding: "0.5rem", minHeight: "60px", marginBottom: "1rem" }}
          onDragOver={e => e.preventDefault()}
          onDrop={onDropCanvas}
        >
          {sinMesaFiltradas.length === 0
            ? <p className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", fontStyle: "italic" }}>
                {busqueda ? "Sin resultados" : "Todos asignados"}
              </p>
            : sinMesaFiltradas.map(inv => (
              <TarjetaPanel key={inv.id} inv={inv} mesaLabel={null} onDragStart={onInvDragStart} />
            ))
          }
        </div>

        {/* Con mesa */}
        <p className="sans" style={{ fontSize: "0.52rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.2rem" }}>
          Asignados · {conMesa.length}
        </p>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conMesaFiltradas.map(inv => {
            const mesa = mesasLocal.find(m => m.invitaciones.some(i => i.id === inv.id));
            const label = mesa ? `Mesa ${mesa.numero}${mesa.alias ? ` — ${mesa.alias}` : ""}` : null;
            return <TarjetaPanel key={inv.id} inv={inv} mesaLabel={label} onDragStart={onInvDragStart} />;
          })}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "auto", border: "1px solid var(--border-subtle)", borderRadius: "2px", background: "rgba(253,250,246,0.6)" }}>
        <div style={{ width: CANVAS_W, height: CANVAS_H, position: "relative" }}
          onDragOver={e => e.preventDefault()}
          onDrop={onDropCanvas}
        >
          {mesasLocal.map(mesa => (
            <MesaCirculo
              key={mesa.id}
              mesa={{ ...mesa, pos_x: mesa.pos_x ?? 160, pos_y: mesa.pos_y ?? 160 }}
              onDragMesaStart={onDragMesaStart}
              onDragOver={(e, id) => { e.preventDefault(); setDragOverMesa(id); }}
              onDrop={onDropInv}
              onDragLeave={() => setDragOverMesa(null)}
              isDragOver={dragOverMesa === mesa.id}
              puedeEditar={puedeEditar}
              onEliminar={eliminarMesa}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TarjetaPanel ──────────────────────────────────────────────────────────────
function TarjetaPanel({ inv, mesaLabel, onDragStart }: {
  inv: InvSimple; mesaLabel: string | null; onDragStart: (id: string) => void;
}) {
  const nombres = inv.invitados.map(i => i.nombre.split(" ")[0]).join(", ");
  return (
    <div
      draggable
      onDragStart={() => onDragStart(inv.id)}
      style={{ padding: "0.45rem 0.5rem", marginBottom: "0.3rem", border: "1px solid var(--border-subtle)", borderRadius: "2px", cursor: "grab", background: "transparent" }}
    >
      {inv.nombre && (
        <p className="sans" style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.1rem" }}>{inv.nombre}</p>
      )}
      <p className="sans" style={{ fontSize: "0.62rem", color: "var(--ink-light)" }}>{nombres}</p>
      {mesaLabel && (
        <p className="sans" style={{ fontSize: "0.58rem", color: "var(--terracotta)", marginTop: "0.2rem" }}>{mesaLabel}</p>
      )}
    </div>
  );
}