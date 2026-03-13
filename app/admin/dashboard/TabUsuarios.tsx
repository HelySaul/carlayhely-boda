// ── TabUsuarios.tsx ───────────────────────────────────────────────────────────

import { btnPrimary } from "./styles";

interface Usuario { id: string; username: string; nombre: string; created_at: string; }

export function TabUsuarios({ usuarios, onNuevo }: { usuarios: Usuario[]; onNuevo: () => void }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button onClick={onNuevo} style={btnPrimary}>+ Nuevo usuario</button>
      </div>
      {usuarios.length === 0
        ? <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Cargando usuarios...</p>
        : usuarios.map(u => (
          <div key={u.id} style={{ padding: "0.9rem 1rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.4rem" }}>
            <div>
              <p className="sans" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>{u.nombre}</p>
              <p className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", margin: 0 }}>@{u.username}</p>
            </div>
            <span className="sans" style={{ fontSize: "0.58rem", color: "var(--ink-light)" }}>{new Date(u.created_at).toLocaleDateString("es-VE")}</span>
          </div>
        ))
      }
    </>
  );
}