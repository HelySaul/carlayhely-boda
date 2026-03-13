"use client";
// ── ModalShell.tsx ────────────────────────────────────────────────────────────
// Wrapper responsive para modales.
// Desktop: centrado en pantalla.
// Mobile: sheet desde abajo.

import { useIsDesktop } from "./helpers";

export function ModalShell({ children, onClose, maxWidth = "520px", zIndex = 1000 }: {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
  zIndex?: number;
}) {
  const isDesktop = useIsDesktop();

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex, display: "flex", alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={isDesktop ? {
          background: "var(--cream)", border: "1px solid var(--border-subtle)",
          borderRadius: "4px", padding: "2rem",
          width: "100%", maxWidth,
          maxHeight: "90dvh", overflowY: "auto",
          boxShadow: "0 16px 64px rgba(0,0,0,0.2)",
        } : {
          background: "var(--cream)",
          borderRadius: "12px 12px 0 0",
          padding: "1.5rem 1.2rem 2rem",
          width: "100%",
          maxHeight: "90dvh", overflowY: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        }}
      >
        {!isDesktop && (
          <div style={{ width: "40px", height: "4px", background: "var(--border-subtle)", borderRadius: "2px", margin: "0 auto 1.5rem" }} />
        )}
        {children}
      </div>
    </div>
  );
}