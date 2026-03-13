// ── TabLista.tsx ──────────────────────────────────────────────────────────────

import { type FiltrosState } from "./types";
import { fechaCorta } from "./helpers";
import { BarraFiltros } from "./BarraFiltros";

interface InvitadoFlat {
  id: string; nombre: string; codigo: string; creado_por: string | null; esGrupo: boolean;
  confirmacion_1: boolean; confirmacion_1_fecha: string | null;
  confirmacion_2: boolean; confirmacion_2_fecha: string | null;
  confirmacion_3: boolean; confirmacion_3_fecha: string | null;
  asistio: boolean;
}

export function TabLista({ lista, filtros }: { lista: InvitadoFlat[]; filtros: FiltrosState }) {
  return (
    <>
      <BarraFiltros {...filtros} />
      <p className="sans" style={{ fontSize: "0.8rem", color: "var(--ink-light)", marginBottom: "0.8rem" }}>{lista.length} personas</p>
      {lista.length === 0
        ? <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Sin resultados.</p>
        : lista.map((inv, idx) => (
          <div key={inv.id} style={{ padding: "0.7rem 0.8rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className="sans" style={{ fontSize: "0.75rem", color: "var(--ink-light)", minWidth: "1.8rem", textAlign: "right" }}>{idx + 1}.</span>
                <span className="sans" style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--ink)" }}>{inv.nombre}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <span className="sans" style={{ fontSize: "0.62rem", color: "var(--terracotta)" }}>{inv.codigo}</span>
                {inv.creado_por && <span className="sans" style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.15rem 0.5rem", borderRadius: "2px" }}>por {inv.creado_por}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.4rem", flexWrap: "wrap", paddingLeft: "2.1rem" }}>
              <span className="sans" style={{ fontSize: "0.75rem", color: inv.confirmacion_1 ? "var(--olive)" : "var(--ink-light)" }}>1ra: {inv.confirmacion_1 ? `Sí ${fechaCorta(inv.confirmacion_1_fecha)}` : "No"}</span>
              <span className="sans" style={{ fontSize: "0.75rem", color: inv.confirmacion_2 ? "var(--periwinkle)" : "var(--ink-light)" }}>2da: {inv.confirmacion_2 ? `Sí ${fechaCorta(inv.confirmacion_2_fecha)}` : "No"}</span>
              <span className="sans" style={{ fontSize: "0.75rem", color: inv.confirmacion_3 ? "var(--gold)" : "var(--ink-light)" }}>3ra: {inv.confirmacion_3 ? `Sí ${fechaCorta(inv.confirmacion_3_fecha)}` : "No"}</span>
              <span className="sans" style={{ fontSize: "0.75rem", color: inv.asistio ? "var(--terracotta)" : "var(--ink-light)" }}>Asistió: {inv.asistio ? "Sí" : "No"}</span>
            </div>
          </div>
        ))
      }
    </>
  );
}