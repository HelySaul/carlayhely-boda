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

const CANVAS_W  = 2400;
const CANVAS_H  = 1800;
const AVATAR_R  = 18;
const ZOOM_MIN  = 0.3;
const ZOOM_MAX  = 2;
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
function MesaCirculo({ mesa, onDragMesaStart, onDropInv, isDragOver, puedeEditar, onEliminar, onQuitarGrupo }: {
  mesa: MesaCanvas & { pos_x: number; pos_y: number };
  onDragMesaStart: (e: React.MouseEvent, id: string) => void;
  onDropInv: (mesaId: string) => void;
  isDragOver: boolean;
  puedeEditar: boolean;
  onEliminar: (id: string, numero: number) => void;
  onQuitarGrupo: (invId: string) => void;
}) {
  const [tooltipAvatar, setTooltipAvatar] = useState<{ nombre: string; x: number; y: number } | null>(null);
  const [tooltipGrupos, setTooltipGrupos] = useState(false);

  const todos  = mesa.invitaciones.flatMap(i => i.invitados);
  const r      = mesaRadio(todos.length);
  const posAv  = posicionesAlrededor(r + AVATAR_R + 8, todos.length);

  const SVG_W = (r + AVATAR_R + 30) * 2;
  const SVG_H = (r + AVATAR_R + 30) * 2;
  const cx    = SVG_W / 2;
  const cy    = SVG_H / 2;

  // Tooltip de grupos — lista con botón quitar
  const gruposTooltip = (
    <div style={{
      position: "absolute",
      left: "50%", top: "50%",
      transform: "translate(-50%, -50%)",
      background: "var(--cream)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "4px",
      padding: "0.6rem 0.8rem",
      minWidth: "160px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      zIndex: 300,
      pointerEvents: "all",
    }}
      onMouseLeave={() => setTooltipGrupos(false)}
    >
      <p className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: "0.5rem" }}>
        Mesa {mesa.numero} — grupos
      </p>
      {mesa.invitaciones.map(inv => (
        <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", gap: "0.4rem" }}>
          <div>
            <p className="sans" style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>
              {inv.nombre || inv.invitados.map(x => x.nombre.split(" ")[0]).join(" & ")}
            </p>
            <p className="sans" style={{ fontSize: "0.6rem", color: "var(--ink-light)" }}>
              {inv.invitados.map(x => x.nombre).join(", ")}
            </p>
          </div>
          {puedeEditar && (
            <button
              onClick={e => { e.stopPropagation(); onQuitarGrupo(inv.id); setTooltipGrupos(false); }}
              style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "1rem", padding: 0, lineHeight: 1, flexShrink: 0 }}
            >×</button>
          )}
        </div>
      ))}
    </div>
  );

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
      onMouseDown={e => { if (e.button === 0 && puedeEditar && !tooltipGrupos) onDragMesaStart(e, mesa.id); }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); onDropInv(mesa.id); }}
    >
      <svg width={SVG_W} height={SVG_H} style={{ overflow: "visible" }}>

        {/* Círculo */}
        <circle cx={cx} cy={cy} r={r}
          fill={isDragOver ? "rgba(212,105,58,0.15)" : "rgba(212,105,58,0.08)"}
          stroke={isDragOver ? "#D4693A" : "rgba(212,105,58,0.4)"}
          strokeWidth={isDragOver ? 2.5 : 1.5}
        />

        {/* Número — hover para ver grupos */}
        <g style={{ cursor: "pointer" }}
          onMouseEnter={() => setTooltipGrupos(true)}
        >
          <circle cx={cx} cy={cy} r={r * 0.55} fill="transparent"/>
          <text x={cx} y={cy - 8} textAnchor="middle"
            style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "22px", fontWeight: 800, fill: "var(--terracotta)", pointerEvents: "none" }}>
            {mesa.numero}
          </text>
          {mesa.alias && (
            <text x={cx} y={cy + 14} textAnchor="middle"
              style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "11px", fill: "var(--ink-mid)", pointerEvents: "none" }}>
              {mesa.alias}
            </text>
          )}
          <text x={cx} y={cy + (mesa.alias ? 30 : 14)} textAnchor="middle"
            style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "11px", fill: "var(--ink-light)", pointerEvents: "none" }}>
            {todos.length}p
          </text>
        </g>

        {/* Botón eliminar — fuera del círculo, esquina superior derecha del SVG */}
        {puedeEditar && (
          <g style={{ cursor: "pointer" }}
            onClick={e => { e.stopPropagation(); onEliminar(mesa.id, mesa.numero); }}>
            <circle cx={SVG_W - 12} cy={12} r={11} fill="#FDFAF6" stroke="rgba(201,79,79,0.3)" strokeWidth={1}/>
            <text x={SVG_W - 12} y={17} textAnchor="middle"
              style={{ fontFamily: "sans-serif", fontSize: "14px", fill: "#C94F4F" }}>×</text>
          </g>
        )}

        {/* Cabecitas alrededor */}
        {todos.map((inv, i) => {
          const p  = posAv[i];
          const ax = cx + p.x;
          const ay = cy + p.y;
          const ini = inicialNombre(inv.nombre);
          const col = colorPorInicial(ini);
          return (
            <g key={inv.id} style={{ cursor: "pointer" }}
              onMouseEnter={() => setTooltipAvatar({ nombre: inv.nombre, x: ax, y: ay })}
              onMouseLeave={() => setTooltipAvatar(null)}
              onClick={() => setTooltipAvatar(t => t?.nombre === inv.nombre ? null : { nombre: inv.nombre, x: ax, y: ay })}
            >
              <circle cx={ax} cy={ay} r={AVATAR_R} fill={col} opacity={0.88} stroke="#FDFAF6" strokeWidth={2}/>
              <text x={ax} y={ay + 5} textAnchor="middle"
                style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "13px", fontWeight: 700, fill: "#FDFAF6", pointerEvents: "none" }}>
                {ini}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip avatar */}
      {tooltipAvatar && (
        <div style={{
          position: "absolute",
          left: tooltipAvatar.x, top: tooltipAvatar.y - 36,
          transform: "translateX(-50%)",
          background: "var(--ink)", color: "var(--cream)",
          padding: "0.25rem 0.6rem", borderRadius: "4px",
          fontFamily: "'Montserrat',sans-serif", fontSize: "0.62rem",
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 200,
        }}>
          {tooltipAvatar.nombre}
        </div>
      )}

      {/* Tooltip grupos — al hover del centro */}
      {tooltipGrupos && gruposTooltip}
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
  const [colocandoMesa, setColocandoMesa] = useState(false); // modo "click para colocar"
  const [aliasPendiente, setAliasPendiente] = useState("");
  const [cursorPos, setCursorPos]       = useState<{ x: number; y: number } | null>(null);

  const dragInvIdRef  = useRef<string | null>(null);
  const draggingMesa  = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const canvasInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMesasLocal(mesas); }, [mesas]);

  // ── Crear mesa al click en canvas ─────────────────────────────────────────
  function iniciarColocacion() { setColocandoMesa(true); }

  async function colocarMesa(e: React.MouseEvent) {
    if (!colocandoMesa) return;
    e.stopPropagation();
    const rect = canvasInnerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Coordenadas en espacio del canvas (sin zoom)
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setColocandoMesa(false);
    setCursorPos(null);
    const res = await fetch("/api/admin/mesas", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ alias: aliasPendiente || null, pos_x: Math.round(x), pos_y: Math.round(y) }),
    });
    if (res.ok) { setAliasPendiente(""); onRefresh(); }
  }

  function onMouseMoveCanvas(e: React.MouseEvent) {
    if (!colocandoMesa) return;
    const rect = canvasInnerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Coordenadas visuales (con zoom) para posicionar el ghost
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function onMouseLeaveCanvas() {
    if (colocandoMesa) setCursorPos(null);
  }

  // ── Drag de mesa ──────────────────────────────────────────────────────────
  const onDragMesaStart = useCallback((e: React.MouseEvent, id: string) => {
    if (colocandoMesa) return;
    e.stopPropagation();
    const mesa = mesasLocal.find(m => m.id === id);
    if (!mesa) return;
    draggingMesa.current = { id, startX: e.clientX, startY: e.clientY, origX: mesa.pos_x ?? 160, origY: mesa.pos_y ?? 160 };

    function onMove(ev: MouseEvent) {
      if (!draggingMesa.current) return;
      const dx = (ev.clientX - draggingMesa.current.startX) / zoom;
      const dy = (ev.clientY - draggingMesa.current.startY) / zoom;
      setMesasLocal(ms => ms.map(m => m.id === draggingMesa.current!.id
        ? { ...m, pos_x: Math.max(80, Math.min(CANVAS_W - 80, draggingMesa.current!.origX + dx)), pos_y: Math.max(80, Math.min(CANVAS_H - 80, draggingMesa.current!.origY + dy)) }
        : m
      ));
    }

    function onUp(ev: MouseEvent) {
      if (!draggingMesa.current) return;
      const dx = (ev.clientX - draggingMesa.current.startX) / zoom;
      const dy = (ev.clientY - draggingMesa.current.startY) / zoom;
      const newX = Math.max(80, Math.min(CANVAS_W - 80, draggingMesa.current.origX + dx));
      const newY = Math.max(80, Math.min(CANVAS_H - 80, draggingMesa.current.origY + dy));
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
  }, [mesasLocal, zoom, colocandoMesa]);

  // ── Drag de invitación ────────────────────────────────────────────────────
  function onInvDragStart(invId: string) { dragInvIdRef.current = invId; }

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
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..."
          style={{ width: "100%", padding: "0.4rem 0.6rem", marginBottom: "0.6rem", border: "1px solid var(--border-subtle)", borderRadius: "2px", fontFamily: "'Montserrat',sans-serif", fontSize: "0.7rem", color: "var(--ink)", background: "transparent", outline: "none", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", marginBottom: "0.6rem" }}>
          <button style={tabStyle(tabPanel === "sin")} onClick={() => setTabPanel("sin")}>Sin mesa ({sinMesa.length})</button>
          <button style={tabStyle(tabPanel === "con")} onClick={() => setTabPanel("con")}>Asignados ({conMesa.length})</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const invId = dragInvIdRef.current; if (invId) quitarDeMesa(invId); }}
        >
          {tabPanel === "sin"
            ? sinMesa.filter(filtrar).length === 0
              ? <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", fontStyle: "italic", padding: "0.5rem" }}>{busqueda ? "Sin resultados" : "Todos asignados ✓"}</p>
              : sinMesa.filter(filtrar).map(inv => <TarjetaPanel key={inv.id} inv={inv} mesaLabel={null} onDragStart={onInvDragStart} />)
            : conMesa.filter(filtrar).length === 0
              ? <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", fontStyle: "italic", padding: "0.5rem" }}>{busqueda ? "Sin resultados" : "Ninguno asignado"}</p>
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

        {/* Controles */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <button style={btnZoom} onClick={() => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}>−</button>
          <span className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", minWidth: "36px", textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <button style={btnZoom} onClick={() => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}>+</button>
          <button style={{ ...btnZoom, width: "auto", padding: "0 0.6rem", fontSize: "0.6rem", fontFamily: "'Montserrat',sans-serif" }} onClick={() => setZoom(1)}>100%</button>

          <div style={{ flex: 1 }} />

          {puedeEditar && (
            colocandoMesa ? (
              <>
                <input value={aliasPendiente} onChange={e => setAliasPendiente(e.target.value)}
                  placeholder="Nombre de mesa (opcional)"
                  style={{ padding: "0.35rem 0.6rem", border: "1px solid var(--terracotta)", borderRadius: "2px", fontFamily: "'Montserrat',sans-serif", fontSize: "0.65rem", color: "var(--ink)", background: "var(--cream)", outline: "none", width: "180px" }}
                  autoFocus
                />
                <button onClick={() => { setColocandoMesa(false); setCursorPos(null); }}
                  style={{ ...btnZoom, width: "auto", padding: "0 0.7rem", fontSize: "0.6rem", fontFamily: "'Montserrat',sans-serif", color: "var(--ink-light)" }}>
                  Cancelar
                </button>
                <span className="sans" style={{ fontSize: "0.6rem", color: "var(--terracotta)", fontStyle: "italic" }}>
                  Haz click en el canvas para colocar
                </span>
              </>
            ) : (
              <button onClick={iniciarColocacion} disabled={colocandoMesa}
                style={{ padding: "0.4rem 0.9rem", background: colocandoMesa ? "var(--border-subtle)" : "var(--terracotta)", color: colocandoMesa ? "var(--ink-light)" : "var(--cream)", border: "none", borderRadius: "2px", fontFamily: "'Montserrat',sans-serif", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: colocandoMesa ? "not-allowed" : "pointer" }}>
                + Mesa
              </button>
            )
          )}
        </div>

        <div style={{ flex: 1, overflow: "auto", border: "1px solid var(--border-subtle)", borderRadius: "2px", background: "rgba(253,250,246,0.6)", cursor: colocandoMesa ? "crosshair" : "default" }}>
          <div ref={canvasInnerRef}
            style={{ width: CANVAS_W * zoom, height: CANVAS_H * zoom, position: "relative" }}
            onMouseMove={onMouseMoveCanvas}
            onMouseLeave={onMouseLeaveCanvas}
            onClick={colocandoMesa ? colocarMesa : undefined}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const invId = dragInvIdRef.current; if (invId) quitarDeMesa(invId); }}
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
                  onQuitarGrupo={quitarDeMesa}
                />
              ))}
            </div>

            {/* Ghost de mesa siguiendo el cursor (coordenadas visuales) */}
            {colocandoMesa && cursorPos && (
              <div style={{
                position: "absolute",
                left: cursorPos.x, top: cursorPos.y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none", zIndex: 50,
              }}>
                <svg width={160} height={160}>
                  <circle cx={80} cy={80} r={60}
                    fill="rgba(212,105,58,0.1)"
                    stroke="#D4693A" strokeWidth={2}
                    strokeDasharray="8 4"
                  />
                  <text x={80} y={74} textAnchor="middle"
                    style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "22px", fontWeight: 800, fill: "rgba(212,105,58,0.5)" }}>
                    {mesasLocal.length + 1}
                  </text>
                  {aliasPendiente && (
                    <text x={80} y={96} textAnchor="middle"
                      style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "11px", fill: "rgba(212,105,58,0.5)" }}>
                      {aliasPendiente}
                    </text>
                  )}
                </svg>
              </div>
            )}
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