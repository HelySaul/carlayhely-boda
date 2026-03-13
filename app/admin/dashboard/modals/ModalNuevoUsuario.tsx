"use client";
// ── modals/ModalNuevoUsuario.tsx ──────────────────────────────────────────────

import { useState } from "react";
import { authHeaders } from "../helpers";
import { ModalShell } from "../ModalShell";
import { labelStyle, inputStyle, btnPrimary, btnOutline } from "../styles";

export function ModalNuevoUsuario({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ username: "", nombre: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function crear() {
    if (!form.username.trim() || !form.password.trim() || !form.nombre.trim()) { setError("Todos los campos son requeridos"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/usuarios", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onCreated(); onClose();
  }

  return (
    <ModalShell onClose={onClose} maxWidth="400px">
      <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--ink)", marginBottom: "1.5rem" }}>Nuevo usuario</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        <div>
          <label style={labelStyle}>Nombre completo</label>
          <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="María García" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Usuario</label>
          <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="mariagarcia" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Contraseña</label>
          <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" style={inputStyle} />
        </div>
        {error && <p style={{ color: "var(--red)", fontSize: "0.75rem" }}>{error}</p>}
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnOutline}>Cancelar</button>
          <button onClick={crear} disabled={loading} style={btnPrimary}>{loading ? "Creando..." : "Crear usuario"}</button>
        </div>
      </div>
    </ModalShell>
  );
}