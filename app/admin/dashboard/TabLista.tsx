// ── TabLista.tsx ──────────────────────────────────────────────────────────────

import { type FiltrosState } from "./types";
import { fechaCorta } from "./helpers";
import { BarraFiltros } from "./BarraFiltros";

interface InvitadoFlat {
  id: string; nombre: string; codigo: string; creado_por: string | null; esGrupo: boolean;
  confirmacion_1: boolean | null; confirmacion_1_fecha: string | null;
  confirmacion_2: boolean | null; confirmacion_2_fecha: string | null;
  confirmacion_3: boolean | null; confirmacion_3_fecha: string | null;
  asistio: boolean | null;
}

// ── PildoraRonda ──────────────────────────────────────────────────────────────
function PildoraRonda({ label, valor, fecha, color }: {
  label: string; valor: boolean | null; fecha: string | null; color: string;
}) {
  const fg = valor === true ? color : valor === false ? "var(--red)" : "var(--ink-light)";
  const bg = valor === true
    ? `${color}18`
    : valor === false
      ? "rgba(201,79,79,0.08)"
      : "transparent";
  const border = valor === true
    ? `1px solid ${color}44`
    : valor === false
      ? "1px solid rgba(201,79,79,0.25)"
      : "1px solid var(--border-subtle)";
  const icono = valor === true ? "✓" : valor === false ? "✗" : "·";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: bg, border, borderRadius: "3px", padding: "0.15rem 0.45rem" }}>
      <span className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-light)" }}>{label}</span>
      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: fg }}>{icono}</span>
      {valor === true && fecha && (
        <span className="sans" style={{ fontSize: "0.52rem", color: "var(--ink-light)" }}>{fechaCorta(fecha)}</span>
      )}
    </div>
  );
}

export function TabLista({ lista, filtros }: { lista: InvitadoFlat[]; filtros: FiltrosState }) {
  return (
    <>
      <BarraFiltros {...filtros} />
      <p className="sans" style={{ fontSize: "0.8rem", color: "var(--ink-light)", marginBottom: "0.8rem" }}>{lista.length} personas</p>
      {lista.length === 0
        ? <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Sin resultados.</p>
        : lista.map((inv, idx) => (
          <div key={inv.id} style={{ padding: "0.7rem 0.8rem", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.3rem" }}>

            {/* Fila nombre + código */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem", gap: "0.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                <span className="sans" style={{ fontSize: "0.7rem", color: "var(--ink-light)", flexShrink: 0 }}>{idx + 1}.</span>
                <span className="sans" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.nombre}</span>
              </div>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexShrink: 0 }}>
                <span className="sans" style={{ fontSize: "0.6rem", color: "var(--terracotta)" }}>{inv.codigo}</span>
                {inv.creado_por && <span className="sans" style={{ fontSize: "0.58rem", fontWeight: 600, color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.1rem 0.4rem", borderRadius: "2px" }}>por {inv.creado_por}</span>}
              </div>
            </div>

            {/* Fila pildoras */}
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              <PildoraRonda label="R1" valor={inv.confirmacion_1} fecha={inv.confirmacion_1_fecha} color="var(--olive)" />
              <PildoraRonda label="R2" valor={inv.confirmacion_2} fecha={inv.confirmacion_2_fecha} color="var(--periwinkle)" />
              <PildoraRonda label="R3" valor={inv.confirmacion_3} fecha={inv.confirmacion_3_fecha} color="var(--gold)" />
              <PildoraRonda label="Asistió" valor={inv.asistio} fecha={null} color="var(--terracotta)" />
            </div>

          </div>
        ))
      }
    </>
  );
}