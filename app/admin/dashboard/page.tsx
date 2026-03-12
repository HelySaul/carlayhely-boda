"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────
interface Invitado {
  id: string;
  nombre: string;
  confirmado: boolean;
  asistio: boolean;
  whatsapp: string | null;
}
interface Grupo {
  id: string;
  codigo: string;
  nombre: string;
  created_at: string;
  invitados: Invitado[];
}

// ── Helpers ────────────────────────────────────────────
function token() { return localStorage.getItem("admin_token") ?? ""; }
function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token()}` };
}

// ── Subcomponents ──────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "0.2rem 0.6rem",
      background: color + "22", color, borderRadius: "2px",
      fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase",
      fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
    }}>{label}</span>
  );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{
      padding: "1.2rem 1.5rem", background: "var(--cream-mid)",
      border: "1px solid var(--border-subtle)", borderTop: `3px solid ${color}`,
      borderRadius: "2px", textAlign: "center",
    }}>
      <p style={{ fontSize: "2rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color, lineHeight: 1 }}>{value}</p>
      <p className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)", marginTop: "0.4rem" }}>{label}</p>
    </div>
  );
}

// ── Modal nuevo grupo ──────────────────────────────────
function ModalNuevoGrupo({ onClose, onCreated }: { onClose: () => void; onCreated: (g: Grupo) => void }) {
  const [nombre, setNombre]   = useState("");
  const [codigo, setCodigo]   = useState("");
  const [invitados, setInvitados] = useState([{ nombre: "", whatsapp: "" }]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  function addInvitado() { setInvitados(i => [...i, { nombre: "", whatsapp: "" }]); }
  function removeInvitado(idx: number) { setInvitados(i => i.filter((_, j) => j !== idx)); }
  function updateInvitado(idx: number, field: string, val: string) {
    setInvitados(i => i.map((inv, j) => j === idx ? { ...inv, [field]: val } : inv));
  }

  async function handleCreate() {
    if (!nombre.trim() || !codigo.trim()) { setError("Nombre y código son requeridos"); return; }
    const validInvitados = invitados.filter(i => i.nombre.trim());
    setLoading(true); setError("");

    const res = await fetch("/api/admin/grupos", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ nombre: nombre.trim(), codigo: codigo.trim(), invitados: validInvitados }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onCreated(data);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "2rem", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 className="serif" style={{ fontSize: "1.4rem", color: "var(--ink)", marginBottom: "1.5rem" }}>Nuevo Grupo</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            <div>
              <label style={labelStyle}>Nombre del grupo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Familia García" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Código de acceso</label>
              <input value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} placeholder="FAM001" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Invitados del grupo</label>
            {invitados.map((inv, idx) => (
              <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                <input value={inv.nombre} onChange={e => updateInvitado(idx, "nombre", e.target.value)} placeholder="Nombre completo" style={{ ...inputStyle, flex: 2 }} />
                <input value={inv.whatsapp} onChange={e => updateInvitado(idx, "whatsapp", e.target.value)} placeholder="WhatsApp (opcional)" style={{ ...inputStyle, flex: 1 }} />
                {invitados.length > 1 && (
                  <button onClick={() => removeInvitado(idx)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "1.1rem", padding: "0 0.3rem" }}>×</button>
                )}
              </div>
            ))}
            <button onClick={addInvitado} style={{ ...btnOutlineStyle, marginTop: "0.3rem", fontSize: "0.65rem" }}>+ Agregar invitado</button>
          </div>

          {error && <p style={{ color: "var(--red)", fontSize: "0.75rem" }}>{error}</p>}

          <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button onClick={onClose} style={btnOutlineStyle}>Cancelar</button>
            <button onClick={handleCreate} disabled={loading} style={btnPrimaryStyle}>
              {loading ? "Creando..." : "Crear grupo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal agregar invitado a grupo existente ───────────
function ModalAgregarInvitado({ grupo, onClose, onAdded }: { grupo: Grupo; onClose: () => void; onAdded: (inv: Invitado) => void }) {
  const [nombre, setNombre]     = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleAdd() {
    if (!nombre.trim()) { setError("Nombre requerido"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/admin/invitados", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ grupo_id: grupo.id, nombre: nombre.trim(), whatsapp: whatsapp.trim() || null }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onAdded(data);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "2rem", width: "100%", maxWidth: "360px" }}>
        <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--ink)", marginBottom: "0.4rem" }}>Agregar invitado</h3>
        <p className="sans" style={{ fontSize: "0.7rem", color: "var(--ink-light)", marginBottom: "1.5rem" }}>Grupo: <strong>{grupo.nombre}</strong> · {grupo.codigo}</p>
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
            <button onClick={onClose} style={btnOutlineStyle}>Cancelar</button>
            <button onClick={handleAdd} disabled={loading} style={btnPrimaryStyle}>
              {loading ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fila de invitado ───────────────────────────────────
function FilaInvitado({ inv, onUpdate, onDelete }: {
  inv: Invitado;
  onUpdate: (id: string, field: string, val: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.8rem",
      padding: "0.6rem 0.8rem", background: "var(--cream)",
      border: "1px solid var(--border-subtle)", borderRadius: "2px",
      marginBottom: "0.4rem",
    }}>
      <span className="serif" style={{ flex: 1, fontSize: "0.9rem", color: "var(--ink)" }}>{inv.nombre}</span>
      {inv.whatsapp && (
        <span className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)" }}>{inv.whatsapp}</span>
      )}
      <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
        <input type="checkbox" checked={inv.confirmado} onChange={e => onUpdate(inv.id, "confirmado", e.target.checked)} style={{ accentColor: "var(--olive)" }} />
        <span className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--olive)" }}>Confirmó</span>
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
        <input type="checkbox" checked={inv.asistio} onChange={e => onUpdate(inv.id, "asistio", e.target.checked)} style={{ accentColor: "var(--terracotta)" }} />
        <span className="sans" style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--terracotta)" }}>Asistió</span>
      </label>
      <button onClick={() => onDelete(inv.id)} style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "0.9rem", padding: "0 0.2rem", lineHeight: 1 }} title="Eliminar">×</button>
    </div>
  );
}

// ── Tarjeta de grupo ───────────────────────────────────
function TarjetaGrupo({ grupo, onUpdateInv, onDeleteInv, onDeleteGrupo, onAddInv }: {
  grupo: Grupo;
  onUpdateInv: (grupoId: string, invId: string, field: string, val: boolean) => void;
  onDeleteInv: (grupoId: string, invId: string) => void;
  onDeleteGrupo: (id: string) => void;
  onAddInv: (grupo: Grupo) => void;
}) {
  const [open, setOpen] = useState(false);
  const confirmados = grupo.invitados.filter(i => i.confirmado).length;
  const asistieron  = grupo.invitados.filter(i => i.asistio).length;
  const total       = grupo.invitados.length;

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.8rem", background: "var(--cream-mid)" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "1rem 1.2rem", cursor: "pointer" }}
      >
        <div style={{ flex: 1 }}>
          <span className="serif" style={{ fontSize: "1rem", color: "var(--ink)", fontWeight: 400 }}>{grupo.nombre}</span>
          <span className="sans" style={{ marginLeft: "0.8rem", fontSize: "0.62rem", letterSpacing: "0.15em", color: "var(--terracotta)", background: "rgba(212,105,58,0.1)", padding: "0.15rem 0.5rem", borderRadius: "2px" }}>{grupo.codigo}</span>
        </div>
        <span className="sans" style={{ fontSize: "0.65rem", color: "var(--ink-light)" }}>{confirmados}/{total} conf · {asistieron} asist</span>
        <span style={{ color: "var(--ink-light)", fontSize: "0.7rem" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "0 1.2rem 1.2rem" }}>
          {grupo.invitados.length === 0 ? (
            <p className="sans" style={{ fontSize: "0.75rem", color: "var(--ink-light)", fontStyle: "italic", marginBottom: "0.8rem" }}>Sin invitados aún.</p>
          ) : (
            grupo.invitados.map(inv => (
              <FilaInvitado
                key={inv.id} inv={inv}
                onUpdate={(id, field, val) => onUpdateInv(grupo.id, id, field, val)}
                onDelete={(id) => onDeleteInv(grupo.id, id)}
              />
            ))
          )}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.6rem" }}>
            <button onClick={() => onAddInv(grupo)} style={btnOutlineStyle}>+ Invitado</button>
            <button onClick={() => { if (confirm(`¿Eliminar el grupo "${grupo.nombre}"?`)) onDeleteGrupo(grupo.id); }} style={{ ...btnOutlineStyle, color: "var(--red)", borderColor: "var(--red)" }}>Eliminar grupo</button>
          </div>
        </div>
      )}
    </div>
  );
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
const btnPrimaryStyle: React.CSSProperties = {
  padding: "0.65rem 1.4rem", background: "var(--terracotta)", color: "var(--cream)",
  border: "none", borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
  fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer",
};
const btnOutlineStyle: React.CSSProperties = {
  padding: "0.6rem 1.2rem", background: "transparent", color: "var(--terracotta)",
  border: "1px solid var(--terracotta)", borderRadius: "2px",
  fontFamily: "'Montserrat', sans-serif", fontSize: "0.65rem",
  letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer",
};

// ── Dashboard principal ────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [grupos, setGrupos]         = useState<Grupo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalAddInv, setModalAddInv] = useState<Grupo | null>(null);
  const [tab, setTab]               = useState<"grupos" | "lista">("grupos");

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      router.push("/admin");
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/grupos", { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { router.push("/admin"); return; }
      const data = await res.json();
      setGrupos(data);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  function logout() { localStorage.removeItem("admin_token"); router.push("/admin"); }

  async function updateInvitado(grupoId: string, invId: string, field: string, val: boolean) {
    await fetch(`/api/admin/invitados?id=${invId}`, {
      method: "PATCH", headers: authHeaders(),
      body: JSON.stringify({ [field]: val }),
    });
    setGrupos(gs => gs.map(g => g.id !== grupoId ? g : {
      ...g, invitados: g.invitados.map(i => i.id !== invId ? i : { ...i, [field]: val }),
    }));
  }

  async function deleteInvitado(grupoId: string, invId: string) {
    if (!confirm("¿Eliminar este invitado?")) return;
    await fetch(`/api/admin/invitados?id=${invId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    setGrupos(gs => gs.map(g => g.id !== grupoId ? g : {
      ...g, invitados: g.invitados.filter(i => i.id !== invId),
    }));
  }

  async function deleteGrupo(id: string) {
    await fetch(`/api/admin/grupos?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
    setGrupos(gs => gs.filter(g => g.id !== id));
  }

  function handleCreated(g: Grupo) { setGrupos(gs => [g, ...gs]); }
  function handleAddedInv(inv: Invitado) {
    setGrupos(gs => gs.map(g => g.id !== modalAddInv?.id ? g : { ...g, invitados: [...g.invitados, inv] }));
  }

  function exportCSV() {
    window.open(`/api/admin/export?token=${token()}`, "_blank");
    // Fallback with auth header via fetch
    fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `invitados-carlayhely-${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
      });
  }

  // Stats
  const totalGrupos     = grupos.length;
  const totalInvitados  = grupos.reduce((s, g) => s + g.invitados.length, 0);
  const totalConfirmados = grupos.reduce((s, g) => s + g.invitados.filter(i => i.confirmado).length, 0);
  const totalAsistieron = grupos.reduce((s, g) => s + g.invitados.filter(i => i.asistio).length, 0);

  // Filtro de búsqueda
  const filtered = grupos.filter(g =>
    g.nombre.toLowerCase().includes(search.toLowerCase()) ||
    g.codigo.toLowerCase().includes(search.toLowerCase()) ||
    g.invitados.some(i => i.nombre.toLowerCase().includes(search.toLowerCase()))
  );

  // Lista plana de todos los invitados
  const allInvitados = grupos.flatMap(g => g.invitados.map(i => ({ ...i, grupoNombre: g.nombre, grupoCodigo: g.codigo })));
  const filteredInv  = allInvitados.filter(i =>
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    i.grupoNombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg-hero)", padding: "0" }}>
      {/* Header */}
      <header style={{
        background: "var(--cream-mid)", borderBottom: "1px solid var(--border-subtle)",
        padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h1 className="script" style={{ fontSize: "2.2rem", color: "var(--ink)", lineHeight: 1 }}>C &amp; H</h1>
          <p className="sans" style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--terracotta)" }}>Admin</p>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <button onClick={exportCSV} style={btnOutlineStyle}>Exportar CSV</button>
          <button onClick={logout} style={{ ...btnOutlineStyle, borderColor: "var(--ink-light)", color: "var(--ink-light)" }}>Salir</button>
        </div>
      </header>

      <main style={{ padding: "2rem 1.5rem", maxWidth: "900px", margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.8rem", marginBottom: "2rem" }}>
          <StatCard value={totalGrupos}      label="Grupos"      color="var(--terracotta)" />
          <StatCard value={totalInvitados}   label="Invitados"   color="var(--ink)" />
          <StatCard value={totalConfirmados} label="Confirmados" color="var(--olive)" />
          <StatCard value={totalAsistieron}  label="Asistieron"  color="var(--gold)" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
          {(["grupos", "lista"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "0.7rem 1.5rem", background: "none", border: "none",
              borderBottom: tab === t ? "2px solid var(--terracotta)" : "2px solid transparent",
              color: tab === t ? "var(--terracotta)" : "var(--ink-light)",
              fontFamily: "'Montserrat', sans-serif", fontSize: "0.65rem",
              letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer",
              marginBottom: "-1px",
            }}>
              {t === "grupos" ? "Grupos" : "Lista de invitados"}
            </button>
          ))}
        </div>

        {/* Búsqueda + agregar */}
        <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1.5rem" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código..."
            style={{ ...inputStyle, flex: 1 }}
          />
          {tab === "grupos" && (
            <button onClick={() => setModalNuevo(true)} style={btnPrimaryStyle}>+ Nuevo grupo</button>
          )}
        </div>

        {/* Contenido */}
        {loading ? (
          <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", fontSize: "0.8rem", padding: "3rem 0" }}>Cargando...</p>
        ) : tab === "grupos" ? (
          filtered.length === 0 ? (
            <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", fontSize: "0.8rem", padding: "3rem 0" }}>
              {search ? "Sin resultados." : "Aún no hay grupos. Crea el primero."}
            </p>
          ) : (
            filtered.map(g => (
              <TarjetaGrupo
                key={g.id} grupo={g}
                onUpdateInv={updateInvitado}
                onDeleteInv={deleteInvitado}
                onDeleteGrupo={deleteGrupo}
                onAddInv={setModalAddInv}
              />
            ))
          )
        ) : (
          /* Lista plana */
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 0.8fr", gap: "0.5rem", padding: "0.5rem 0.8rem", marginBottom: "0.3rem" }}>
              {["Invitado", "Grupo", "Código", "Confirmó", "Asistió"].map(h => (
                <span key={h} className="sans" style={{ fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)" }}>{h}</span>
              ))}
            </div>
            {filteredInv.map(inv => (
              <div key={inv.id} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 0.8fr", gap: "0.5rem",
                padding: "0.7rem 0.8rem", background: "var(--cream-mid)",
                border: "1px solid var(--border-subtle)", borderRadius: "2px", marginBottom: "0.3rem",
                alignItems: "center",
              }}>
                <span className="serif" style={{ fontSize: "0.9rem", color: "var(--ink)" }}>{inv.nombre}</span>
                <span className="sans" style={{ fontSize: "0.72rem", color: "var(--ink-mid)" }}>{inv.grupoNombre}</span>
                <span className="sans" style={{ fontSize: "0.65rem", color: "var(--terracotta)" }}>{inv.grupoCodigo}</span>
                <Badge label={inv.confirmado ? "Sí" : "No"} color={inv.confirmado ? "var(--olive)" : "var(--ink-light)"} />
                <Badge label={inv.asistio ? "Sí" : "No"}    color={inv.asistio    ? "var(--gold)"  : "var(--ink-light)"} />
              </div>
            ))}
            {filteredInv.length === 0 && (
              <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", fontSize: "0.8rem", padding: "3rem 0" }}>Sin resultados.</p>
            )}
          </div>
        )}
      </main>

      {/* Modales */}
      {modalNuevo   && <ModalNuevoGrupo onClose={() => setModalNuevo(false)} onCreated={handleCreated} />}
      {modalAddInv  && <ModalAgregarInvitado grupo={modalAddInv} onClose={() => setModalAddInv(null)} onAdded={handleAddedInv} />}
    </div>
  );
}