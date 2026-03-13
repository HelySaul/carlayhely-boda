"use client";
// ── modals/ModalAgregarPersona.tsx ────────────────────────────────────────────

import { useState } from "react";
import { type Invitacion, type Invitado } from "../types";
import { authHeaders } from "../helpers";
import { ModalShell } from "../ModalShell";
import { labelStyle, inputStyle, btnPrimary, btnOutline } from "../styles";

export function ModalAgregarPersona({ invitacion, onClose, onAdded }: {
  invitacion: Invitacion;
  onClose: () => void;
  onAdded: (inv: Invitado) => void;
}) {
  const [nombre, setNombre]     = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sexo, setSexo]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function agregar() {
    if (!nombre.trim()) { setError("Nombre requerido"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/invitados", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ invitacion_id: invitacion.id, nombre, whatsapp, sexo: sexo || null }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onAdded(data); onClose();
  }

  return (
    <ModalShell onClose={onClose} maxWidth="400px">
      <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--ink)", marginBottom: "0.3rem" }}>Agregar persona</h3>
        <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", marginBottom: "1.5rem" }}>Invitación <strong>{invitacion.codigo}</strong></p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo" style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>WhatsApp (opcional)</label>
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+58 412 0000000" style={inputStyle} />
            </div>
            <div style={{ flex: "0 0 80px" }}>
              <label style={labelStyle}>Sexo</label>
              <select value={sexo} onChange={e => setSexo(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">—</option><option value="M">M</option><option value="F">F</option>
              </select>
            </div>
          </div>
          {error && <p style={{ color: "var(--red)", fontSize: "0.75rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={btnOutline}>Cancelar</button>
            <button onClick={agregar} disabled={loading} style={btnPrimary}>{loading ? "Agregando..." : "Agregar"}</button>
          </div>
        </div>
    </ModalShell>
  );
}