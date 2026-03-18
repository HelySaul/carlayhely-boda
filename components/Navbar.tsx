"use client";
import { useState, useEffect } from "react";

const LINKS = [
  { href: "#nosotros",  label: "Nosotros"  },
  { href: "#programa",  label: "Programa"  },
  { href: "#lugar",     label: "El Lugar"  },
  { href: "#dresscode", label: "Dress Code"},
  { href: "#detalles",  label: "Detalles"  },
  { href: "#fotos",     label: "Fotos"     },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      // Siempre restaurar al desmontar
      document.body.style.overflow = "";
    };
  }, [open]);

  // Restaurar si el usuario presiona Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Restaurar si el viewport cambia de tamaño (desktop)
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <nav
        style={{
          position:       "fixed",
          top: 0, left: 0, right: 0,
          zIndex:         100,
          padding:        "1rem 1.5rem",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          background:     scrolled ? "var(--cream)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom:   scrolled ? "1px solid var(--border-subtle)" : "none",
          transition:     "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        <a href="#" className="script"
          style={{ fontSize: "1.9rem", color: "var(--ink)", textDecoration: "none", lineHeight: 1 }}>
          C &amp; H
        </a>

        <button onClick={() => setOpen(!open)} aria-label="Menú"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", flexDirection: "column", gap: "5px" }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display:         "block",
              width:           "22px",
              height:          "1px",
              backgroundColor: "var(--ink)",
              transformOrigin: "center",
              transition:      "transform 0.3s ease, opacity 0.3s ease",
              transform:
                open && i === 0 ? "translateY(6px) rotate(45deg)"  :
                open && i === 2 ? "translateY(-6px) rotate(-45deg)" : "none",
              opacity: open && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {/* Drawer — clip con overflow:hidden para evitar scroll horizontal */}
      <div style={{
        position:      "fixed",
        inset:         0,
        zIndex:        99,
        overflow:      "hidden",          // ← evita el scroll horizontal
        pointerEvents: open ? "all" : "none",
      }}>
        <div style={{
          position:       "absolute",
          inset:          0,
          background:     "var(--cream)",
          backdropFilter: "blur(20px)",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "0.2rem",
          transition:     "opacity 0.4s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          opacity:        open ? 1 : 0,
          transform:      open ? "translateX(0)" : "translateX(100%)",
        }}>
          <p className="script"
            style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", color: "var(--blush)", marginBottom: "2rem" }}>
            Carla &amp; Hely
          </p>

          <div className="ornament-line" style={{ marginBottom: "2.5rem" }} />

          {LINKS.map((link, i) => (
            <a key={link.href} href={link.href}
              onClick={e => {
                e.preventDefault();
                setOpen(false);
                setTimeout(() => {
                  const target = document.querySelector(link.href);
                  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50); // pequeño delay para que el drawer cierre primero
              }}
              className="serif hover-line"
              style={{
                fontSize:       "clamp(1.3rem, 5vw, 1.7rem)",
                color:          "var(--ink)",
                textDecoration: "none",
                fontStyle:      "italic",
                letterSpacing:  "0.04em",
                padding:        "0.6rem 0",
                opacity:        open ? 1 : 0,
                transform:      open ? "translateY(0)" : "translateY(12px)",
                transition:     `opacity 0.5s ease ${0.1 + i * 0.06}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s`,
              }}>
              {link.label}
            </a>
          ))}

          <div className="ornament-line" style={{ marginTop: "2.5rem" }} />

          <p className="serif"
            style={{ marginTop: "1.5rem", color: "var(--ink-light)", fontSize: "0.82rem", letterSpacing: "0.18em", fontStyle: "italic" }}>
            13 · 06 · 2026
          </p>
        </div>
      </div>
    </>
  );
}