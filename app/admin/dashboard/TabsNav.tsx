// ── TabsNav.tsx ───────────────────────────────────────────────────────────────

type Tab = "invitaciones" | "lista" | "confirmados" | "mesas" | "usuarios";

const TABS: { key: Tab; label: string }[] = [
  { key: "invitaciones", label: "Invitaciones" },
  { key: "lista",        label: "Todos" },
  { key: "confirmados",  label: "Confirmados" },
  { key: "mesas",        label: "Mesas" },
  { key: "usuarios",     label: "Usuarios" },
];

export function TabsNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="tabs-scroll" style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", marginBottom: "1.2rem", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}>
      {TABS.map(({ key, label }) => (
        <button key={key} onClick={() => setTab(key)} style={{
          padding: "0.75rem 1.2rem", background: "none", border: "none",
          borderBottom: tab === key ? "2px solid var(--terracotta)" : "2px solid transparent",
          color: tab === key ? "var(--terracotta)" : "var(--ink-light)",
          fontFamily: "'Montserrat', sans-serif", fontSize: "0.7rem",
          letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
          marginBottom: "-1px", whiteSpace: "nowrap",
        }}>
          {label}
        </button>
      ))}
    </div>
  );
}