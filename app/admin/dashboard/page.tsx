"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────
interface Invitado {
  id: string;
  invitacion_id: string;
  nombre: string;
  whatsapp: string | null;
  confirmacion_1: boolean;
  confirmacion_1_fecha: string | null;
  confirmacion_2: boolean;
  confirmacion_2_fecha: string | null;
  confirmacion_3: boolean;
  confirmacion_3_fecha: string | null;
  asistio: boolean;
}
interface Invitacion {
  id: string;
  codigo: string;
  nombre: string | null;
  creado_por: string | null;
  created_at: string;
  invitados: Invitado[];
}

// ── Helpers ────────────────────────────────────────────
function token() { return localStorage.getItem("admin_token") ?? ""; }
function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token()}` };
}
function fechaCorta(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit" });
}

// ── Estilos compartidos ────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.6rem", letterSpacing: "0.18em",
  textTransform: "uppercase", color: "var(--ink-light)",
  fontFamily: "'Montserrat', sans-serif", marginBottom: "0.4rem",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.8rem", boxSizing: "border-box",
  background: "var(--cream)", border: "1px solid var(--border-subtle)",
  borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
  fontSize: "0.82rem", color: "var(--ink)", outline: "none",
};
const btnPrimary: React.CSSProperties = {
  padding: "0.65rem 1.4rem", background: "var(--terracotta)", color: "var(--cream)",
  border: "none", borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
  fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer",
  whiteSpace: "nowrap",
};
const btnOutline: React.CSSProperties = {
  padding: "0.6rem 1.2rem", background: "transparent", color: "var(--terracotta)",
  border: "1px solid var(--terracotta)", borderRadius: "2px",
  fontFamily: "'Montserrat', sans-serif", fontSize: "0.65rem",
  letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer",
  whiteSpace: "nowrap",
};

// ── StatCard ───────────────────────────────────────────
function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ padding: "1rem 0.6rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderTop: `3px solid ${color}`, borderRadius: "2px", textAlign: "center" }}>
      <p style={{ fontSize: "1.6rem", fontFamily: "'Cormorant Garamond', serif", color, lineHeight: 1 }}>{value}</p>
      <p className="sans" style={{ fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-light)", marginTop: "0.3rem" }}>{label}</p>
    </div>
  );
}

// ── Modal nueva invitación ─────────────────────────────
function ModalNuevaInvitacion({ onClose, onCreated, username }: { onClose: () => void; onCreated: (r: Invitacion) => void; username: string }) {
  const [personas, setPersonas]       = useState([{ nombre: "", whatsapp: "" }]);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  function agregar() { setPersonas(p => [...p, { nombre: "", whatsapp: "" }]); }
  function quitar(idx: number) { setPersonas(p => p.filter((_, i) => i !== idx)); }
  function actualizar(idx: number, field: string, val: string) {
    setPersonas(p => p.map((x, i) => i === idx ? { ...x, [field]: val } : x));
  }

  async function crear() {
    const validos = personas.filter(p => p.nombre.trim());
    if (validos.length === 0) { setError("Agrega al menos un nombre"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/invitaciones", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ invitados: validos, nombre: nombreGrupo.trim() || null, creado_por: username }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onCreated(data); onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "2rem", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 className="serif" style={{ fontSize: "1.5rem", color: "var(--ink)", marginBottom: "0.3rem" }}>Nueva invitación</h3>
        <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", marginBottom: "1.5rem" }}>El código de 6 dígitos se genera automáticamente.</p>

        {personas.map((p, idx) => (
          <div key={idx} style={{ marginBottom: "1rem", padding: "1rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
              <span className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--terracotta)" }}>
                {idx === 0 ? "Invitado" : `Invitado ${idx + 1}`}
              </span>
              {personas.length > 1 && (
                <button onClick={() => quitar(idx)} style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "1rem" }}>×</button>
              )}
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

        <button onClick={agregar} style={{ ...btnOutline, width: "100%", marginBottom: "1.2rem" }}>
          + Agregar otra persona a esta invitación
        </button>

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
  const [nombre, setNombre]     = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function agregar() {
    if (!nombre.trim()) { setError("Nombre requerido"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/invitados", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ invitacion_id: invitacion.id, nombre, whatsapp }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onAdded(data); onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "2rem", width: "100%", maxWidth: "380px" }}>
        <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--ink)", marginBottom: "0.3rem" }}>Agregar persona</h3>
        <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", marginBottom: "1.5rem" }}>Invitación <strong>{invitacion.codigo}</strong></p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WhatsApp (opcional)</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+58 412 0000000" style={inputStyle} />
          </div>
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
  const [form, setForm]     = useState({ username: "", nombre: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function crear() {
    if (!form.username.trim() || !form.password.trim() || !form.nombre.trim()) {
      setError("Todos los campos son requeridos"); return;
    }
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "2rem", width: "100%", maxWidth: "380px" }}>
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
      </div>
    </div>
  );
}

// ── Checkbox confirmación ──────────────────────────────
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
function FilaInvitado({ inv, codigo, onUpdate, onDelete }: {
  inv: Invitado; codigo: string;
  onUpdate: (id: string, field: string, val: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.35rem", padding: "0.65rem 0.8rem" }}>
      {/* Nombre + código */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <div>
          <span className="serif" style={{ fontSize: "0.9rem", color: "var(--ink)" }}>{inv.nombre}</span>
          {inv.whatsapp && <span className="sans" style={{ fontSize: "0.6rem", color: "var(--ink-light)", marginLeft: "0.5rem" }}>{inv.whatsapp}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="sans" style={{ fontSize: "0.62rem", color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.15rem 0.5rem", borderRadius: "2px" }}>{codigo}</span>
          <button onClick={() => { if (confirm(`¿Eliminar a ${inv.nombre}?`)) onDelete(inv.id); }} style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "1rem", padding: "0", lineHeight: 1 }}>×</button>
        </div>
      </div>
      {/* Checks en una sola fila */}
      <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
        <CheckConfirm checked={inv.confirmacion_1} fecha={inv.confirmacion_1_fecha} label="1ra"     color="var(--olive)"       onChange={v => onUpdate(inv.id, "confirmacion_1", v)} />
        <CheckConfirm checked={inv.confirmacion_2} fecha={inv.confirmacion_2_fecha} label="2da"     color="var(--periwinkle)"  onChange={v => onUpdate(inv.id, "confirmacion_2", v)} />
        <CheckConfirm checked={inv.confirmacion_3} fecha={inv.confirmacion_3_fecha} label="3ra"     color="var(--gold)"        onChange={v => onUpdate(inv.id, "confirmacion_3", v)} />
        <CheckConfirm checked={inv.asistio}        fecha={null}                     label="Asistió" color="var(--terracotta)"  onChange={v => onUpdate(inv.id, "asistio", v)} />
      </div>
    </div>
  );
}

// ── Tarjeta invitación ─────────────────────────────────
function TarjetaInvitacion({ invitacion, onUpdateInv, onDeleteInv, onDeleteInvitacion, onAddPersona }: {
  invitacion: Invitacion;
  onUpdateInv: (invId: string, invId2: string, field: string, val: boolean) => void;
  onDeleteInv: (invId: string, invId2: string) => void;
  onDeleteInvitacion: (id: string) => void;
  onAddPersona: (r: Invitacion) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = invitacion.invitados.length;
  const conf1 = invitacion.invitados.filter(i => i.confirmacion_1).length;
  const conf3 = invitacion.invitados.filter(i => i.confirmacion_3).length;

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.6rem", background: "var(--cream-mid)" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.9rem 1.2rem", cursor: "pointer", flexWrap: "wrap" }}>
        <span className="sans" style={{ fontSize: "1rem", letterSpacing: "0.1em", color: "var(--terracotta)", fontWeight: 600 }}>{invitacion.codigo}</span>
        <div style={{ flex: 1, minWidth: "0" }}>
          {invitacion.nombre && (
            <p className="serif" style={{ fontSize: "0.95rem", color: "var(--ink)", margin: "0 0 0.1rem 0", fontWeight: 600 }}>{invitacion.nombre}</p>
          )}
          <p className="serif" style={{ fontSize: "0.82rem", color: "var(--ink-light)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {invitacion.invitados.map(i => i.nombre).join(", ")}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
          <span className="sans" style={{ fontSize: "0.58rem", color: "var(--ink-light)" }}>{total} {total === 1 ? "persona" : "personas"} · {conf1} conf · {conf3} 3ra</span>
          {invitacion.creado_por && (
            <span className="sans" style={{ fontSize: "0.62rem", color: "var(--ink)", background: "rgba(0,0,0,0.06)", padding: "0.15rem 0.6rem", borderRadius: "2px", letterSpacing: "0.05em" }}>por {invitacion.creado_por}</span>
          )}
        </div>
        <span style={{ color: "var(--ink-light)", fontSize: "0.7rem" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 1.2rem 1.2rem" }}>
          {invitacion.invitados.map(inv => (
            <FilaInvitado
              key={inv.id} inv={inv} codigo={invitacion.codigo}
              onUpdate={(id, field, val) => onUpdateInv(invitacion.id, id, field, val)}
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
  const [search, setSearch]               = useState("");
  const [tab, setTab]                     = useState<"invitaciones" | "lista" | "confirmados" | "usuarios">("invitaciones");
  const [modalNueva, setModalNueva]       = useState(false);
  const [modalAdd, setModalAdd]           = useState<Invitacion | null>(null);
  const [modalUsuario, setModalUsuario]   = useState(false);
  const [username, setUsername]           = useState("");
  const [nombreAdmin, setNombreAdmin]       = useState("");
  const [usuarios, setUsuarios]           = useState<{ id: string; username: string; nombre: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) { router.push("/admin"); return; }
    // Decodificar username del JWT
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

  useEffect(() => {
    if (tab === "usuarios") cargarUsuarios();
  }, [tab]);

  function logout() { localStorage.removeItem("admin_token"); router.push("/admin"); }

  async function updateInvitado(invitacionId: string, invId: string, field: string, val: boolean) {
    await fetch(`/api/admin/invitados?id=${invId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ [field]: val }),
    });
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

  // Stats
  const allInv      = invitaciones.flatMap(r => r.invitados);
  const totalInv    = allInv.length;
  const totalRes    = invitaciones.length;
  const conf1       = allInv.filter(i => i.confirmacion_1).length;
  const conf2       = allInv.filter(i => i.confirmacion_2).length;
  const conf3       = allInv.filter(i => i.confirmacion_3).length;
  const asistieron  = allInv.filter(i => i.asistio).length;

  const allInvFlat = invitaciones.flatMap(r => r.invitados.map(i => ({ ...i, codigo: r.codigo, creado_por: r.creado_por })));
  const filtered = allInvFlat.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) || i.codigo.includes(search)
  );
  const confirmados = allInvFlat.filter(i => i.confirmacion_1 || i.confirmacion_2 || i.confirmacion_3);
  const confirmadosFiltrados = confirmados.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) || i.codigo.includes(search)
  );
  const invitacionesFiltradas = invitaciones.filter(r =>
    r.codigo.includes(search) ||
    (r.nombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
    r.invitados.some(i => i.nombre.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg-hero)" }}>
      {/* Header */}
      <header style={{ background: "var(--cream-mid)", borderBottom: "1px solid var(--border-subtle)", padding: "0.8rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, gap: "0.8rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <h1 className="script" style={{ fontSize: "2rem", color: "var(--ink)", lineHeight: 1 }}>C &amp; H</h1>
          <p className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--terracotta)" }}>Admin</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={exportCSV} style={{ ...btnOutline, fontSize: "0.58rem", padding: "0.5rem 0.8rem" }}>CSV</button>
          <button onClick={logout} style={{ ...btnOutline, borderColor: "var(--ink-light)", color: "var(--ink-light)", fontSize: "0.58rem", padding: "0.5rem 0.8rem" }}>Salir</button>
        </div>
      </header>

      <main style={{ padding: "1.2rem 1rem", maxWidth: "960px", margin: "0 auto" }}>
        {/* Stats — 2 filas en mobile */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <StatCard value={totalRes}   label="Invit." color="var(--terracotta)" />
          <StatCard value={totalInv}   label="Invitados"    color="var(--ink)" />
          <StatCard value={conf1}      label="1ra conf"     color="var(--olive)" />
          <StatCard value={conf2}      label="2da conf"     color="var(--periwinkle)" />
          <StatCard value={conf3}      label="3ra conf"     color="var(--gold)" />
          <StatCard value={asistieron} label="Asistieron"   color="var(--red)" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1.2rem", overflowX: "auto" }}>
          {(["invitaciones", "lista", "confirmados", "usuarios"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "0.6rem 1rem", background: "none", border: "none",
              borderBottom: tab === t ? "2px solid var(--terracotta)" : "2px solid transparent",
              color: tab === t ? "var(--terracotta)" : "var(--ink-light)",
              fontFamily: "'Montserrat', sans-serif", fontSize: "0.6rem",
              letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
              marginBottom: "-1px", whiteSpace: "nowrap",
            }}>
              {t === "invitaciones" ? "Invitaciones" : t === "lista" ? "Todos" : t === "confirmados" ? "Confirmados" : "Usuarios"}
            </button>
          ))}
        </div>

        {/* Búsqueda + nuevo */}
        {tab !== "usuarios" && (
          <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.2rem" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código..." style={{ ...inputStyle, flex: 1 }} />
            {tab === "invitaciones" && <button onClick={() => setModalNueva(true)} style={btnPrimary}>+ Nueva</button>}
          </div>
        )}

        {/* Contenido */}
        {loading ? (
          <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Cargando...</p>
        ) : tab === "invitaciones" ? (
          invitacionesFiltradas.length === 0
            ? <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>{search ? "Sin resultados." : "Aún no hay invitaciones."}</p>
            : invitacionesFiltradas.map(r => (
              <TarjetaInvitacion key={r.id} invitacion={r}
                onUpdateInv={updateInvitado} onDeleteInv={deleteInvitado}
                onDeleteInvitacion={deleteInvitacion} onAddPersona={setModalAdd}
              />
            ))
        ) : tab === "lista" ? (
          <div>
            {filtered.map(inv => (
              <div key={inv.id} style={{ padding: "0.7rem 0.8rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.3rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.4rem" }}>
                  <span className="serif" style={{ fontSize: "0.95rem", color: "var(--ink)" }}>{inv.nombre}</span>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="sans" style={{ fontSize: "0.62rem", color: "var(--terracotta)" }}>{inv.codigo}</span>
                    {inv.creado_por && <span className="sans" style={{ fontSize: "0.62rem", color: "var(--ink)", background: "rgba(0,0,0,0.06)", padding: "0.15rem 0.6rem", borderRadius: "2px" }}>por {inv.creado_por}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
                  <span className="sans" style={{ fontSize: "0.65rem", color: inv.confirmacion_1 ? "var(--olive)" : "var(--ink-light)" }}>1ra: {inv.confirmacion_1 ? `Sí ${fechaCorta(inv.confirmacion_1_fecha)}` : "No"}</span>
                  <span className="sans" style={{ fontSize: "0.65rem", color: inv.confirmacion_2 ? "var(--periwinkle)" : "var(--ink-light)" }}>2da: {inv.confirmacion_2 ? `Sí ${fechaCorta(inv.confirmacion_2_fecha)}` : "No"}</span>
                  <span className="sans" style={{ fontSize: "0.65rem", color: inv.confirmacion_3 ? "var(--gold)" : "var(--ink-light)" }}>3ra: {inv.confirmacion_3 ? `Sí ${fechaCorta(inv.confirmacion_3_fecha)}` : "No"}</span>
                  <span className="sans" style={{ fontSize: "0.65rem", color: inv.asistio ? "var(--terracotta)" : "var(--ink-light)" }}>Asistió: {inv.asistio ? "Sí" : "No"}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Sin resultados.</p>}
          </div>
        ) : tab === "confirmados" ? (
          <div>
            <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", marginBottom: "1rem" }}>{confirmadosFiltrados.length} personas con al menos una confirmación</p>
            {confirmadosFiltrados.map(inv => (
              <div key={inv.id} style={{ padding: "0.7rem 0.8rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.3rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem" }}>
                  <span className="serif" style={{ fontSize: "0.95rem", color: "var(--ink)" }}>{inv.nombre}</span>
                  <span className="sans" style={{ fontSize: "0.62rem", color: "var(--terracotta)" }}>{inv.codigo}</span>
                </div>
                <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
                  <span className="sans" style={{ fontSize: "0.65rem", color: inv.confirmacion_1 ? "var(--olive)" : "var(--ink-light)" }}>1ra: {inv.confirmacion_1 ? `Sí ${fechaCorta(inv.confirmacion_1_fecha)}` : "—"}</span>
                  <span className="sans" style={{ fontSize: "0.65rem", color: inv.confirmacion_2 ? "var(--periwinkle)" : "var(--ink-light)" }}>2da: {inv.confirmacion_2 ? `Sí ${fechaCorta(inv.confirmacion_2_fecha)}` : "—"}</span>
                  <span className="sans" style={{ fontSize: "0.65rem", color: inv.confirmacion_3 ? "var(--gold)" : "var(--ink-light)" }}>3ra: {inv.confirmacion_3 ? `Sí ${fechaCorta(inv.confirmacion_3_fecha)}` : "—"}</span>
                </div>
              </div>
            ))}
            {confirmadosFiltrados.length === 0 && <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Nadie ha confirmado aún.</p>}
          </div>
        ) : (
          /* Usuarios */
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <button onClick={() => setModalUsuario(true)} style={btnPrimary}>+ Nuevo usuario</button>
            </div>
            {usuarios.map(u => (
              <div key={u.id} style={{ padding: "0.9rem 1rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.4rem" }}>
                <div>
                  <p className="serif" style={{ fontSize: "1rem", color: "var(--ink)", margin: 0 }}>{u.nombre}</p>
                  <p className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)", margin: 0 }}>@{u.username}</p>
                </div>
                <span className="sans" style={{ fontSize: "0.58rem", color: "var(--ink-light)" }}>
                  {new Date(u.created_at).toLocaleDateString("es-VE")}
                </span>
              </div>
            ))}
            {usuarios.length === 0 && <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Cargando usuarios...</p>}
          </div>
        )}
      </main>

      {modalNueva   && <ModalNuevaInvitacion onClose={() => setModalNueva(false)} onCreated={r => setInvitaciones(rs => [r, ...rs])} username={nombreAdmin} />}
      {modalAdd     && <ModalAgregarPersona invitacion={modalAdd} onClose={() => setModalAdd(null)} onAdded={inv => { setInvitaciones(rs => rs.map(r => r.id !== modalAdd.id ? r : { ...r, invitados: [...r.invitados, inv] })); }} />}
      {modalUsuario && <ModalNuevoUsuario onClose={() => setModalUsuario(false)} onCreated={cargarUsuarios} />}
    </div>
  );
}