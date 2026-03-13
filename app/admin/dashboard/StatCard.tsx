// ── StatCard.tsx ──────────────────────────────────────────────────────────────

export function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ padding: "1rem 0.6rem", border: "1px solid var(--border-subtle)", borderTop: `3px solid ${color}`, borderRadius: "2px", textAlign: "center" }}>
      <p style={{ fontSize: "2rem", fontFamily: "'Cormorant Garamond', serif", color, lineHeight: 1 }}>{value}</p>
      <p className="sans" style={{ fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-light)", marginTop: "0.4rem" }}>{label}</p>
    </div>
  );
}