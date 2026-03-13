// ── styles.ts ─────────────────────────────────────────────────────────────────
import React from "react";

export const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.6rem", letterSpacing: "0.18em",
  textTransform: "uppercase", color: "var(--ink-light)",
  fontFamily: "'Montserrat', sans-serif", marginBottom: "0.4rem",
};

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.8rem", boxSizing: "border-box",
  background: "var(--cream)", border: "1px solid var(--border-subtle)",
  borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
  fontSize: "16px", color: "var(--ink)", outline: "none",
};

export const selectStyle: React.CSSProperties = {
  padding: "0.6rem 0.8rem", background: "var(--cream)", border: "1px solid var(--border-subtle)",
  borderRadius: "2px", fontFamily: "'Montserrat', sans-serif", fontSize: "0.7rem",
  color: "var(--ink)", outline: "none", cursor: "pointer",
};

export const btnPrimary: React.CSSProperties = {
  padding: "0.65rem 1.4rem", background: "var(--terracotta)", color: "var(--cream)",
  border: "none", borderRadius: "2px", fontFamily: "'Montserrat', sans-serif",
  fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase",
  cursor: "pointer", whiteSpace: "nowrap",
};

export const btnOutline: React.CSSProperties = {
  padding: "0.6rem 1.2rem", background: "transparent", color: "var(--terracotta)",
  border: "1px solid var(--terracotta)", borderRadius: "2px",
  fontFamily: "'Montserrat', sans-serif", fontSize: "0.65rem",
  letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap",
};

export const btnChip = (active: boolean): React.CSSProperties => ({
  padding: "0.3rem 0.8rem", background: active ? "var(--terracotta)" : "transparent",
  color: active ? "var(--cream)" : "var(--terracotta)",
  border: "1px solid var(--terracotta)", borderRadius: "20px",
  fontFamily: "'Montserrat', sans-serif", fontSize: "0.58rem",
  letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap",
});