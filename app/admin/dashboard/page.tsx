"use client";
// ── app/admin/dashboard/page.tsx ──────────────────────────────────────────────
// Solo orquesta: estado global, handlers de API, filtrado/ordenación, layout.

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { type Invitacion, type SortKey, type SortDir, type TipoFiltro, type ConfFiltro, type FiltrosState } from "./types";
import { token, authHeaders, parseAdminToken, usePermisos } from "./helpers";
import { btnOutline } from "./styles";
import { StatCard }    from "./StatCard";
import { TabsNav }     from "./TabsNav";
import { TabInvitaciones } from "./TabInvitaciones";
import { TabLista }        from "./TabLista";
import { TabConfirmados }  from "./TabConfirmados";
import { TabUsuarios }     from "./TabUsuarios";
import { TabMesas, type Mesa }        from "./TabMesas";
import { ModalNuevaInvitacion } from "./modals/ModalNuevaInvitacion";
import { ModalAgregarPersona }  from "./modals/ModalAgregarPersona";
import { ModalNuevoUsuario }    from "./modals/ModalNuevoUsuario";

export default function AdminDashboard() {
  const router = useRouter();

  // ── Data ────────────────────────────────────────────────────────────────────
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [mesas, setMesas]               = useState<Mesa[]>([]);
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
  const permisos = usePermisos();
  const [tab, setTab] = useState<"invitaciones" | "lista" | "confirmados" | "mesas" | "usuarios">("invitaciones");
  const [toastVisible, setToastVisible] = useState(false);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function mostrarToast() {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToastVisible(true);
    toastRef.current = setTimeout(() => setToastVisible(false), 2000);
  }
  const [modalNueva, setModalNueva] = useState(false);
  const [modalAdd, setModalAdd]     = useState<Invitacion | null>(null);
  const [modalUsuario, setModalUsuario] = useState(false);

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const [search, setSearch]         = useState("");
  const [sortKey, setSortKey]       = useState<SortKey>("fecha");
  const [sortDir, setSortDir]       = useState<SortDir>("asc");
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
    cargarMesas();
  }, [router]);

  function cargarMesas() {
    fetch("/api/admin/mesas", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setMesas(d));
  }

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
    const fecha = new Date().toLocaleDateString("es-VE", { day: "2-digit", month: "long", year: "numeric" });
    const triStr = (v: boolean | null) => v === true ? "✓" : v === false ? "✗" : "—";

    // Agrupar invitados por invitación, en el orden original
    const confirmadosRows: string[][] = [];
    const sinResponderRows: string[][] = [];
    const declinadosRows: string[][] = [];

    invitaciones.forEach(inv => {
      inv.invitados.forEach((i, idx) => {
        const grupo = idx === 0 ? (inv.nombre ?? inv.codigo) : "";
        const r1 = triStr(i.confirmacion_1);
        const r2 = triStr(i.confirmacion_2);
        const r3 = triStr(i.confirmacion_3);
        const row = [grupo, i.nombre, r1, r2, r3];

        const confirmado = i.confirmacion_1 === true || i.confirmacion_2 === true || i.confirmacion_3 === true;
        const declinado  = !confirmado && (i.confirmacion_1 === false || i.confirmacion_2 === false || i.confirmacion_3 === false);
        const sinResp    = i.confirmacion_1 === null && i.confirmacion_2 === null && i.confirmacion_3 === null;

        if (confirmado)   confirmadosRows.push(row);
        else if (declinado) declinadosRows.push(row);
        else if (sinResp) sinResponderRows.push([grupo, i.nombre]);
      });
    });

    const all = invitaciones.flatMap(r => r.invitados);
    const colStyles = { 0: { cellWidth: 38, fontStyle: "bold" as const, fontSize: 7 }, 1: { cellWidth: 60, fontSize: 7 }, 2: { cellWidth: 12, halign: "center" as const, fontSize: 7 }, 3: { cellWidth: 12, halign: "center" as const, fontSize: 7 }, 4: { cellWidth: 12, halign: "center" as const, fontSize: 7 } };
    const tableStyles = { fontSize: 7, cellPadding: 1.4, minCellHeight: 5 };

    // ── Título ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(44, 35, 32);
    doc.text("Carla & Hely — Reporte de invitados", 14, 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(154, 136, 128);
    doc.text(`Generado el ${fecha}`, 14, 22);

    let y = 28;

    // ── 1. Confirmados ──
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(44, 35, 32);
    doc.text(`1. Confirmados (${confirmadosRows.length})`, 14, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Grupo", "Nombre", "R1", "R2", "R3"]],
      body: confirmadosRows,
      styles: tableStyles,
      headStyles: { fillColor: [122, 148, 56], textColor: 255, fontStyle: "bold", fontSize: 7, cellPadding: 1.8 },
      columnStyles: colStyles,
      margin: { left: 14, right: 14 },
    });

    // ── 2. Sin respuesta ──
    y = (doc as any).lastAutoTable.finalY + 8;
    if (y > 265) { doc.addPage(); y = 14; }
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(44, 35, 32);
    doc.text(`2. Sin respuesta (${sinResponderRows.length})`, 14, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Grupo", "Nombre"]],
      body: sinResponderRows,
      styles: tableStyles,
      headStyles: { fillColor: [154, 136, 128], textColor: 255, fontStyle: "bold", fontSize: 7, cellPadding: 1.8 },
      columnStyles: { 0: { cellWidth: 50, fontStyle: "bold" as const, fontSize: 7 }, 1: { cellWidth: 80, fontSize: 7 } },
      margin: { left: 14, right: 14 },
    });

    // ── 3. Declinados ──
    y = (doc as any).lastAutoTable.finalY + 8;
    if (y > 265) { doc.addPage(); y = 14; }
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(44, 35, 32);
    doc.text(`3. Declinados (${declinadosRows.length})`, 14, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Grupo", "Nombre", "R1", "R2", "R3"]],
      body: declinadosRows,
      styles: tableStyles,
      headStyles: { fillColor: [201, 79, 79], textColor: 255, fontStyle: "bold", fontSize: 7, cellPadding: 1.8 },
      columnStyles: colStyles,
      margin: { left: 14, right: 14 },
    });

    // ── 4. Estadísticas ──
    y = (doc as any).lastAutoTable.finalY + 8;
    if (y > 240) { doc.addPage(); y = 14; }
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(44, 35, 32);
    doc.text("4. Estadísticas", 14, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Métrica", "Total"]],
      body: [
        ["Total invitaciones",             String(invitaciones.length)],
        ["Total invitados",                String(all.length)],
        ["Confirmados (≥1 ronda)",         String(confirmadosRows.length)],
        ["Sin respuesta",                  String(sinResponderRows.length)],
        ["Declinados",                     String(declinadosRows.length)],
        ["Confirmaron R1",                 String(all.filter(i => i.confirmacion_1 === true).length)],
        ["Confirmaron R2",                 String(all.filter(i => i.confirmacion_2 === true).length)],
        ["Confirmaron R3",                 String(all.filter(i => i.confirmacion_3 === true).length)],
      ],
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [212, 168, 50], textColor: 255, fontStyle: "bold" },
      columnStyles: { 1: { halign: "center", fontStyle: "bold" } },
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

      {/* Toast global */}
      <div style={{
        position: "fixed", bottom: "1.8rem", left: "50%",
        transform: `translateX(-50%) translateY(${toastVisible ? "0" : "12px"})`,
        opacity: toastVisible ? 1 : 0,
        transition: "opacity 0.22s ease, transform 0.22s ease",
        pointerEvents: "none", zIndex: 999,
        background: "var(--ink)", color: "var(--cream)",
        padding: "0.5rem 1.1rem", borderRadius: "20px",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "0.65rem", letterSpacing: "0.08em",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        whiteSpace: "nowrap",
      }}>
        Link copiado
      </div>

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
              mostrarToast();
            }}
            id="btn-pagina"
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
        ) : tab === "mesas" ? (
          <TabMesas
            mesas={mesas}
            invitaciones={invitaciones.map(i => ({ id: i.id, codigo: i.codigo, nombre: i.nombre ?? null, invitados: i.invitados.map(x => ({ id: x.id, nombre: x.nombre })), mesa_id: (i as any).mesa_id ?? null }))}
            onRefresh={cargarMesas}
            puedeEditar={permisos.puedeEditarInvitados}
          />
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