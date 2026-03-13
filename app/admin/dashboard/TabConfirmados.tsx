// ── TabConfirmados.tsx ────────────────────────────────────────────────────────

import { type FiltrosState } from "./types";
import { fechaCorta } from "./helpers";
import { BarraFiltros } from "./BarraFiltros";

interface InvitadoFlat {
  id: string; nombre: string; codigo: string;
  confirmacion_1: boolean; confirmacion_1_fecha: string | null;
  confirmacion_2: boolean; confirmacion_2_fecha: string | null;
  confirmacion_3: boolean; confirmacion_3_fecha: string | null;
}

export function TabConfirmados({ lista, filtros }: { lista: InvitadoFlat[]; filtros: FiltrosState }) {
  return (
    <>
      <BarraFiltros {...filtros} />
      <p className="sans" style={{ fontSize: "0.8rem", color: "var(--ink-light)", marginBottom: "0.8rem" }}>{lista.length} personas con al menos una confirmación</p>
      {lista.length === 0
        ? <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Nadie ha confirmado aún.</p>
        : lista.map((inv, idx) => (
          <div key={inv.id} style={{ padding: "0.7rem 0.8rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.3rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span className="sans" style={{ fontSize: "0.75rem", color: "var(--ink-light)", minWidth: "1.8rem", textAlign: "right" }}>{idx + 1}.</span>
                <span className="sans" style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--ink)" }}>{inv.nombre}</span>
              </div>
              <span className="sans" style={{ fontSize: "0.62rem", color: "var(--terracotta)" }}>{inv.codigo}</span>
            </div>
            <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.4rem", flexWrap: "wrap", paddingLeft: "2.1rem" }}>
              <span className="sans" style={{ fontSize: "0.75rem", color: inv.confirmacion_1 ? "var(--olive)" : "var(--ink-light)" }}>1ra: {inv.confirmacion_1 ? `Sí ${fechaCorta(inv.confirmacion_1_fecha)}` : "—"}</span>
              <span className="sans" style={{ fontSize: "0.75rem", color: inv.confirmacion_2 ? "var(--periwinkle)" : "var(--ink-light)" }}>2da: {inv.confirmacion_2 ? `Sí ${fechaCorta(inv.confirmacion_2_fecha)}` : "—"}</span>
              <span className="sans" style={{ fontSize: "0.75rem", color: inv.confirmacion_3 ? "var(--gold)" : "var(--ink-light)" }}>3ra: {inv.confirmacion_3 ? `Sí ${fechaCorta(inv.confirmacion_3_fecha)}` : "—"}</span>
            </div>
          </div>
        ))
      }
    </>
  );
}