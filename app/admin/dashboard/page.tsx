"use client";
// ── app/admin/dashboard/page.tsx ──────────────────────────────────────────────
// Solo orquesta: estado global, handlers de API, filtrado/ordenación, layout.

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { type Invitacion, type SortKey, type SortDir, type TipoFiltro, type ConfFiltro, type FiltrosState } from "./types";
import { token, authHeaders, parseAdminToken } from "./helpers";
import { btnOutline } from "./styles";
import { StatCard }    from "./StatCard";
import { TabsNav }     from "./TabsNav";
import { TabInvitaciones } from "./TabInvitaciones";
import { TabLista }        from "./TabLista";
import { TabConfirmados }  from "./TabConfirmados";
import { TabUsuarios }     from "./TabUsuarios";
import { ModalNuevaInvitacion } from "./modals/ModalNuevaInvitacion";
import { ModalAgregarPersona }  from "./modals/ModalAgregarPersona";
import { ModalNuevoUsuario }    from "./modals/ModalNuevoUsuario";

export default function AdminDashboard() {
  const router = useRouter();

  // ── Data ────────────────────────────────────────────────────────────────────
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [loading, setLoading]           = useState(true);
  const [usuarios, setUsuarios]         = useState<{ id: string; username: string; nombre: string; created_at: string }[]>([]);
  const [rondaActual, setRondaActual]   = useState<1|2|3>(1);
  const [cambiandoRonda, setCambiandoRonda] = useState(false);

  // ── Auth info ────────────────────────────────────────────────────────────────
  const [nombreAdmin] = useState(() => {
    if (typeof window === "undefined") return "";
    const p = parseAdminToken();
    return p?.nombre ?? p?.username ?? "";
  });

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [tab, setTab]               = useState<"invitaciones" | "lista" | "confirmados" | "usuarios">("invitaciones");
  const [modalNueva, setModalNueva] = useState(false);
  const [modalAdd, setModalAdd]     = useState<Invitacion | null>(null);
  const [modalUsuario, setModalUsuario] = useState(false);

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const [search, setSearch]         = useState("");
  const [sortKey, setSortKey]       = useState<SortKey>("fecha");
  const [sortDir, setSortDir]       = useState<SortDir>("desc");
  const [tipo, setTipo]             = useState<TipoFiltro>("todos");
  const [confFiltro, setConfFiltro] = useState<ConfFiltro>("todos");
  const [creadoPor, setCreadoPor]   = useState("");

  // ── Fetch inicial ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("admin_token")) { router.push("/admin"); return; }
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/invitaciones", { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { router.push("/admin"); return; }
      setInvitaciones(await res.json());
      setLoading(false);
    };
    fetchData();
    fetch("/api/admin/config", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => { if (d.ronda) setRondaActual(d.ronda); });
  }, [router]);

  useEffect(() => {
    if (tab !== "usuarios") return;
    let activo = true;
    fetch("/api/admin/usuarios", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (activo && d) setUsuarios(d); });
    return () => { activo = false; };
  }, [tab]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  function logout() { localStorage.removeItem("admin_token"); router.push("/admin"); }

  async function cambiarRonda(r: 1|2|3) {
    setCambiandoRonda(true);
    await fetch("/api/admin/config", { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ ronda: r }) });
    setRondaActual(r);
    setCambiandoRonda(false);
  }

  async function updateInvitado(invitacionId: string, invId: string, field: string, val: boolean | null) {
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

  async function updateInvitadoTexto(invitacionId: string, invId: string, nombre: string, whatsapp: string, sexo: string | null = null) {
    const sexoVal = (sexo === "M" || sexo === "F" ? sexo : null) as "M" | "F" | null;
    await fetch(`/api/admin/invitados?id=${invId}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ nombre, whatsapp: whatsapp || null, sexo: sexoVal }) });
    setInvitaciones(rs => rs.map(r => r.id !== invitacionId ? r : {
      ...r, invitados: r.invitados.map(i => i.id !== invId ? i : { ...i, nombre, whatsapp: whatsapp || null, sexo: sexoVal }),
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

  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const all = invitaciones.flatMap(r => r.invitados);
    const fecha = new Date().toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" });

    const confirmados  = all.filter(i => i.confirmacion_1 === true || i.confirmacion_2 === true || i.confirmacion_3 === true);
    const declinados   = all.filter(i => i.confirmacion_1 === false && i.confirmacion_2 === false && i.confirmacion_3 === false && (i.confirmacion_1 !== null || i.confirmacion_2 !== null || i.confirmacion_3 !== null));
    const sinResponder = all.filter(i => i.confirmacion_1 === null && i.confirmacion_2 === null && i.confirmacion_3 === null);

    const triStr = (v: boolean | null) => v === true ? "✓" : v === false ? "✗" : "—";

    // ── Título ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(44, 35, 32);
    doc.text("Carla & Hely — Reporte de invitados", 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(154, 136, 128);
    doc.text(`Generado el ${fecha}`, 14, 25);

    // ── Estadísticas ──
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 35, 32);
    doc.text("Estadísticas", 14, 36);

    autoTable(doc, {
      startY: 40,
      head: [["Métrica", "Total"]],
      body: [
        ["Total invitaciones", String(invitaciones.length)],
        ["Total invitados", String(all.length)],
        ["Confirmados (al menos 1 ronda)", String(confirmados.length)],
        ["Declinados", String(declinados.length)],
        ["Sin respuesta", String(sinResponder.length)],
        ["Confirmaron R1", String(all.filter(i => i.confirmacion_1 === true).length)],
        ["Confirmaron R2", String(all.filter(i => i.confirmacion_2 === true).length)],
        ["Confirmaron R3", String(all.filter(i => i.confirmacion_3 === true).length)],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [201, 79, 79], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "center", fontStyle: "bold" } },
      margin: { left: 14, right: 14 },
    });

    // ── Confirmados ──
    let y = (doc as any).lastAutoTable.finalY + 12;
    if (y > 260) { doc.addPage(); y = 14; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 35, 32);
    doc.text(`Confirmados (${confirmados.length})`, 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Nombre", "Código", "R1", "R2", "R3"]],
      body: confirmados.map(i => {
        const inv = invitaciones.find(r => r.invitados.some(x => x.id === i.id));
        return [i.nombre, inv?.codigo ?? "", triStr(i.confirmacion_1), triStr(i.confirmacion_2), triStr(i.confirmacion_3)];
      }),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [122, 148, 56], textColor: 255, fontStyle: "bold" },
      columnStyles: { 2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "center" } },
      margin: { left: 14, right: 14 },
    });

    // ── Declinados ──
    y = (doc as any).lastAutoTable.finalY + 12;
    if (y > 260) { doc.addPage(); y = 14; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 35, 32);
    doc.text(`Declinados (${declinados.length})`, 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Nombre", "Código", "R1", "R2", "R3"]],
      body: declinados.map(i => {
        const inv = invitaciones.find(r => r.invitados.some(x => x.id === i.id));
        return [i.nombre, inv?.codigo ?? "", triStr(i.confirmacion_1), triStr(i.confirmacion_2), triStr(i.confirmacion_3)];
      }),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [201, 79, 79], textColor: 255, fontStyle: "bold" },
      columnStyles: { 2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "center" } },
      margin: { left: 14, right: 14 },
    });

    // ── Sin respuesta ──
    y = (doc as any).lastAutoTable.finalY + 12;
    if (y > 260) { doc.addPage(); y = 14; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 35, 32);
    doc.text(`Sin respuesta (${sinResponder.length})`, 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [["Nombre", "Código"]],
      body: sinResponder.map(i => {
        const inv = invitaciones.find(r => r.invitados.some(x => x.id === i.id));
        return [i.nombre, inv?.codigo ?? ""];
      }),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [154, 136, 128], textColor: 255, fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });

    doc.save(`reporte-carlayhely-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function cargarUsuarios() {
    fetch("/api/admin/usuarios", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUsuarios(d); });
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const allInv     = invitaciones.flatMap(r => r.invitados);
  const totalInv   = allInv.length;
  const totalRes   = invitaciones.length;
  const conf1      = allInv.filter(i => i.confirmacion_1).length;
  const conf2      = allInv.filter(i => i.confirmacion_2).length;
  const conf3      = allInv.filter(i => i.confirmacion_3).length;
  const asistieron = allInv.filter(i => i.asistio).length;

  const creadores = useMemo(() =>
    [...new Set(invitaciones.map(r => r.creado_por).filter(Boolean) as string[])].sort()
  , [invitaciones]);

  // ── Filtrado y ordenación ──────────────────────────────────────────────────
  const invitacionesFiltradas = useMemo(() => {
    let r = invitaciones;
    if (search)               r = r.filter(inv => inv.codigo.includes(search) || (inv.nombre ?? "").toLowerCase().includes(search.toLowerCase()) || inv.invitados.some(i => i.nombre.toLowerCase().includes(search.toLowerCase())));
    if (tipo === "grupo")     r = r.filter(inv => inv.invitados.length > 1);
    if (tipo === "individual")r = r.filter(inv => inv.invitados.length === 1);
    if (creadoPor)            r = r.filter(inv => inv.creado_por === creadoPor);
    if (confFiltro === "conf1")   r = r.filter(inv => inv.invitados.some(i => i.confirmacion_1));
    if (confFiltro === "conf2")   r = r.filter(inv => inv.invitados.some(i => i.confirmacion_2));
    if (confFiltro === "conf3")   r = r.filter(inv => inv.invitados.some(i => i.confirmacion_3));
    if (confFiltro === "ninguna") r = r.filter(inv => inv.invitados.every(i => !i.confirmacion_1 && !i.confirmacion_2 && !i.confirmacion_3));
    return [...r].sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0;
      if (sortKey === "nombre")      { va = (a.nombre ?? a.invitados[0]?.nombre ?? "").toLowerCase(); vb = (b.nombre ?? b.invitados[0]?.nombre ?? "").toLowerCase(); }
      if (sortKey === "codigo")      { va = a.codigo; vb = b.codigo; }
      if (sortKey === "creado_por")  { va = (a.creado_por ?? "").toLowerCase(); vb = (b.creado_por ?? "").toLowerCase(); }
      if (sortKey === "cantidad")    { va = a.invitados.length; vb = b.invitados.length; }
      if (sortKey === "fecha")       { va = a.created_at; vb = b.created_at; }
      if (sortKey === "confirmados") { va = a.invitados.filter(i => i.confirmacion_1 || i.confirmacion_2 || i.confirmacion_3).length; vb = b.invitados.filter(i => i.confirmacion_1 || i.confirmacion_2 || i.confirmacion_3).length; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [invitaciones, search, sortKey, sortDir, tipo, confFiltro, creadoPor]);

  const allInvFlat = useMemo(() => {
    let lista = invitaciones.flatMap(r => r.invitados.map(i => ({ ...i, codigo: r.codigo, creado_por: r.creado_por, esGrupo: r.invitados.length > 1 })));
    if (search)               lista = lista.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()) || i.codigo.includes(search));
    if (tipo === "grupo")     lista = lista.filter(i => i.esGrupo);
    if (tipo === "individual")lista = lista.filter(i => !i.esGrupo);
    if (creadoPor)            lista = lista.filter(i => i.creado_por === creadoPor);
    if (confFiltro === "conf1")   lista = lista.filter(i => i.confirmacion_1);
    if (confFiltro === "conf2")   lista = lista.filter(i => i.confirmacion_2);
    if (confFiltro === "conf3")   lista = lista.filter(i => i.confirmacion_3);
    if (confFiltro === "ninguna") lista = lista.filter(i => !i.confirmacion_1 && !i.confirmacion_2 && !i.confirmacion_3);
    return [...lista].sort((a, b) => {
      let va: string | number = 0, vb: string | number = 0;
      if (sortKey === "nombre")     { va = a.nombre.toLowerCase(); vb = b.nombre.toLowerCase(); }
      if (sortKey === "codigo")     { va = a.codigo; vb = b.codigo; }
      if (sortKey === "creado_por") { va = (a.creado_por ?? "").toLowerCase(); vb = (b.creado_por ?? "").toLowerCase(); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [invitaciones, search, sortKey, sortDir, tipo, confFiltro, creadoPor]);

  const confirmadosFiltrados = useMemo(() =>
    allInvFlat.filter(i => i.confirmacion_1 || i.confirmacion_2 || i.confirmacion_3)
  , [allInvFlat]);

  const filtros: FiltrosState = { search, setSearch, sortKey, setSortKey, sortDir, setSortDir, tipo, setTipo, confFiltro, setConfFiltro, creadores, creadoPor, setCreadoPor };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100svh", background: "var(--cream)" }}>

      {/* Header */}
      <header style={{ background: "var(--cream-mid)", borderBottom: "1px solid var(--border-subtle)", padding: "0.8rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, gap: "0.8rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <h1 className="script" style={{ fontSize: "2rem", color: "var(--ink)", lineHeight: 1 }}>C &amp; H</h1>
          <p className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--terracotta)" }}>Admin</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
          {/* Selector de ronda */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "var(--cream)", border: "1px solid var(--border-subtle)", borderRadius: "2px", padding: "0.3rem 0.5rem" }}>
            <span className="sans" style={{ fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-light)", whiteSpace: "nowrap" }}>Ronda</span>
            {([1,2,3] as (1|2|3)[]).map(r => (
              <button key={r} onClick={() => !cambiandoRonda && cambiarRonda(r)} style={{
                width: "28px", height: "28px",
                background: rondaActual === r ? "var(--terracotta)" : "transparent",
                color: rondaActual === r ? "var(--cream)" : "var(--ink-light)",
                border: `1px solid ${rondaActual === r ? "var(--terracotta)" : "var(--border-subtle)"}`,
                borderRadius: "2px", fontFamily: "'Montserrat',sans-serif",
                fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s", opacity: cambiandoRonda ? 0.6 : 1,
              }}>{r}</button>
            ))}
          </div>
          <button onClick={exportPDF} style={{ ...btnOutline, fontSize: "0.7rem", padding: "0.55rem 1rem" }}>PDF</button>
          <button
            onClick={() => {
              const url = typeof window !== "undefined" ? window.location.origin : "";
              navigator.clipboard.writeText(url);
            }}
            title="Copiar link de la página"
            style={{ ...btnOutline, fontSize: "0.7rem", padding: "0.55rem 1rem" }}
          >🔗 Página</button>
          <button onClick={logout} style={{ ...btnOutline, borderColor: "var(--ink-light)", color: "var(--ink-light)", fontSize: "0.7rem", padding: "0.55rem 1rem" }}>Salir</button>
        </div>
      </header>

      <main style={{ padding: "1.2rem 1rem", maxWidth: "960px", margin: "0 auto" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <StatCard value={totalRes}   label="Invit."     color="var(--terracotta)" />
          <StatCard value={totalInv}   label="Invitados"  color="var(--ink)" />
          <StatCard value={conf1}      label="1ra conf"   color="var(--olive)" />
          <StatCard value={conf2}      label="2da conf"   color="var(--periwinkle)" />
          <StatCard value={conf3}      label="3ra conf"   color="var(--gold)" />
          <StatCard value={asistieron} label="Asistieron" color="var(--red)" />
        </div>

        <TabsNav tab={tab} setTab={setTab} />

        {loading ? (
          <p className="sans" style={{ textAlign: "center", color: "var(--ink-light)", padding: "3rem 0", fontSize: "0.8rem" }}>Cargando...</p>
        ) : tab === "invitaciones" ? (
          <TabInvitaciones
            invitaciones={invitacionesFiltradas} filtros={filtros}
            rondaActual={rondaActual}
            onNueva={() => setModalNueva(true)}
            onUpdateInv={updateInvitado} onUpdateTexto={updateInvitadoTexto}
            onUpdateNombreGrupo={updateNombreGrupo}
            onDeleteInv={deleteInvitado} onDeleteInvitacion={deleteInvitacion}
            onAddPersona={setModalAdd}
          />
        ) : tab === "lista" ? (
          <TabLista lista={allInvFlat} filtros={filtros} />
        ) : tab === "confirmados" ? (
          <TabConfirmados lista={confirmadosFiltrados} filtros={filtros} />
        ) : (
          <TabUsuarios usuarios={usuarios} onNuevo={() => setModalUsuario(true)} />
        )}
      </main>

      {/* Modales */}
      {modalNueva   && <ModalNuevaInvitacion onClose={() => setModalNueva(false)} onCreated={r => setInvitaciones(rs => [r, ...rs])} nombreAdmin={nombreAdmin} />}
      {modalAdd     && <ModalAgregarPersona  invitacion={modalAdd} onClose={() => setModalAdd(null)} onAdded={inv => { setInvitaciones(rs => rs.map(r => r.id !== modalAdd.id ? r : { ...r, invitados: [...r.invitados, inv] })); }} />}
      {modalUsuario && <ModalNuevoUsuario    onClose={() => setModalUsuario(false)} onCreated={cargarUsuarios} />}
    </div>
  );
}