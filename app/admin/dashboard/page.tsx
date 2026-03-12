"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────
interface Invitado {
  id: string;
  invitación_id: string;
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
interface Invitación {
  id: string;
  codigo: string;
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
};
const btnOutline: React.CSSProperties = {
  padding: "0.6rem 1.2rem", background: "transparent", color: "var(--terracotta)",
  border: "1px solid var(--terracotta)", borderRadius: "2px",
  fontFamily: "'Montserrat', sans-serif", fontSize: "0.65rem",
  letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer",
};

// ── StatCard ───────────────────────────────────────────
function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ padding: "1.2rem 1rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderTop: `3px solid ${color}`, borderRadius: "2px", textAlign: "center" }}>
      <p style={{ fontSize: "2rem", fontFamily: "'Cormorant Garamond', serif", color, lineHeight: 1 }}>{value}</p>
      <p className="sans" style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)", marginTop: "0.4rem" }}>{label}</p>
    </div>
  );
}

// ── Modal nueva invitación ────────────────────────────────
function ModalNuevaInvitación({ onClose, onCreated }: { onClose: () => void; onCreated: (r: Invitación) => void }) {
  const [personas, setPersonas] = useState([{ nombre: "", whatsapp: "" }]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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
      body: JSON.stringify({ invitados: validos }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onCreated(data);
    onClose();
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
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Nombre</label>
                <input value={p.nombre} onChange={e => actualizar(idx, "nombre", e.target.value)} placeholder="Nombre completo" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>WhatsApp</label>
                <input value={p.whatsapp} onChange={e => actualizar(idx, "whatsapp", e.target.value)} placeholder="Opcional" style={inputStyle} />
              </div>
            </div>
          </div>
        ))}

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

// ── Modal agregar persona a invitación existente ──────────
function ModalAgregarPersona({ invitación, onClose, onAdded }: { invitación: Invitación; onClose: () => void; onAdded: (inv: Invitado) => void }) {
  const [nombre, setNombre]     = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function agregar() {
    if (!nombre.trim()) { setError("Nombre requerido"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/invitados", {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ invitación_id: invitación.id, nombre, whatsapp }),
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
        <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", marginBottom: "1.5rem" }}>Invitación <strong>{invitación.codigo}</strong></p>
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

// ── Checkbox de confirmación ───────────────────────────
function CheckConfirm({ checked, fecha, label, color, onChange }: { checked: boolean; fecha: string | null; label: string; color: string; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: color, width: "14px", height: "14px" }} />
      <span className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.08em", textTransform: "uppercase", color: checked ? color : "var(--ink-light)" }}>{label}</span>
      {checked && fecha && <span className="sans" style={{ fontSize: "0.5rem", color: "var(--ink-light)" }}>{fechaCorta(fecha)}</span>}
    </label>
  );
}

// ── Fila de invitado ───────────────────────────────────
function FilaInvitado({ inv, codigo, onUpdate, onDelete }: {
  inv: Invitado; codigo: string;
  onUpdate: (id: string, field: string, val: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto auto", alignItems: "center", gap: "0.8rem", padding: "0.65rem 0.8rem", background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.35rem" }}>
      <div>
        <span className="serif" style={{ fontSize: "0.95rem", color: "var(--ink)" }}>{inv.nombre}</span>
        {inv.whatsapp && <span className="sans" style={{ fontSize: "0.6rem", color: "var(--ink-light)", marginLeft: "0.5rem" }}>{inv.whatsapp}</span>}
      </div>
      <span className="sans" style={{ fontSize: "0.62rem", color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.15rem 0.5rem", borderRadius: "2px" }}>{codigo}</span>
      <CheckConfirm checked={inv.confirmacion_1} fecha={inv.confirmacion_1_fecha} label="1ra" color="var(--olive)"      onChange={v => onUpdate(inv.id, "confirmacion_1", v)} />
      <CheckConfirm checked={inv.confirmacion_2} fecha={inv.confirmacion_2_fecha} label="2da" color="var(--periwinkle)" onChange={v => onUpdate(inv.id, "confirmacion_2", v)} />
      <CheckConfirm checked={inv.confirmacion_3} fecha={inv.confirmacion_3_fecha} label="3ra" color="var(--gold)"       onChange={v => onUpdate(inv.id, "confirmacion_3", v)} />
      <CheckConfirm checked={inv.asistio}        fecha={null}                     label="Asistió" color="var(--terracotta)" onChange={v => onUpdate(inv.id, "asistio", v)} />
      <button onClick={() => { if (confirm(`¿Eliminar a ${inv.nombre}?`)) onDelete(inv.id); }} style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "1rem", padding: "0" }}>×</button>
    </div>
  );
}

// ── Tarjeta de invitación ─────────────────────────────────
function TarjetaInvitación({ invitación, onUpdateInv, onDeleteInv, onDeleteInvitación, onAddPersona }: {
  invitación: Invitación;
  onUpdateInv: (invitaciónId: string, invId: string, field: string, val: boolean) => void;
  onDeleteInv: (invitaciónId: string, invId: string) => void;
  onDeleteInvitación: (id: string) => void;
  onAddPersona: (r: Invitación) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = invitación.invitados.length;
  const conf1 = invitación.invitados.filter(i => i.confirmacion_1).length;
  const conf3 = invitación.invitados.filter(i => i.confirmacion_3).length;

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.6rem", background: "var(--cream-mid)" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.9rem 1.2rem", cursor: "pointer" }}>
        <span className="sans" style={{ fontSize: "1rem", letterSpacing: "0.1em", color: "var(--terracotta)", fontWeight: 600 }}>{invitación.codigo}</span>
        <span className="serif" style={{ flex: 1, fontSize: "0.9rem", color: "var(--ink-light)" }}>
          {invitación.invitados.map(i => i.nombre).join(", ")}
        </span>
        <span className="sans" style={{ fontSize: "0.62rem", color: "var(--ink-light)" }}>{total} {total === 1 ? "persona" : "personas"} · {conf1} conf · {conf3} 3ra</span>
        <span style={{ color: "var(--ink-light)", fontSize: "0.7rem" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 1.2rem 1.2rem" }}>
          {invitación.invitados.map(inv => (
            <FilaInvitado
              key={inv.id} inv={inv} codigo={invitación.codigo}
              onUpdate={(id, field, val) => onUpdateInv(invitación.id, id, field, val)}
              onDelete={(id) => onDeleteInv(invitación.id, id)}
            />
          ))}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.8rem" }}>
            <button onClick={() => onAddPersona(invitación)} style={btnOutline}>+ Agregar persona</button>
            <button onClick={() => { if (confirm(`¿Eliminar invitación ${invitación.codigo}?`)) onDeleteInvitación(invitación.id); }} style={{ ...btnOutline, color: "var(--red)", borderColor: "var(--red)" }}>Eliminar invitación</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────
export default function AdminDashboard() {
  const router  = useRouter();
  const [invitacións, setInvitacións]       = useState<Invitación[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [tab, setTab]                 = useState<"invitacións" | "lista" | "confirmados">("invitacións");
  const [modalNueva, setModalNueva]   = useState(false);
  const [modalAdd, setModalAdd]       = useState<Invitación | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) { router.push("/admin"); return; }
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/invitaciones", { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { router.push("/admin"); return; }
      setInvitacións(await res.json());
      setLoading(false);
    };
    fetchData();
  }, [router]);

  function logout() { localStorage.removeItem("admin_token"); router.push("/admin"); }

  async function updateInvitado(invitaciónId: string, invId: string, field: string, val: boolean) {
    await fetch(`/api/admin/invitados?id=${invId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ [field]: val }),
    });
    setInvitacións(rs => rs.map(r => r.id !== invitaciónId ? r : {
      ...r, invitados: r.invitados.map(i => {
        if (i.id !== invId) return i;
        const updated = { ...i, [field]: val };
        if (field === "confirmacion_1") updated.confirmacion_1_fecha = val ? new Date().toISOString() : null;
        if (field === "confirmacion_2") updated.confirmacion_2_fecha = val ? new Date().toISOString() : null;
        if (field === "confirmacion_3") updated.confirmacion_3_fecha = val ? new Date().toISOString() : null;
        return updated;
      }),
    }));
  }

  async function deleteInvitado(invitaciónId: string, invId: string) {
    await fetch(`/api/admin/invitados?id=${invId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    setInvitacións(rs => rs.map(r => r.id !== invitaciónId ? r : { ...r, invitados: r.invitados.filter(i => i.id !== invId) }));
  }

  async function deleteInvitación(id: string) {
    await fetch(`/api/admin/invitaciones?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    setInvitacións(rs => rs.filter(r => r.id !== id));
  }

  function exportCSV() {
    fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `invitados-carlayhely-${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
      });
  }

  // Stats
  const allInv      = invitacións.flatMap(r => r.invitados);
  const totalInv    = allInv.length;
  const totalRes    = invitacións.length;
  const conf1       = allInv.filter(i => i.confirmacion_1).length;
  const conf2       = allInv.filter(i => i.confirmacion_2).length;
  const conf3       = allInv.filter(i => i.confirmacion_3).length;
  const asistieron  = allInv.filter(i => i.asistio).length;

  // Lista plana filtrada
  const allInvFlat = invitacións.flatMap(r => r.invitados.map(i => ({ ...i, codigo: r.codigo })));
  const filtered = allInvFlat.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    i.codigo.includes(search)
  );

  // Confirmados (al menos una confirmación)
  const confirmados = allInvFlat.filter(i => i.confirmacion_1 || i.confirmacion_2 || i.confirmacion_3);
  const confirmadosFiltrados = confirmados.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    i.codigo.includes(search)
  );

  // Invitacións filtradas
  const invitaciónsFiltradas = invitacións.filter(r =>
    r.codigo.includes(search) ||
    r.invitados.some(i => i.nombre.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg-hero)" }}>
      {/* Header */}
      <header style={{ background: "var(--cream-mid)", borderBottom: "1px solid var(--border-subtle)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h1 className="script" style={{ fontSize: "2.2rem", color: "var(--ink)", lineHeight: 1 }}>C &amp; H</h1>
          <p className="sans" style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--terracotta)" }}>Admin</p>
        </div>
        <div style={{ display: "flex", gap: "0.8rem" }}>
          <button onClick={exportCSV} style={btnOutline}>Exportar CSV</button>
          <button onClick={logout} style={{ ...btnOutline, borderColor: "var(--ink-light)", color: "var(--ink-light)" }}>Salir</button>
        </div>
      </header>

      <main style={{ padding: "2rem 1.5rem", maxWidth: "960px", margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.6rem", marginBottom: "2rem" }}>
          <StatCard value={totalRes}   label="Invitacións"   color="var(--terracotta)" />
          <StatCard value={totalInv}   label="Invitados"  color="var(--ink)" />
          <StatCard value={conf1}      label="1ra conf"   color="var(--olive)" />
          <StatCard value={conf2}      label="2da conf"   color="var(--periwinkle)" />
          <StatCard value={conf3}      label="3ra conf"   color="var(--gold)" />
          <StatCard value={asistieron} label="Asistieron" color="var(--red)" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1.5rem" }}>
          {(["invitacións", "lista", "confirmados"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "0.7rem 1.4rem", background: "none", border: "none",
              borderBottom: tab === t ? "2px solid var(--terracotta)" : "2px solid transparent",
              color: tab === t ? "var(--terracotta)" : "var(--ink-light)",
              fontFamily: "'Montserrat', sans-serif", fontSize: "0.65rem",
              letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", marginBottom: "-1px",
            }}>
              {t === "invitacións" ? "Invitacións" : t === "lista" ? "Todos" : "Confirmados"}
            </button>
          ))}
        </div>

        {/* Búsqueda + nuevo */}
        <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.5rem" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código..." style={{ ...inputStyle, flex: 1 }} />
          {tab === "invitacións" && <button onClick={() => setModalNueva(true)} style={btnPrimary}>+ Nueva invitación</button>}
        </div>

        {/* Contenido */}
        {loading ? (
          <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Cargando...</p>
        ) : tab === "invitacións" ? (
          invitaciónsFiltradas.length === 0 ? (
            <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>{search ? "Sin resultados." : "Aún no hay invitacións."}</p>
          ) : invitaciónsFiltradas.map(r => (
            <TarjetaInvitación key={r.id} invitación={r}
              onUpdateInv={updateInvitado} onDeleteInv={deleteInvitado}
              onDeleteInvitación={deleteInvitación} onAddPersona={setModalAdd}
            />
          ))
        ) : tab === "lista" ? (
          /* Todos los invitados */
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 0.6fr 0.6fr 0.6fr 0.7fr", gap: "0.5rem", padding: "0.4rem 0.8rem", marginBottom: "0.3rem" }}>
              {["Nombre", "Código", "1ra", "2da", "3ra", "Asistió"].map(h => (
                <span key={h} className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)" }}>{h}</span>
              ))}
            </div>
            {filtered.map(inv => (
              <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 0.6fr 0.6fr 0.6fr 0.7fr", gap: "0.5rem", padding: "0.65rem 0.8rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.3rem", alignItems: "center" }}>
                <span className="serif" style={{ fontSize: "0.9rem", color: "var(--ink)" }}>{inv.nombre}</span>
                <span className="sans" style={{ fontSize: "0.65rem", color: "var(--terracotta)" }}>{inv.codigo}</span>
                <span className="sans" style={{ fontSize: "0.7rem", color: inv.confirmacion_1 ? "var(--olive)" : "var(--ink-light)" }}>{inv.confirmacion_1 ? `Sí ${fechaCorta(inv.confirmacion_1_fecha)}` : "No"}</span>
                <span className="sans" style={{ fontSize: "0.7rem", color: inv.confirmacion_2 ? "var(--periwinkle)" : "var(--ink-light)" }}>{inv.confirmacion_2 ? `Sí ${fechaCorta(inv.confirmacion_2_fecha)}` : "No"}</span>
                <span className="sans" style={{ fontSize: "0.7rem", color: inv.confirmacion_3 ? "var(--gold)" : "var(--ink-light)" }}>{inv.confirmacion_3 ? `Sí ${fechaCorta(inv.confirmacion_3_fecha)}` : "No"}</span>
                <span className="sans" style={{ fontSize: "0.7rem", color: inv.asistio ? "var(--terracotta)" : "var(--ink-light)" }}>{inv.asistio ? "Sí" : "No"}</span>
              </div>
            ))}
            {filtered.length === 0 && <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Sin resultados.</p>}
          </div>
        ) : (
          /* Confirmados */
          <div>
            <p className="sans" style={{ fontSize: "0.68rem", color: "var(--ink-light)", marginBottom: "1rem" }}>{confirmadosFiltrados.length} personas con al menos una confirmación</p>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 0.6fr 0.6fr 0.6fr", gap: "0.5rem", padding: "0.4rem 0.8rem", marginBottom: "0.3rem" }}>
              {["Nombre", "Código", "1ra", "2da", "3ra"].map(h => (
                <span key={h} className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)" }}>{h}</span>
              ))}
            </div>
            {confirmadosFiltrados.map(inv => (
              <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 0.6fr 0.6fr 0.6fr", gap: "0.5rem", padding: "0.65rem 0.8rem", background: "var(--cream-mid)", border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.3rem", alignItems: "center" }}>
                <span className="serif" style={{ fontSize: "0.9rem", color: "var(--ink)" }}>{inv.nombre}</span>
                <span className="sans" style={{ fontSize: "0.65rem", color: "var(--terracotta)" }}>{inv.codigo}</span>
                <span className="sans" style={{ fontSize: "0.7rem", color: inv.confirmacion_1 ? "var(--olive)" : "var(--ink-light)" }}>{inv.confirmacion_1 ? `Sí ${fechaCorta(inv.confirmacion_1_fecha)}` : "—"}</span>
                <span className="sans" style={{ fontSize: "0.7rem", color: inv.confirmacion_2 ? "var(--periwinkle)" : "var(--ink-light)" }}>{inv.confirmacion_2 ? `Sí ${fechaCorta(inv.confirmacion_2_fecha)}` : "—"}</span>
                <span className="sans" style={{ fontSize: "0.7rem", color: inv.confirmacion_3 ? "var(--gold)" : "var(--ink-light)" }}>{inv.confirmacion_3 ? `Sí ${fechaCorta(inv.confirmacion_3_fecha)}` : "—"}</span>
              </div>
            ))}
            {confirmadosFiltrados.length === 0 && <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Nadie ha confirmado aún.</p>}
          </div>
        )}
      </main>

      {modalNueva && <ModalNuevaInvitación onClose={() => setModalNueva(false)} onCreated={r => setInvitacións(rs => [r, ...rs])} />}
      {modalAdd   && <ModalAgregarPersona invitación={modalAdd} onClose={() => setModalAdd(null)} onAdded={inv => { setInvitacións(rs => rs.map(r => r.id !== modalAdd.id ? r : { ...r, invitados: [...r.invitados, inv] })); }} />}
    </div>
  );
}