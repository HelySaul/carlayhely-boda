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
const LINE_H   = 18;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.15;

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
function MesaCirculo({ mesa, onDragMesaStart, onDropInv, isDragOver, puedeEditar, onEliminar }: {
  mesa: MesaCanvas & { pos_x: number; pos_y: number };
  onDragMesaStart: (e: React.MouseEvent, id: string) => void;
  onDropInv: (mesaId: string) => void;
  isDragOver: boolean;
  puedeEditar: boolean;
  onEliminar: (id: string, numero: number) => void;
}) {
  const [tooltip, setTooltip] = useState<{ nombre: string; x: number; y: number } | null>(null);
  const todos  = mesa.invitaciones.flatMap(i => i.invitados);
  const r      = mesaRadio(todos.length);
  const posAv  = posicionesAlrededor(r + AVATAR_R + 8, todos.length);
  const lineas = mesa.invitaciones.map(inv =>
    inv.nombre || inv.invitados.map(x => x.nombre.split(" ")[0]).join(" & ")
  );
  const espacioArriba = lineas.length * LINE_H + 12;
  const radioTotal    = r + AVATAR_R + 8;
  const SVG_W = (radioTotal + 30) * 2;
  const SVG_H = espacioArriba + (radioTotal + 30) * 2;
  const cx    = SVG_W / 2;
  const cy    = espacioArriba + radioTotal + 20;

  return (
    <div
      style={{
        position: "absolute",
        left: mesa.pos_x, top: mesa.pos_y,
        width: SVG_W,
        transform: "translate(-50%, -50%)",
        cursor: puedeEditar ? "grab" : "default",
        userSelect: "none",
      }}
      onMouseDown={e => { if (e.button === 0 && puedeEditar) onDragMesaStart(e, mesa.id); }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); onDropInv(mesa.id); }}
    >
      <svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }}>

        {/* Nombres arriba */}
        {lineas.map((linea, i) => (
          <text key={i} x={cx} y={12 + i * LINE_H} textAnchor="middle"
            style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "12px", fontWeight: 700, fill: "var(--ink)" }}>
            {linea}
          </text>
        ))}

        {/* Círculo */}
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

        {mesa.alias && (
          <text x={cx} y={cy + 14} textAnchor="middle"
            style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "11px", fill: "var(--ink-mid)" }}>
            {mesa.alias}
          </text>
        )}

        <text x={cx} y={cy + (mesa.alias ? 30 : 14)} textAnchor="middle"
          style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "11px", fill: "var(--ink-light)" }}>
          {todos.length}p
        </text>

        {/* Cabecitas */}
        {todos.map((inv, i) => {
          const p  = posAv[i];
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

        {/* Eliminar */}
        {puedeEditar && (
          <g style={{ cursor: "pointer" }}
            onClick={e => { e.stopPropagation(); onEliminar(mesa.id, mesa.numero); }}>
            <circle cx={cx + r - 4} cy={cy - r + 4} r={11} fill="#FDFAF6" stroke="rgba(201,79,79,0.3)" strokeWidth={1}/>
            <text x={cx + r - 4} y={cy - r + 9} textAnchor="middle"
              style={{ fontFamily: "sans-serif", fontSize: "14px", fill: "var(--ink-light)" }}>×</text>
          </g>
        )}
      </svg>

      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y - 36,
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
  const [busqueda, setBusqueda]         = useState("");
  const [tabPanel, setTabPanel]         = useState<"sin" | "con">("sin");
  const [zoom, setZoom]                 = useState(1);
  const [mesasLocal, setMesasLocal]     = useState<MesaCanvas[]>(mesas);

  // Ref para el invId siendo arrastrado — NO estado para evitar stale closures
  const dragInvIdRef = useRef<string | null>(null);

  const draggingMesa = useRef<{
    id: string; startX: number; startY: number; origX: number; origY: number;
  } | null>(null);

  useEffect(() => { setMesasLocal(mesas); }, [mesas]);

  // ── Drag de mesa ──────────────────────────────────────────────────────────
  const onDragMesaStart = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const mesa = mesasLocal.find(m => m.id === id);
    if (!mesa) return;
    draggingMesa.current = {
      id,
      startX: e.clientX, startY: e.clientY,
      origX: mesa.pos_x ?? 160, origY: mesa.pos_y ?? 160,
    };

    function onMove(ev: MouseEvent) {
      if (!draggingMesa.current) return;
      const dx = (ev.clientX - draggingMesa.current.startX) / zoom;
      const dy = (ev.clientY - draggingMesa.current.startY) / zoom;
      setMesasLocal(ms => ms.map(m => m.id === draggingMesa.current!.id
        ? { ...m,
            pos_x: Math.max(120, Math.min(CANVAS_W - 120, draggingMesa.current!.origX + dx)),
            pos_y: Math.max(120, Math.min(CANVAS_H - 120, draggingMesa.current!.origY + dy)),
          }
        : m
      ));
    }

    function onUp(ev: MouseEvent) {
      if (!draggingMesa.current) return;
      const dx = (ev.clientX - draggingMesa.current.startX) / zoom;
      const dy = (ev.clientY - draggingMesa.current.startY) / zoom;
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
  }, [mesasLocal, zoom]);

  // ── Drag de invitación — usar ref para evitar stale closure ───────────────
  function onInvDragStart(invId: string) {
    dragInvIdRef.current = invId;
  }

  async function asignarAMesa(mesaId: string) {
    const invId = dragInvIdRef.current;
    if (!invId) return;
    dragInvIdRef.current = null;
    setDragOverMesa(null);
    const res = await fetch(`/api/admin/invitaciones?id=${invId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ mesa_id: mesaId }),
    });
    if (res.ok) onRefresh();
  }

  async function quitarDeMesa(invId: string) {
    dragInvIdRef.current = null;
    const res = await fetch(`/api/admin/invitaciones?id=${invId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ mesa_id: null }),
    });
    if (res.ok) onRefresh();
  }

  async function eliminarMesa(id: string, numero: number) {
    if (!confirm(`¿Eliminar Mesa ${numero}?`)) return;
    await fetch(`/api/admin/mesas?id=${id}`, { method: "DELETE", headers: authHeaders() });
    onRefresh();
  }

  const sinMesa = invitaciones.filter(i => !i.mesa_id);
  const conMesa = invitaciones.filter(i => !!i.mesa_id);
  const busqL   = busqueda.toLowerCase();

  function filtrar(inv: InvSimple) {
    if (!busqueda) return true;
    return (inv.nombre ?? "").toLowerCase().includes(busqL)
      || inv.invitados.some(x => x.nombre.toLowerCase().includes(busqL))
      || inv.codigo.includes(busqueda);
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "0.4rem 0", background: "none", border: "none",
    borderBottom: active ? "2px solid var(--terracotta)" : "2px solid transparent",
    color: active ? "var(--terracotta)" : "var(--ink-light)",
    fontFamily: "'Montserrat',sans-serif", fontSize: "0.58rem",
    letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
    marginBottom: "-1px",
  });

  const btnZoom: React.CSSProperties = {
    width: "32px", height: "32px", borderRadius: "4px",
    border: "1px solid var(--border-subtle)", background: "var(--cream)",
    fontFamily: "sans-serif", fontSize: "1rem", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--ink-mid)",
  };

  return (
    <div style={{ display: "flex", gap: "1rem", height: "calc(100vh - 260px)", minHeight: "550px" }}>

      {/* ── Panel lateral ── */}
      <div style={{ width: "210px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <input
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar..."
          style={{
            width: "100%", padding: "0.4rem 0.6rem", marginBottom: "0.6rem",
            border: "1px solid var(--border-subtle)", borderRadius: "2px",
            fontFamily: "'Montserrat',sans-serif", fontSize: "0.7rem",
            color: "var(--ink)", background: "transparent", outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", marginBottom: "0.6rem" }}>
          <button style={tabStyle(tabPanel === "sin")} onClick={() => setTabPanel("sin")}>
            Sin mesa ({sinMesa.length})
          </button>
          <button style={tabStyle(tabPanel === "con")} onClick={() => setTabPanel("con")}>
            Asignados ({conMesa.length})
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const invId = dragInvIdRef.current;
            if (invId) quitarDeMesa(invId);
          }}
        >
          {tabPanel === "sin"
            ? sinMesa.filter(filtrar).length === 0
              ? <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", fontStyle: "italic", padding: "0.5rem" }}>
                  {busqueda ? "Sin resultados" : "Todos asignados ✓"}
                </p>
              : sinMesa.filter(filtrar).map(inv => (
                <TarjetaPanel key={inv.id} inv={inv} mesaLabel={null} onDragStart={onInvDragStart} />
              ))
            : conMesa.filter(filtrar).length === 0
              ? <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", fontStyle: "italic", padding: "0.5rem" }}>
                  {busqueda ? "Sin resultados" : "Ninguno asignado"}
                </p>
              : conMesa.filter(filtrar).map(inv => {
                const mesa = mesasLocal.find(m => m.invitaciones.some(i => i.id === inv.id));
                const label = mesa ? `Mesa ${mesa.numero}${mesa.alias ? ` — ${mesa.alias}` : ""}` : null;
                return <TarjetaPanel key={inv.id} inv={inv} mesaLabel={label} onDragStart={onInvDragStart} />;
              })
          }
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>

        {/* Controles de zoom */}
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <button style={btnZoom} onClick={() => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}>−</button>
          <span className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", minWidth: "36px", textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button style={btnZoom} onClick={() => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}>+</button>
          <button style={{ ...btnZoom, width: "auto", padding: "0 0.6rem", fontSize: "0.6rem", fontFamily: "'Montserrat',sans-serif" }}
            onClick={() => setZoom(1)}>100%</button>
        </div>

        {/* Canvas scrollable */}
        <div style={{ flex: 1, overflow: "auto", border: "1px solid var(--border-subtle)", borderRadius: "2px", background: "rgba(253,250,246,0.6)" }}>
          <div
            style={{ width: CANVAS_W * zoom, height: CANVAS_H * zoom, position: "relative" }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const invId = dragInvIdRef.current;
              if (invId) quitarDeMesa(invId);
            }}
          >
            {/* Capa escalada */}
            <div style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${zoom})`, transformOrigin: "0 0", position: "absolute" }}>
              {mesasLocal.map(mesa => (
                <MesaCirculo
                  key={mesa.id}
                  mesa={{ ...mesa, pos_x: mesa.pos_x ?? 160, pos_y: mesa.pos_y ?? 160 }}
                  onDragMesaStart={onDragMesaStart}
                  onDropInv={asignarAMesa}
                  isDragOver={dragOverMesa === mesa.id}
                  puedeEditar={puedeEditar}
                  onEliminar={eliminarMesa}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TarjetaPanel ──────────────────────────────────────────────────────────────
function TarjetaPanel({ inv, mesaLabel, onDragStart }: {
  inv: InvSimple; mesaLabel: string | null; onDragStart: (id: string) => void;
}) {
  const nombres = inv.invitados.map(i => i.nombre).join(", ");
  return (
    <div draggable
      onDragStart={e => { e.dataTransfer.setData("invId", inv.id); onDragStart(inv.id); }}
      style={{ padding: "0.45rem 0.5rem", marginBottom: "0.3rem", border: "1px solid var(--border-subtle)", borderRadius: "2px", cursor: "grab" }}>
      {inv.nombre && (
        <p className="sans" style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.1rem" }}>{inv.nombre}</p>
      )}
      <p className="sans" style={{ fontSize: "0.62rem", color: "var(--ink-light)" }}>{nombres}</p>
      {mesaLabel && (
        <p className="sans" style={{ fontSize: "0.58rem", color: "var(--terracotta)", marginTop: "0.15rem" }}>{mesaLabel}</p>
      )}
    </div>
  );
}