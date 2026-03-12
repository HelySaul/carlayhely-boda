"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm]     = useState({ username: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al iniciar sesión");
      setLoading(false);
      return;
    }

    localStorage.setItem("admin_token", data.token);
    router.push("/admin/dashboard");
  }

  return (
    <div style={{
      minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-hero)", padding: "2rem",
    }}>
      <div style={{
        width: "100%", maxWidth: "380px",
        background: "var(--cream-mid)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "2px",
        padding: "3rem 2.5rem",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 className="script" style={{ fontSize: "3.5rem", color: "var(--ink)", lineHeight: 1 }}>
            C &amp; H
          </h1>
          <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--terracotta)", marginTop: "0.5rem" }}>
            Panel de Administración
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label className="sans" style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", display: "block", marginBottom: "0.5rem" }}>
              Usuario
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              style={{
                width: "100%", padding: "0.75rem 1rem",
                background: "var(--cream)", border: "1px solid var(--border-subtle)",
                borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
                fontSize: "0.85rem", color: "var(--ink)", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label className="sans" style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-light)", display: "block", marginBottom: "0.5rem" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              style={{
                width: "100%", padding: "0.75rem 1rem",
                background: "var(--cream)", border: "1px solid var(--border-subtle)",
                borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
                fontSize: "0.85rem", color: "var(--ink)", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p className="sans" style={{ fontSize: "0.75rem", color: "var(--red)", textAlign: "center" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem", padding: "0.85rem",
              background: loading ? "var(--border-subtle)" : "var(--terracotta)",
              color: "var(--cream)", border: "none", borderRadius: "2px",
              fontFamily: "'Montserrat', sans-serif", fontSize: "0.68rem",
              letterSpacing: "0.22em", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s ease",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}