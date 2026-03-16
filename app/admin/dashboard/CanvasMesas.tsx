"use client";
// ── CanvasMesas.tsx ───────────────────────────────────────────────────────────
// Canvas libre con mesas circulares, drag de mesas y drag de grupos a mesas.

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
const CANVAS_H = 1600;
const RADIO_BASE = 56; // radio mínimo de la mesa
const AVATAR_R = 14;   // radio de cada cabecita

function mesaRadio(totalPersonas: number) {
  // Radio crece con más personas para que quepan las cabecitas
  const circunferencia = Math.max(totalPersonas, 4) * (AVATAR_R * 2 + 6);
  return Math.max(RADIO_BASE, circunferencia / (2 * Math.PI));
}

function posicionesAlrededor(cx: number, cy: number, r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

function inicialNombre(nombre: string) {
  return nombre.trim().charAt(0).toUpperCase();
}

function colorPorInicial(inicial: string) {
  const colores = ["var(--red)", "var(--terracotta)", "var(--gold)", "var(--olive)", "var(--lavender)", "var(--periwinkle)"];
  return colores[inicial.charCodeAt(0) % colores.length];
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ nombre, x, y }: { nombre: string; x: number; y: number }) {
  return (
    <div style={{
      position: "absolute",
      left: x, top: y - 32,
      transform: "translateX(-50%)",
      background: "var(--ink)", color: "var(--cream)",
      padding: "0.2rem 0.5rem", borderRadius: "4px",
      fontFamily: "'Montserrat',sans-serif", fontSize: "0.6rem",
      whiteSpace: "nowrap", pointerEvents: "none", zIndex: 100,
    }}>
      {nombre}
    </div>
  );
}

// ── MesaCirculo ───────────────────────────────────────────────────────────────
function MesaCirculo({ mesa, onDragMesaStart, onDropInv, isDragOver, puedeEditar, onEliminar }: {
  mesa: MesaCanvas;
  onDragMesaStart: (e: React.MouseEvent, id: string) => void;
  onDropInv: (e: React.DragEvent, mesaId: string) => void;
  isDragOver: boolean;
  puedeEditar: boolean;
  onEliminar: (id: string, numero: number) => void;
}) {
  const [tooltip, setTooltip] = useState<{ nombre: string; x: number; y: number } | null>(null);
  const totalPersonas = mesa.invitaciones.reduce((a, i) => a + i.invitados.length, 0);
  const r = mesaRadio(totalPersonas);
  const todosInvitados = mesa.invitaciones.flatMap(i => i.invitados);
  const posiciones = posicionesAlrededor(0, 0, r + AVATAR_R + 4, todosInvitados.length);

  // Info del header: grupos + individuales
  const grupos = mesa.invitaciones.filter(i => i.invitados.length > 1);
  const individuales = mesa.invitaciones.filter(i => i.invitados.length === 1);
  const headerTexto = [
    ...grupos.map(g => g.nombre || g.invitados.map(x => x.nombre.split(" ")[0]).join(" & ")),
    ...individuales.map(i => i.invitados[0].nombre.split(" ")[0]),
  ].join(", ");

  const SIZE = (r + AVATAR_R + 20) * 2;

  return (
    <div
      style={{
        position: "absolute",
        left: mesa.pos_x ?? 100, top: mesa.pos_y ?? 100,
        width: SIZE, height: SIZE,
        transform: "translate(-50%, -50%)",
        cursor: puedeEditar ? "grab" : "default",
        userSelect: "none",
      }}
      onMouseDown={e => puedeEditar && onDragMesaStart(e, mesa.id)}
      onDragOver={e => e.preventDefault()}
      onDrop={e => onDropInv(e, mesa.id)}
    >
      <svg width={SIZE} height={SIZE} style={{ overflow: "visible", position: "absolute", top: 0, left: 0 }}>
        {/* Círculo de la mesa */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={r}
          fill={isDragOver ? "rgba(212,105,58,0.12)" : "rgba(212,105,58,0.07)"}
          stroke={isDragOver ? "var(--terracotta)" : "var(--border-medium)"}
          strokeWidth={isDragOver ? 2 : 1.5}
        />

        {/* Número de mesa */}
        <text x={SIZE / 2} y={SIZE / 2 - 6} textAnchor="middle"
          style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "1.1rem", fontWeight: 700, fill: "var(--terracotta)" }}>
          {mesa.numero}
        </text>
        {mesa.alias && (
          <text x={SIZE / 2} y={SIZE / 2 + 10} textAnchor="middle"
            style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.52rem", fill: "var(--ink-light)" }}>
            {mesa.alias}
          </text>
        )}
        <text x={SIZE / 2} y={SIZE / 2 + (mesa.alias ? 24 : 12)} textAnchor="middle"
          style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.5rem", fill: "var(--ink-light)" }}>
          {totalPersonas}p
        </text>

        {/* Cabecitas alrededor */}
        {todosInvitados.map((inv, i) => {
          const pos = posiciones[i];
          const cx = SIZE / 2 + pos.x;
          const cy = SIZE / 2 + pos.y;
          const inicial = inicialNombre(inv.nombre);
          const color = colorPorInicial(inicial);
          return (
            <g key={inv.id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setTooltip({ nombre: inv.nombre, x: cx, y: cy })}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => setTooltip(t => t?.nombre === inv.nombre ? null : { nombre: inv.nombre, x: cx, y: cy })}
            >
              <circle cx={cx} cy={cy} r={AVATAR_R}
                fill={color} opacity={0.85}
                stroke="var(--cream)" strokeWidth={1.5}
              />
              <text x={cx} y={cy + 4} textAnchor="middle"
                style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.65rem", fontWeight: 600, fill: "var(--cream)", pointerEvents: "none" }}>
                {inicial}
              </text>
            </g>
          );
        })}

        {/* Eliminar */}
        {puedeEditar && (
          <g style={{ cursor: "pointer" }}
            onClick={e => { e.stopPropagation(); onEliminar(mesa.id, mesa.numero); }}>
            <circle cx={SIZE / 2 + r - 2} cy={SIZE / 2 - r + 2} r={9}
              fill="var(--cream)" stroke="var(--border-subtle)" strokeWidth={1}/>
            <text x={SIZE / 2 + r - 2} y={SIZE / 2 - r + 6} textAnchor="middle"
              style={{ fontFamily: "sans-serif", fontSize: "0.7rem", fill: "var(--ink-light)" }}>×</text>
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <Tooltip nombre={tooltip.nombre} x={tooltip.x} y={tooltip.y} />
      )}

      {/* Header info grupos */}
      {totalPersonas > 0 && (
        <div style={{
          position: "absolute", top: -28, left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap", maxWidth: "200px",
          overflow: "hidden", textOverflow: "ellipsis",
          fontFamily: "'Montserrat',sans-serif", fontSize: "0.52rem",
          color: "var(--ink-mid)", letterSpacing: "0.04em",
          pointerEvents: "none",
        }}>
          {headerTexto}
        </div>
      )}
    </div>
  );
}

// ── CanvasMesas ───────────────────────────────────────────────────────────────
export function CanvasMesas({ mesas, invitaciones, onRefresh, puedeEditar }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOverMesa, setDragOverMesa] = useState<string | null>(null);
  const [dragInvId, setDragInvId] = useState<string | null>(null);

  // Drag de mesa en canvas
  const draggingMesa = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [mesasLocal, setMesasLocal] = useState<MesaCanvas[]>(mesas);

  useEffect(() => { setMesasLocal(mesas); }, [mesas]);

  const onDragMesaStart = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const mesa = mesasLocal.find(m => m.id === id);
    if (!mesa) return;
    draggingMesa.current = { id, startX: e.clientX, startY: e.clientY, origX: mesa.pos_x ?? 100, origY: mesa.pos_y ?? 100 };

    function onMove(ev: MouseEvent) {
      if (!draggingMesa.current) return;
      const dx = ev.clientX - draggingMesa.current.startX;
      const dy = ev.clientY - draggingMesa.current.startY;
      setMesasLocal(ms => ms.map(m => m.id === draggingMesa.current!.id
        ? { ...m, pos_x: Math.max(80, Math.min(CANVAS_W - 80, draggingMesa.current!.origX + dx)), pos_y: Math.max(80, Math.min(CANVAS_H - 80, draggingMesa.current!.origY + dy)) }
        : m
      ));
    }

    async function onUp(ev: MouseEvent) {
      if (!draggingMesa.current) return;
      const dx = ev.clientX - draggingMesa.current.startX;
      const dy = ev.clientY - draggingMesa.current.startY;
      const newX = Math.max(80, Math.min(CANVAS_W - 80, draggingMesa.current.origX + dx));
      const newY = Math.max(80, Math.min(CANVAS_H - 80, draggingMesa.current.origY + dy));
      await fetch(`/api/admin/mesas?id=${draggingMesa.current.id}`, {
        method: "PATCH", headers: authHeaders(),
        body: JSON.stringify({ pos_x: newX, pos_y: newY }),
      });
      draggingMesa.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [mesasLocal]);

  // Drag de invitación a mesa
  function onInvDragStart(invId: string) { setDragInvId(invId); }

  async function onDropInv(e: React.DragEvent, mesaId: string) {
    e.preventDefault(); setDragOverMesa(null);
    if (!dragInvId) return;
    await fetch(`/api/admin/invitaciones?id=${dragInvId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ mesa_id: mesaId }),
    });
    setDragInvId(null);
    onRefresh();
  }

  async function onDropSinMesa(e: React.DragEvent) {
    e.preventDefault();
    if (!dragInvId) return;
    await fetch(`/api/admin/invitaciones?id=${dragInvId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ mesa_id: null }),
    });
    setDragInvId(null);
    onRefresh();
  }

  async function eliminarMesa(id: string, numero: number) {
    if (!confirm(`¿Eliminar Mesa ${numero}?`)) return;
    await fetch(`/api/admin/mesas?id=${id}`, { method: "DELETE", headers: authHeaders() });
    onRefresh();
  }

  const sinMesa = invitaciones.filter(i => !i.mesa_id);

  return (
    <div style={{ display: "flex", gap: "1rem", height: "calc(100vh - 300px)", minHeight: "500px" }}>

      {/* Panel izquierdo — sin mesa */}
      <div style={{ width: "180px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)" }}>
          Sin mesa · {sinMesa.length}
        </p>
        <div
          style={{ flex: 1, overflowY: "auto", border: "2px dashed var(--border-subtle)", borderRadius: "2px", padding: "0.6rem" }}
          onDragOver={e => e.preventDefault()}
          onDrop={onDropSinMesa}
        >
          {sinMesa.map(inv => {
            const nombres = inv.invitados.map(i => i.nombre.split(" ")[0]).join(", ");
            return (
              <div key={inv.id}
                draggable={puedeEditar}
                onDragStart={() => onInvDragStart(inv.id)}
                style={{ padding: "0.45rem 0.5rem", marginBottom: "0.35rem", border: "1px solid var(--border-subtle)", borderRadius: "2px", cursor: puedeEditar ? "grab" : "default" }}
              >
                {inv.nombre && <p className="sans" style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.1rem" }}>{inv.nombre}</p>}
                <p className="sans" style={{ fontSize: "0.58rem", color: "var(--ink-light)" }}>{nombres}</p>
                <p className="sans" style={{ fontSize: "0.52rem", color: "var(--terracotta)" }}>{inv.codigo}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "auto", border: "1px solid var(--border-subtle)", borderRadius: "2px", background: "var(--cream-mid)" }}>
        <div ref={canvasRef} style={{ width: CANVAS_W, height: CANVAS_H, position: "relative" }}>
          {mesasLocal.map(mesa => (
            <MesaCirculo
              key={mesa.id}
              mesa={mesa}
              onDragMesaStart={onDragMesaStart}
              onDropInv={onDropInv}
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