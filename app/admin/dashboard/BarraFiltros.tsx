"use client";
// ── BarraFiltros.tsx ──────────────────────────────────────────────────────────

import { useState } from "react";
import { type FiltrosState, type SortKey, type TipoFiltro, type ConfFiltro } from "./types";
import { useIsDesktop } from "./helpers";
import { inputStyle, btnPrimary } from "./styles";

interface Props extends FiltrosState {
  extra?: React.ReactNode;
}

export function BarraFiltros({
  search, setSearch,
  sortKey, setSortKey,
  sortDir, setSortDir,
  tipo, setTipo,
  confFiltro, setConfFiltro,
  creadores, creadoPor, setCreadoPor,
  extra,
}: Props) {
  const [open, setOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const activosCount = [
    tipo !== "todos",
    confFiltro !== "todos",
    creadoPor !== "",
    sortKey !== "fecha",
  ].filter(Boolean).length;

  function limpiar() {
    setTipo("todos"); setConfFiltro("todos");
    setCreadoPor(""); setSortKey("fecha"); setSortDir("desc");
  }

  const seccionLabel: React.CSSProperties = {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "0.62rem", letterSpacing: "0.2em",
    textTransform: "uppercase", color: "var(--ink-light)",
    marginBottom: "0.6rem", display: "block",
  };

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "0.5rem 1rem",
    background: active ? "var(--terracotta)" : "var(--cream)",
    color: active ? "var(--cream)" : "var(--ink)",
    border: `1px solid ${active ? "var(--terracotta)" : "var(--border-subtle)"}`,
    borderRadius: "2px",
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "0.75rem", letterSpacing: "0.05em",
    cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
  });

  return (
    <>
      {/* Fila principal */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem", alignItems: "stretch" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--ink-light)", fontSize: "0.9rem", pointerEvents: "none" }}>&#128269;</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nombre o código..."
            style={{ ...inputStyle, paddingLeft: "2.4rem", fontSize: "0.9rem" }} />
        </div>
        <button onClick={() => setOpen(o => !o)} style={{
          position: "relative", padding: "0 1.1rem",
          background: open ? "var(--terracotta)" : "var(--cream)",
          color: open ? "var(--cream)" : "var(--ink)",
          border: `1px solid ${open ? "var(--terracotta)" : "var(--border-subtle)"}`,
          borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
          fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase",
          cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
          display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          <span>Filtros</span>
          {activosCount > 0 && (
            <span style={{ background: open ? "rgba(255,255,255,0.3)" : "var(--terracotta)", color: "var(--cream)", borderRadius: "20px", fontSize: "0.65rem", fontWeight: 700, padding: "0.05rem 0.45rem", lineHeight: 1.4 }}>{activosCount}</span>
          )}
        </button>
        {extra}
      </div>

      {/* Panel de filtros */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200 }} />
          <div style={isDesktop ? {
            position: "fixed", zIndex: 201, top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "100%", maxWidth: "520px", background: "var(--cream-mid)",
            border: "1px solid var(--border-subtle)", borderRadius: "4px", padding: "2rem",
            maxHeight: "85vh", overflowY: "auto", boxShadow: "0 16px 64px rgba(0,0,0,0.2)",
          } : {
            position: "fixed", zIndex: 201, left: 0, right: 0, bottom: 0,
            background: "var(--cream-mid)", borderTop: "1px solid var(--border-subtle)",
            borderRadius: "12px 12px 0 0", padding: "1.5rem 1.2rem 2rem",
            maxHeight: "80dvh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
          }}>
            {!isDesktop && <div style={{ width: "40px", height: "4px", background: "var(--border-subtle)", borderRadius: "2px", margin: "0 auto 1.5rem" }} />}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--ink)", margin: 0 }}>Filtros y orden</h3>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                {activosCount > 0 && (
                  <button onClick={limpiar} style={{ background: "none", border: "none", color: "var(--terracotta)", fontFamily: "'Montserrat',sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", textDecoration: "underline" }}>Limpiar</button>
                )}
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--ink-light)", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1, padding: "0 0.2rem" }}>×</button>
              </div>
            </div>

            {/* Ordenar */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={seccionLabel}>Ordenar por</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {([["fecha","Fecha"],["nombre","Nombre A-Z"],["cantidad","Cantidad"],["confirmados","Confirmados"],["creado_por","Quién registró"],["codigo","Código"]] as [SortKey, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setSortKey(v)} style={chip(sortKey === v)}>{l}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                <button onClick={() => setSortDir("asc")}  style={{ ...chip(sortDir === "asc"),  flex: 1 }}>↑ Ascendente</button>
                <button onClick={() => setSortDir("desc")} style={{ ...chip(sortDir === "desc"), flex: 1 }}>↓ Descendente</button>
              </div>
            </div>

            {/* Tipo */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={seccionLabel}>Tipo de invitación</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["todos","grupo","individual"] as TipoFiltro[]).map(t => (
                  <button key={t} onClick={() => setTipo(t)} style={{ ...chip(tipo === t), flex: 1 }}>
                    {t === "todos" ? "Todos" : t === "grupo" ? "Grupos" : "Individuales"}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirmación */}
            <div style={{ marginBottom: creadores.length > 1 ? "1.5rem" : 0 }}>
              <span style={seccionLabel}>Confirmación</span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {([["todos","Todas"],["conf1","1ra conf"],["conf2","2da conf"],["conf3","3ra conf"],["ninguna","Sin confirmar"]] as [ConfFiltro, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setConfFiltro(v)} style={chip(confFiltro === v)}>{l}</button>
                ))}
              </div>
            </div>

            {/* Por quién registró */}
            {creadores.length > 1 && (
              <div>
                <span style={seccionLabel}>Registrado por</span>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button onClick={() => setCreadoPor("")} style={chip(creadoPor === "")}>Todos</button>
                  {creadores.map(c => <button key={c} onClick={() => setCreadoPor(c)} style={chip(creadoPor === c)}>{c}</button>)}
                </div>
              </div>
            )}

            <button onClick={() => setOpen(false)} style={{ ...btnPrimary, width: "100%", marginTop: "2rem", padding: "0.9rem", fontSize: "0.75rem" }}>
              Ver resultados
            </button>
          </div>
        </>
      )}
    </>
  );
}