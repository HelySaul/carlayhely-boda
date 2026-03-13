"use client";
// ── modals/ModalNuevaInvitacion.tsx ───────────────────────────────────────────

import { useState } from "react";
import { type Invitacion } from "../types";
import { authHeaders } from "../helpers";
import { ModalShell } from "../ModalShell";
import { labelStyle, inputStyle, btnPrimary, btnOutline } from "../styles";

export function ModalNuevaInvitacion({ onClose, onCreated, nombreAdmin }: {
  onClose: () => void;
  onCreated: (r: Invitacion) => void;
  nombreAdmin: string;
}) {
  const [personas, setPersonas]       = useState([{ nombre: "", whatsapp: "", sexo: "" }]);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  function agregar()  { setPersonas(p => [...p, { nombre: "", whatsapp: "", sexo: "" }]); }
  function quitar(idx: number) { setPersonas(p => p.filter((_, i) => i !== idx)); }
  function actualizar(idx: number, field: string, val: string) { setPersonas(p => p.map((x, i) => i === idx ? { ...x, [field]: val } : x)); }

  async function crear() {
    const validos = personas.filter(p => p.nombre.trim());
    if (validos.length === 0) { setError("Agrega al menos un nombre"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/invitaciones", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ invitados: validos.map(p => ({ ...p, sexo: p.sexo || null })), nombre: nombreGrupo.trim() || null, creado_por: nombreAdmin }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onCreated(data); onClose();
  }

  return (
    <ModalShell onClose={onClose} maxWidth="520px">
      <h3 className="serif" style={{ fontSize: "1.5rem", color: "var(--ink)", marginBottom: "0.3rem" }}>Nueva invitación</h3>
        <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", marginBottom: "1.5rem" }}>El código de 6 dígitos se genera automáticamente.</p>
        {personas.map((p, idx) => (
          <div key={idx} style={{ marginBottom: "1rem", padding: "1rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <span className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--terracotta)" }}>{idx === 0 ? "Invitado" : `Invitado ${idx + 1}`}</span>
              {personas.length > 1 && <button onClick={() => quitar(idx)} style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "1rem" }}>×</button>}
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <div style={{ flex: "2 1 140px" }}>
                <label style={labelStyle}>Nombre</label>
                <input value={p.nombre} onChange={e => actualizar(idx, "nombre", e.target.value)} placeholder="Nombre completo" style={inputStyle} />
              </div>
              <div style={{ flex: "0 0 80px" }}>
                <label style={labelStyle}>Sexo</label>
                <select value={p.sexo} onChange={e => actualizar(idx, "sexo", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">—</option><option value="M">M</option><option value="F">F</option>
                </select>
              </div>
              <div style={{ flex: "1 1 100px" }}>
                <label style={labelStyle}>WhatsApp</label>
                <input value={p.whatsapp} onChange={e => actualizar(idx, "whatsapp", e.target.value)} placeholder="Opcional" style={inputStyle} />
              </div>
            </div>
          </div>
        ))}
        {personas.length > 1 && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Nombre del grupo <span style={{ color: "var(--ink-light)", textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
            <input value={nombreGrupo} onChange={e => setNombreGrupo(e.target.value)} placeholder="Ej: Familia García" style={inputStyle} />
          </div>
        )}
        <button onClick={agregar} style={{ ...btnOutline, width: "100%", marginBottom: "1.2rem" }}>+ Agregar otra persona a esta invitación</button>
        {error && <p style={{ color: "var(--red)", fontSize: "0.75rem", marginBottom: "0.8rem" }}>{error}</p>}
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnOutline}>Cancelar</button>
          <button onClick={crear} disabled={loading} style={btnPrimary}>{loading ? "Creando..." : "Crear invitación"}</button>
        </div>
      </div>
    </ModalShell>
  );
}