"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────
interface Invitado {
  id: string; invitacion_id: string; nombre: string; whatsapp: string | null;
  confirmacion_1: boolean; confirmacion_1_fecha: string | null;
  confirmacion_2: boolean; confirmacion_2_fecha: string | null;
  confirmacion_3: boolean; confirmacion_3_fecha: string | null;
  asistio: boolean;
}
interface Invitacion {
  id: string; codigo: string; nombre: string | null;
  creado_por: string | null; created_at: string; invitados: Invitado[];
}
type SortKey = "nombre" | "codigo" | "creado_por" | "cantidad" | "fecha" | "confirmados";
type SortDir = "asc" | "desc";
type TipoFiltro = "todos" | "grupo" | "individual";
type ConfFiltro = "todos" | "conf1" | "conf2" | "conf3" | "ninguna";

// ── Helpers ────────────────────────────────────────────
function token() { return localStorage.getItem("admin_token") ?? ""; }
function authHeaders() { return { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }; }
function fechaCorta(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit" });
}

// ── Hook responsive ───────────────────────────────────
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

// ── Estilos ────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.6rem", letterSpacing: "0.18em",
  textTransform: "uppercase", color: "var(--ink-light)",
  fontFamily: "'Montserrat', sans-serif", marginBottom: "0.4rem",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.8rem", boxSizing: "border-box",
  background: "var(--cream)", border: "1px solid var(--border-subtle)",
  borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
  fontSize: "16px", color: "var(--ink)", outline: "none",
};
const selectStyle: React.CSSProperties = {
  padding: "0.6rem 0.8rem", background: "var(--cream)", border: "1px solid var(--border-subtle)",
  borderRadius: "2px", fontFamily: "'Montserrat', sans-serif", fontSize: "0.7rem",
  color: "var(--ink)", outline: "none", cursor: "pointer",
};
const btnPrimary: React.CSSProperties = {
  padding: "0.65rem 1.4rem", background: "var(--terracotta)", color: "var(--cream)",
  border: "none", borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
  fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap",
};
const btnOutline: React.CSSProperties = {
  padding: "0.6rem 1.2rem", background: "transparent", color: "var(--terracotta)",
  border: "1px solid var(--terracotta)", borderRadius: "2px",
  fontFamily: "'Montserrat', sans-serif", fontSize: "0.65rem",
  letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap",
};
const btnChip = (active: boolean): React.CSSProperties => ({
  padding: "0.3rem 0.8rem", background: active ? "var(--terracotta)" : "transparent",
  color: active ? "var(--cream)" : "var(--terracotta)",
  border: "1px solid var(--terracotta)", borderRadius: "20px",
  fontFamily: "'Montserrat', sans-serif", fontSize: "0.58rem",
  letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap",
});

// ── StatCard ───────────────────────────────────────────
function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ padding: "1rem 0.6rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderTop: `3px solid ${color}`, borderRadius: "2px", textAlign: "center" }}>
      <p style={{ fontSize: "2rem", fontFamily: "'Cormorant Garamond', serif", color, lineHeight: 1 }}>{value}</p>
      <p className="sans" style={{ fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-light)", marginTop: "0.4rem" }}>{label}</p>
    </div>
  );
}

// ── Barra de filtros ───────────────────────────────────
function BarraFiltros({
  search, setSearch,
  sortKey, setSortKey,
  sortDir, setSortDir,
  tipo, setTipo,
  confFiltro, setConfFiltro,
  creadores, creadoPor, setCreadoPor,
  extra,
}: {
  search: string; setSearch: (v: string) => void;
  sortKey: SortKey; setSortKey: (v: SortKey) => void;
  sortDir: SortDir; setSortDir: (v: SortDir) => void;
  tipo: TipoFiltro; setTipo: (v: TipoFiltro) => void;
  confFiltro: ConfFiltro; setConfFiltro: (v: ConfFiltro) => void;
  creadores: string[]; creadoPor: string; setCreadoPor: (v: string) => void;
  extra?: React.ReactNode;
}) {
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
    fontSize: "0.75rem",
    letterSpacing: "0.05em",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
  });

  return (
    <>
      {/* Fila principal: búsqueda + botón filtros + extra */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem", alignItems: "stretch" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--ink-light)", fontSize: "0.9rem", pointerEvents: "none" }}>
            &#128269;
          </span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nombre o código..."
            style={{ ...inputStyle, paddingLeft: "2.4rem", fontSize: "0.9rem" }}
          />
        </div>
        <button onClick={() => setOpen(o => !o)} style={{
          position: "relative",
          padding: "0 1.1rem",
          background: open ? "var(--terracotta)" : "var(--cream)",
          color: open ? "var(--cream)" : "var(--ink)",
          border: `1px solid ${open ? "var(--terracotta)" : "var(--border-subtle)"}`,
          borderRadius: "2px",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "0.75rem", letterSpacing: "0.1em",
          textTransform: "uppercase", cursor: "pointer",
          whiteSpace: "nowrap", transition: "all 0.15s",
          display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          <span>Filtros</span>
          {activosCount > 0 && (
            <span style={{
              background: open ? "rgba(255,255,255,0.3)" : "var(--terracotta)",
              color: "var(--cream)", borderRadius: "20px",
              fontSize: "0.65rem", fontWeight: 700,
              padding: "0.05rem 0.45rem", lineHeight: 1.4,
            }}>{activosCount}</span>
          )}
        </button>
        {extra}
      </div>

      {/* Panel de filtros */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
            zIndex: 200,
          }} />

          <div style={isDesktop ? {
            // Desktop: modal centrada
            position: "fixed", zIndex: 201,
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "100%", maxWidth: "520px",
            background: "var(--cream-mid)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "4px",
            padding: "2rem",
            maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 16px 64px rgba(0,0,0,0.2)",
          } : {
            // Mobile: sheet desde abajo
            position: "fixed", zIndex: 201,
            left: 0, right: 0, bottom: 0,
            background: "var(--cream-mid)",
            borderTop: "1px solid var(--border-subtle)",
            borderRadius: "12px 12px 0 0",
            padding: "1.5rem 1.2rem 2rem",
            maxHeight: "80dvh", overflowY: "auto",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
          }}>
            {/* Handle bar — solo mobile */}
            {!isDesktop && <div style={{ width: "40px", height: "4px", background: "var(--border-subtle)", borderRadius: "2px", margin: "0 auto 1.5rem" }} />}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--ink)", margin: 0 }}>Filtros y orden</h3>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                {activosCount > 0 && (
                  <button onClick={limpiar} style={{ background: "none", border: "none", color: "var(--terracotta)", fontFamily: "'Montserrat',sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", textDecoration: "underline" }}>
                    Limpiar
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--ink-light)", fontSize: "1.4rem", cursor: "pointer", lineHeight: 1, padding: "0 0.2rem" }}>×</button>
              </div>
            </div>

            {/* Ordenar */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={seccionLabel}>Ordenar por</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {([
                  ["fecha", "Fecha"],
                  ["nombre", "Nombre A-Z"],
                  ["cantidad", "Cantidad"],
                  ["confirmados", "Confirmados"],
                  ["creado_por", "Quién registró"],
                  ["codigo", "Código"],
                ] as [SortKey, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setSortKey(v)} style={chip(sortKey === v)}>{l}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                <button onClick={() => setSortDir("asc")} style={{ ...chip(sortDir === "asc"), flex: 1 }}>↑ Ascendente</button>
                <button onClick={() => setSortDir("desc")} style={{ ...chip(sortDir === "desc"), flex: 1 }}>↓ Descendente</button>
              </div>
            </div>

            {/* Tipo */}
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={seccionLabel}>Tipo de invitación</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["todos", "grupo", "individual"] as TipoFiltro[]).map(t => (
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
                {([["todos","Todas"], ["conf1","1ra conf"], ["conf2","2da conf"], ["conf3","3ra conf"], ["ninguna","Sin confirmar"]] as [ConfFiltro, string][]).map(([v, l]) => (
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
                  {creadores.map(c => (
                    <button key={c} onClick={() => setCreadoPor(c)} style={chip(creadoPor === c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón aplicar */}
            <button onClick={() => setOpen(false)} style={{ ...btnPrimary, width: "100%", marginTop: "2rem", padding: "0.9rem", fontSize: "0.75rem" }}>
              Ver resultados
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ── Modal nueva invitación ─────────────────────────────
function ModalNuevaInvitacion({ onClose, onCreated, nombreAdmin }: { onClose: () => void; onCreated: (r: Invitacion) => void; nombreAdmin: string }) {
  const [personas, setPersonas]       = useState([{ nombre: "", whatsapp: "" }]);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  function agregar() { setPersonas(p => [...p, { nombre: "", whatsapp: "" }]); }
  function quitar(idx: number) { setPersonas(p => p.filter((_, i) => i !== idx)); }
  function actualizar(idx: number, field: string, val: string) { setPersonas(p => p.map((x, i) => i === idx ? { ...x, [field]: val } : x)); }

  async function crear() {
    const validos = personas.filter(p => p.nombre.trim());
    if (validos.length === 0) { setError("Agrega al menos un nombre"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/invitaciones", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ invitados: validos, nombre: nombreGrupo.trim() || null, creado_por: nombreAdmin }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onCreated(data); onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "2rem", width: "100%", maxWidth: "520px", maxHeight: "90dvh", overflowY: "auto" }}>
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
    </div>
  );
}

// ── Modal agregar persona ──────────────────────────────
function ModalAgregarPersona({ invitacion, onClose, onAdded }: { invitacion: Invitacion; onClose: () => void; onAdded: (inv: Invitado) => void }) {
  const [nombre, setNombre] = useState(""); const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function agregar() {
    if (!nombre.trim()) { setError("Nombre requerido"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/invitados", { method: "POST", headers: authHeaders(), body: JSON.stringify({ invitacion_id: invitacion.id, nombre, whatsapp }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onAdded(data); onClose();
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "2rem", width: "100%", maxWidth: "400px", maxHeight: "90dvh", overflowY: "auto" }}>
        <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--ink)", marginBottom: "0.3rem" }}>Agregar persona</h3>
        <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", marginBottom: "1.5rem" }}>Invitación <strong>{invitacion.codigo}</strong></p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div><label style={labelStyle}>Nombre</label><input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo" style={inputStyle} /></div>
          <div><label style={labelStyle}>WhatsApp (opcional)</label><input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+58 412 0000000" style={inputStyle} /></div>
          {error && <p style={{ color: "var(--red)", fontSize: "0.75rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={btnOutline}>Cancelar</button>
            <button onClick={agregar} disabled={loading} style={btnPrimary}>{loading ? "Agregando..." : "Agregar"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal nuevo usuario ────────────────────────────────
function ModalNuevoUsuario({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ username: "", nombre: "", password: "" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function crear() {
    if (!form.username.trim() || !form.password.trim() || !form.nombre.trim()) { setError("Todos los campos son requeridos"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/usuarios", { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onCreated(); onClose();
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "2rem", width: "100%", maxWidth: "400px", maxHeight: "90dvh", overflowY: "auto" }}>
        <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--ink)", marginBottom: "1.5rem" }}>Nuevo usuario</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div><label style={labelStyle}>Nombre completo</label><input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="María García" style={inputStyle} /></div>
          <div><label style={labelStyle}>Usuario</label><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="mariagarcia" style={inputStyle} /></div>
          <div><label style={labelStyle}>Contraseña</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" style={inputStyle} /></div>
          {error && <p style={{ color: "var(--red)", fontSize: "0.75rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={btnOutline}>Cancelar</button>
            <button onClick={crear} disabled={loading} style={btnPrimary}>{loading ? "Creando..." : "Crear usuario"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CheckConfirm ───────────────────────────────────────
function CheckConfirm({ checked, fecha, label, color, onChange }: { checked: boolean; fecha: string | null; label: string; color: string; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: color, width: "14px", height: "14px" }} />
      <span className="sans" style={{ fontSize: "0.52rem", letterSpacing: "0.06em", textTransform: "uppercase", color: checked ? color : "var(--ink-light)" }}>{label}</span>
      {checked && fecha && <span className="sans" style={{ fontSize: "0.48rem", color: "var(--ink-light)" }}>{fechaCorta(fecha)}</span>}
    </label>
  );
}

// ── Fila invitado ──────────────────────────────────────
function FilaInvitado({ inv, codigo, onUpdate, onUpdateTexto, onDelete }: {
  inv: Invitado; codigo: string;
  onUpdate: (id: string, field: string, val: boolean) => void;
  onUpdateTexto: (id: string, nombre: string, whatsapp: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre]     = useState(inv.nombre);
  const [whatsapp, setWhatsapp] = useState(inv.whatsapp ?? "");

  function guardar() { onUpdateTexto(inv.id, nombre.trim() || inv.nombre, whatsapp.trim()); setEditando(false); }

  return (
    <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.35rem", padding: "0.65rem 0.8rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: editando ? "0.5rem" : "0.5rem", gap: "0.5rem" }}>
        <div style={{ flex: 1 }}>
          {editando ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" style={{ ...inputStyle, fontSize: "16px" }} />
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (opcional)" style={{ ...inputStyle, fontSize: "16px" }} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={guardar} style={{ ...btnPrimary, padding: "0.35rem 0.8rem", fontSize: "0.6rem" }}>Guardar</button>
                <button onClick={() => { setEditando(false); setNombre(inv.nombre); setWhatsapp(inv.whatsapp ?? ""); }} style={{ ...btnOutline, padding: "0.35rem 0.8rem", fontSize: "0.6rem" }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <span className="sans" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--ink)" }}>{inv.nombre}</span>
              {inv.whatsapp && <span className="sans" style={{ fontSize: "0.6rem", color: "var(--ink-light)" }}>{inv.whatsapp}</span>}
              <button onClick={() => setEditando(true)} style={{ background: "none", border: "none", color: "var(--terracotta)", cursor: "pointer", fontSize: "0.62rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "underline", padding: 0 }}>editar</button>
            </div>
          )}
        </div>
        {!editando && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <span className="sans" style={{ fontSize: "0.62rem", color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.15rem 0.5rem", borderRadius: "2px" }}>{codigo}</span>
            <button onClick={() => { if (confirm(`¿Eliminar a ${inv.nombre}?`)) onDelete(inv.id); }} style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "1rem", padding: "0", lineHeight: 1 }}>×</button>
          </div>
        )}
      </div>
      {!editando && (
        <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
          <CheckConfirm checked={inv.confirmacion_1} fecha={inv.confirmacion_1_fecha} label="1ra"     color="var(--olive)"      onChange={v => onUpdate(inv.id, "confirmacion_1", v)} />
          <CheckConfirm checked={inv.confirmacion_2} fecha={inv.confirmacion_2_fecha} label="2da"     color="var(--periwinkle)" onChange={v => onUpdate(inv.id, "confirmacion_2", v)} />
          <CheckConfirm checked={inv.confirmacion_3} fecha={inv.confirmacion_3_fecha} label="3ra"     color="var(--gold)"       onChange={v => onUpdate(inv.id, "confirmacion_3", v)} />
          <CheckConfirm checked={inv.asistio}        fecha={null}                     label="Asistió" color="var(--terracotta)" onChange={v => onUpdate(inv.id, "asistio", v)} />
        </div>
      )}
    </div>
  );
}

// ── Tarjeta invitación ─────────────────────────────────
function TarjetaInvitacion({ invitacion, onUpdateInv, onUpdateTexto, onUpdateNombreGrupo, onDeleteInv, onDeleteInvitacion, onAddPersona }: {
  invitacion: Invitacion;
  onUpdateInv: (invId: string, invId2: string, field: string, val: boolean) => void;
  onUpdateTexto: (invitacionId: string, invId: string, nombre: string, whatsapp: string) => void;
  onUpdateNombreGrupo: (id: string, nombre: string | null) => void;
  onDeleteInv: (invId: string, invId2: string) => void;
  onDeleteInvitacion: (id: string) => void;
  onAddPersona: (r: Invitacion) => void;
}) {
  const [open, setOpen]             = useState(false);
  const [editNombre, setEditNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(invitacion.nombre ?? "");
  const total = invitacion.invitados.length;
  const conf1 = invitacion.invitados.filter(i => i.confirmacion_1).length;
  const conf3 = invitacion.invitados.filter(i => i.confirmacion_3).length;

  function guardarNombre() {
    onUpdateNombreGrupo(invitacion.id, nuevoNombre.trim() || null);
    setEditNombre(false);
  }

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.6rem", background: "var(--cream-mid)" }}>
      <div onClick={() => !editNombre && setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.9rem 1.2rem", cursor: editNombre ? "default" : "pointer", flexWrap: "wrap" }}>
        <span className="sans" style={{ fontSize: "1.05rem", letterSpacing: "0.08em", color: "var(--terracotta)", fontWeight: 700, flexShrink: 0 }}>{invitacion.codigo}</span>
        <div style={{ flex: 1, minWidth: "0" }}>
          {editNombre ? (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }} onClick={e => e.stopPropagation()}>
              <input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Nombre del grupo (opcional)" style={{ ...inputStyle, flex: 1, fontSize: "14px", padding: "0.4rem 0.6rem" }} autoFocus />
              <button onClick={guardarNombre} style={{ ...btnPrimary, padding: "0.4rem 0.8rem", fontSize: "0.6rem" }}>OK</button>
              <button onClick={() => { setEditNombre(false); setNuevoNombre(invitacion.nombre ?? ""); }} style={{ ...btnOutline, padding: "0.4rem 0.6rem", fontSize: "0.6rem" }}>×</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              {invitacion.nombre && <strong className="sans" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", letterSpacing: "0.01em" }}>{invitacion.nombre}</strong>}
              <span className="sans" style={{ fontSize: "0.82rem", color: "var(--ink-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                {invitacion.invitados.map(i => i.nombre).join(", ")}
              </span>
              <button onClick={e => { e.stopPropagation(); setEditNombre(true); }} style={{ background: "none", border: "none", color: "var(--terracotta)", cursor: "pointer", fontSize: "0.58rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "underline", padding: 0, flexShrink: 0 }}>
                {invitacion.nombre ? "editar nombre" : "+ nombre grupo"}
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", flexShrink: 0 }}>
          <span className="sans" style={{ fontSize: "0.72rem", color: "var(--ink-light)" }}>{total} {total === 1 ? "persona" : "personas"} · {conf1} conf · {conf3} 3ra</span>
          {invitacion.creado_por && (
            <span className="sans" style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.2rem 0.7rem", borderRadius: "2px" }}>por {invitacion.creado_por}</span>
          )}
        </div>
        {!editNombre && <span style={{ color: "var(--ink-light)", fontSize: "0.7rem", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>}
      </div>

      {open && (
        <div style={{ padding: "0 1.2rem 1.2rem" }}>
          {invitacion.invitados.map(inv => (
            <FilaInvitado key={inv.id} inv={inv} codigo={invitacion.codigo}
              onUpdate={(id, field, val) => onUpdateInv(invitacion.id, id, field, val)}
              onUpdateTexto={(id, nombre, whatsapp) => onUpdateTexto(invitacion.id, id, nombre, whatsapp)}
              onDelete={(id) => onDeleteInv(invitacion.id, id)}
            />
          ))}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
            <button onClick={() => onAddPersona(invitacion)} style={btnOutline}>+ Agregar persona</button>
            <button onClick={() => { if (confirm(`¿Eliminar invitación ${invitacion.codigo}?`)) onDeleteInvitacion(invitacion.id); }} style={{ ...btnOutline, color: "var(--red)", borderColor: "var(--red)" }}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [invitaciones, setInvitaciones]   = useState<Invitacion[]>([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState<"invitaciones" | "lista" | "confirmados" | "usuarios">("invitaciones");
  const [modalNueva, setModalNueva]       = useState(false);
  const [modalAdd, setModalAdd]           = useState<Invitacion | null>(null);
  const [modalUsuario, setModalUsuario]   = useState(false);
  const [username, setUsername]           = useState("");
  const [nombreAdmin, setNombreAdmin]     = useState("");
  const [usuarios, setUsuarios]           = useState<{ id: string; username: string; nombre: string; created_at: string }[]>([]);

  // Filtros compartidos
  const [search, setSearch]           = useState("");
  const [sortKey, setSortKey]         = useState<SortKey>("fecha");
  const [sortDir, setSortDir]         = useState<SortDir>("desc");
  const [tipo, setTipo]               = useState<TipoFiltro>("todos");
  const [confFiltro, setConfFiltro]   = useState<ConfFiltro>("todos");
  const [creadoPor, setCreadoPor]     = useState("");

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) { router.push("/admin"); return; }
    try {
      const payload = JSON.parse(atob(token().split(".")[1]));
      setUsername(payload.username ?? "");
      setNombreAdmin(payload.nombre ?? payload.username ?? "");
    } catch { /* */ }
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/invitaciones", { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { router.push("/admin"); return; }
      setInvitaciones(await res.json());
      setLoading(false);
    };
    fetchData();
  }, [router]);

  async function cargarUsuarios() {
    const res = await fetch("/api/admin/usuarios", { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) setUsuarios(await res.json());
  }
  useEffect(() => { if (tab === "usuarios") cargarUsuarios(); }, [tab]);

  function logout() { localStorage.removeItem("admin_token"); router.push("/admin"); }

  async function updateInvitado(invitacionId: string, invId: string, field: string, val: boolean) {
    await fetch(`/api/admin/invitados?id=${invId}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ [field]: val }) });
    setInvitaciones(rs => rs.map(r => r.id !== invitacionId ? r : {
      ...r, invitados: r.invitados.map(i => {
        if (i.id !== invId) return i;
        const u = { ...i, [field]: val };
        if (field === "confirmacion_1") u.confirmacion_1_fecha = val ? new Date().toISOString() : null;
        if (field === "confirmacion_2") u.confirmacion_2_fecha = val ? new Date().toISOString() : null;
        if (field === "confirmacion_3") u.confirmacion_3_fecha = val ? new Date().toISOString() : null;
        return u;
      }),
    }));
  }

  async function updateInvitadoTexto(invitacionId: string, invId: string, nombre: string, whatsapp: string) {
    await fetch(`/api/admin/invitados?id=${invId}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ nombre, whatsapp: whatsapp || null }) });
    setInvitaciones(rs => rs.map(r => r.id !== invitacionId ? r : {
      ...r, invitados: r.invitados.map(i => i.id !== invId ? i : { ...i, nombre, whatsapp: whatsapp || null }),
    }));
  }

  async function updateNombreGrupo(id: string, nombre: string | null) {
    await fetch(`/api/admin/invitaciones?id=${id}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ nombre }) });
    setInvitaciones(rs => rs.map(r => r.id !== id ? r : { ...r, nombre }));
  }

  async function deleteInvitado(invitacionId: string, invId: string) {
    await fetch(`/api/admin/invitados?id=${invId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    setInvitaciones(rs => rs.map(r => r.id !== invitacionId ? r : { ...r, invitados: r.invitados.filter(i => i.id !== invId) }));
  }

  async function deleteInvitacion(id: string) {
    await fetch(`/api/admin/invitaciones?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    setInvitaciones(rs => rs.filter(r => r.id !== id));
  }

  function exportCSV() {
    fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `invitados-carlayhely-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
      });
  }

  // ── Stats ──────────────────────────────────────────────
  const allInv     = invitaciones.flatMap(r => r.invitados);
  const totalInv   = allInv.length;
  const totalRes   = invitaciones.length;
  const conf1      = allInv.filter(i => i.confirmacion_1).length;
  const conf2      = allInv.filter(i => i.confirmacion_2).length;
  const conf3      = allInv.filter(i => i.confirmacion_3).length;
  const asistieron = allInv.filter(i => i.asistio).length;

  // ── Lista de creadores únicos ──────────────────────────
  const creadores = useMemo(() =>
    [...new Set(invitaciones.map(r => r.creado_por).filter(Boolean) as string[])].sort()
  , [invitaciones]);

  // ── Función de filtrado y ordenación ──────────────────
  function aplicarFiltros(lista: Invitacion[]) {
    let r = lista;
    if (search) r = r.filter(inv =>
      inv.codigo.includes(search) ||
      (inv.nombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
      inv.invitados.some(i => i.nombre.toLowerCase().includes(search.toLowerCase()))
    );
    if (tipo === "grupo")       r = r.filter(inv => inv.invitados.length > 1);
    if (tipo === "individual")  r = r.filter(inv => inv.invitados.length === 1);
    if (creadoPor)              r = r.filter(inv => inv.creado_por === creadoPor);
    if (confFiltro === "conf1") r = r.filter(inv => inv.invitados.some(i => i.confirmacion_1));
    if (confFiltro === "conf2") r = r.filter(inv => inv.invitados.some(i => i.confirmacion_2));
    if (confFiltro === "conf3") r = r.filter(inv => inv.invitados.some(i => i.confirmacion_3));
    if (confFiltro === "ninguna") r = r.filter(inv => inv.invitados.every(i => !i.confirmacion_1 && !i.confirmacion_2 && !i.confirmacion_3));
    r = [...r].sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0;
      if (sortKey === "nombre")     { va = (a.nombre ?? a.invitados[0]?.nombre ?? "").toLowerCase(); vb = (b.nombre ?? b.invitados[0]?.nombre ?? "").toLowerCase(); }
      if (sortKey === "codigo")     { va = a.codigo; vb = b.codigo; }
      if (sortKey === "creado_por") { va = (a.creado_por ?? "").toLowerCase(); vb = (b.creado_por ?? "").toLowerCase(); }
      if (sortKey === "cantidad")   { va = a.invitados.length; vb = b.invitados.length; }
      if (sortKey === "fecha")      { va = a.created_at; vb = b.created_at; }
      if (sortKey === "confirmados"){ va = a.invitados.filter(i => i.confirmacion_1 || i.confirmacion_2 || i.confirmacion_3).length; vb = b.invitados.filter(i => i.confirmacion_1 || i.confirmacion_2 || i.confirmacion_3).length; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }

  const invitacionesFiltradas = useMemo(() => aplicarFiltros(invitaciones), [invitaciones, search, sortKey, sortDir, tipo, confFiltro, creadoPor]);

  // Lista plana para tabs "lista" y "confirmados"
  const allInvFlat = useMemo(() => {
    let lista = invitaciones.flatMap(r => r.invitados.map(i => ({ ...i, codigo: r.codigo, creado_por: r.creado_por, esGrupo: r.invitados.length > 1 })));
    if (search) lista = lista.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()) || i.codigo.includes(search));
    if (tipo === "grupo")      lista = lista.filter(i => i.esGrupo);
    if (tipo === "individual") lista = lista.filter(i => !i.esGrupo);
    if (creadoPor)             lista = lista.filter(i => i.creado_por === creadoPor);
    if (confFiltro === "conf1")   lista = lista.filter(i => i.confirmacion_1);
    if (confFiltro === "conf2")   lista = lista.filter(i => i.confirmacion_2);
    if (confFiltro === "conf3")   lista = lista.filter(i => i.confirmacion_3);
    if (confFiltro === "ninguna") lista = lista.filter(i => !i.confirmacion_1 && !i.confirmacion_2 && !i.confirmacion_3);
    lista = [...lista].sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0;
      if (sortKey === "nombre")  { va = a.nombre.toLowerCase(); vb = b.nombre.toLowerCase(); }
      if (sortKey === "codigo")  { va = a.codigo; vb = b.codigo; }
      if (sortKey === "creado_por") { va = (a.creado_por ?? "").toLowerCase(); vb = (b.creado_por ?? "").toLowerCase(); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return lista;
  }, [invitaciones, search, sortKey, sortDir, tipo, confFiltro, creadoPor]);

  const confirmadosFiltrados = useMemo(() =>
    allInvFlat.filter(i => i.confirmacion_1 || i.confirmacion_2 || i.confirmacion_3)
  , [allInvFlat]);

  const barraProps = { search, setSearch, sortKey, setSortKey, sortDir, setSortDir, tipo, setTipo, confFiltro, setConfFiltro, creadores, creadoPor, setCreadoPor };

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg-hero)" }}>
      <header style={{ background: "var(--cream-mid)", borderBottom: "1px solid var(--border-subtle)", padding: "0.8rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, gap: "0.8rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <h1 className="script" style={{ fontSize: "2rem", color: "var(--ink)", lineHeight: 1 }}>C &amp; H</h1>
          <p className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--terracotta)" }}>Admin</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={exportCSV} style={{ ...btnOutline, fontSize: "0.7rem", padding: "0.55rem 1rem" }}>CSV</button>
          <button onClick={logout} style={{ ...btnOutline, borderColor: "var(--ink-light)", color: "var(--ink-light)", fontSize: "0.7rem", padding: "0.55rem 1rem" }}>Salir</button>
        </div>
      </header>

      <main style={{ padding: "1.2rem 1rem", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <StatCard value={totalRes}   label="Invit."      color="var(--terracotta)" />
          <StatCard value={totalInv}   label="Invitados"   color="var(--ink)" />
          <StatCard value={conf1}      label="1ra conf"    color="var(--olive)" />
          <StatCard value={conf2}      label="2da conf"    color="var(--periwinkle)" />
          <StatCard value={conf3}      label="3ra conf"    color="var(--gold)" />
          <StatCard value={asistieron} label="Asistieron"  color="var(--red)" />
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1.2rem" }}>
          {(["invitaciones", "lista", "confirmados", "usuarios"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "0.75rem 1.2rem", background: "none", border: "none",
              borderBottom: tab === t ? "2px solid var(--terracotta)" : "2px solid transparent",
              color: tab === t ? "var(--terracotta)" : "var(--ink-light)",
              fontFamily: "'Montserrat', sans-serif", fontSize: "0.7rem",
              letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
              marginBottom: "-1px", whiteSpace: "nowrap",
            }}>
              {t === "invitaciones" ? "Invitaciones" : t === "lista" ? "Todos" : t === "confirmados" ? "Confirmados" : "Usuarios"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Cargando...</p>
        ) : tab === "invitaciones" ? (
          <>
            <BarraFiltros {...barraProps} extra={<button onClick={() => setModalNueva(true)} style={btnPrimary}>+ Nueva</button>} />
            <p className="sans" style={{ fontSize: "0.8rem", color: "var(--ink-light)", marginBottom: "0.8rem" }}>{invitacionesFiltradas.length} invitaciones</p>
            {invitacionesFiltradas.length === 0
              ? <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Sin resultados.</p>
              : invitacionesFiltradas.map(r => (
                <TarjetaInvitacion key={r.id} invitacion={r}
                  onUpdateInv={updateInvitado} onUpdateTexto={updateInvitadoTexto}
                  onUpdateNombreGrupo={updateNombreGrupo}
                  onDeleteInv={deleteInvitado} onDeleteInvitacion={deleteInvitacion} onAddPersona={setModalAdd}
                />
              ))
            }
          </>
        ) : tab === "lista" ? (
          <>
            <BarraFiltros {...barraProps} />
            <p className="sans" style={{ fontSize: "0.8rem", color: "var(--ink-light)", marginBottom: "0.8rem" }}>{allInvFlat.length} personas</p>
            {allInvFlat.map((inv, idx) => (
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
            ))}
            {allInvFlat.length === 0 && <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Sin resultados.</p>}
          </>
        ) : tab === "confirmados" ? (
          <>
            <BarraFiltros {...barraProps} />
            <p className="sans" style={{ fontSize: "0.8rem", color: "var(--ink-light)", marginBottom: "0.8rem" }}>{confirmadosFiltrados.length} personas con al menos una confirmación</p>
            {confirmadosFiltrados.map((inv, idx) => (
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
            ))}
            {confirmadosFiltrados.length === 0 && <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Nadie ha confirmado aún.</p>}
          </>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <button onClick={() => setModalUsuario(true)} style={btnPrimary}>+ Nuevo usuario</button>
            </div>
            {usuarios.map(u => (
              <div key={u.id} style={{ padding: "0.9rem 1rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.4rem" }}>
                <div>
                  <p className="sans" style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>{u.nombre}</p>
                  <p className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", margin: 0 }}>@{u.username}</p>
                </div>
                <span className="sans" style={{ fontSize: "0.58rem", color: "var(--ink-light)" }}>{new Date(u.created_at).toLocaleDateString("es-VE")}</span>
              </div>
            ))}
            {usuarios.length === 0 && <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Cargando usuarios...</p>}
          </div>
        )}
      </main>

      {modalNueva   && <ModalNuevaInvitacion onClose={() => setModalNueva(false)} onCreated={r => setInvitaciones(rs => [r, ...rs])} nombreAdmin={nombreAdmin} />}
      {modalAdd     && <ModalAgregarPersona invitacion={modalAdd} onClose={() => setModalAdd(null)} onAdded={inv => { setInvitaciones(rs => rs.map(r => r.id !== modalAdd.id ? r : { ...r, invitados: [...r.invitados, inv] })); }} />}
      {modalUsuario && <ModalNuevoUsuario onClose={() => setModalUsuario(false)} onCreated={cargarUsuarios} />}
    </div>
  );
}