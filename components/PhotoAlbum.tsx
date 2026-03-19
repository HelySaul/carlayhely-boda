"use client";
import { useState, useRef } from "react";

// Las fotos van en /public/fotos/ — reemplaza los src con tus imágenes reales
const FOTOS = [
  { src: "/fotos/foto1.jpg", caption: "el comienzo" },
  { src: "/fotos/foto2.jpg", caption: "crecer juntos" },
  { src: "/fotos/foto3.jpg", caption: "juntos" },
  { src: "/fotos/foto4.jpg", caption: "para siempre" },
];

const OBJECT_POSITIONS = ["center", "center", "center", "top"];
const ROTACIONES = [-7, -2, 4, 9];
const TRANSLATES  = [[-55, 8], [-18, -4], [18, 6], [55, 1]];

export default function PhotoAlbum() {
  const [activa, setActiva] = useState<number | null>(null);

  // ── Touch swipe para mobile ───────────────────────────────────────────────
  const [mobileIdx, setMobileIdx] = useState(0);
  const touchStartX = useRef(0);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) setMobileIdx(i => Math.min(i + 1, FOTOS.length - 1));
    else         setMobileIdx(i => Math.max(i - 1, 0));
  }

  return (
    <>
      {/* ── Desktop: Polaroids apiladas ── */}
      <div className="album-desktop" style={{ position: "relative", height: "320px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {FOTOS.map((foto, i) => {
          const isActiva = activa === i;
          return (
            <div
              key={i}
              onClick={() => setActiva(isActiva ? null : i)}
              style={{
                position:    "absolute",
                background:  "#FEFCF9",
                padding:     "10px 10px 32px",
                boxShadow:   isActiva
                  ? "0 16px 48px rgba(60,30,20,0.22)"
                  : "0 4px 18px rgba(60,30,20,0.13)",
                transform:   isActiva
                  ? "rotate(0deg) translateY(-24px) scale(1.1)"
                  : `rotate(${ROTACIONES[i]}deg) translate(${TRANSLATES[i][0]}px, ${TRANSLATES[i][1]}px)`,
                zIndex:      isActiva ? 10 : i + 1,
                transition:  "transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease",
                cursor:      "pointer",
                width:       "190px",
              }}
            >
              {/* Foto */}
              <div style={{
                width: "100%", aspectRatio: "1",
                background: "linear-gradient(135deg, var(--blush-pale) 0%, var(--cream-deep) 100%)",
                overflow: "hidden",
              }}>
                <img
                  src={foto.src}
                  alt={foto.caption}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: OBJECT_POSITIONS[i], display: "block" }}
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

            </div>
          );
        })}
      </div>



      {/* ── Mobile: Swipe carousel ── */}
      <div
        className="album-mobile"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem" }}
      >
        {/* Polaroid activa */}
        <div style={{
          background:  "#FEFCF9",
          padding:     "14px 14px 44px",
          boxShadow:   "0 8px 32px rgba(60,30,20,0.15)",
          width:       "min(260px, 80vw)",
          transition:  "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}>
          <div style={{
            width: "100%", aspectRatio: "1",
            background: "linear-gradient(135deg, var(--blush-pale) 0%, var(--cream-deep) 100%)",
            overflow: "hidden",
          }}>
            <img
              src={FOTOS[mobileIdx].src}
              alt={FOTOS[mobileIdx].caption}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: OBJECT_POSITIONS[mobileIdx], display: "block" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

        </div>

        {/* Dots */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {FOTOS.map((_, i) => (
            <div
              key={i}
              onClick={() => setMobileIdx(i)}
              style={{
                width:        i === mobileIdx ? "18px" : "6px",
                height:       "6px",
                borderRadius: "3px",
                background:   i === mobileIdx ? "var(--terracotta)" : "rgba(201,79,79,0.2)",
                transition:   "all 0.3s ease",
                cursor:       "pointer",
              }}
            />
          ))}
        </div>


      </div>

      <style>{`
        .album-desktop { display: flex !important; }
        .album-mobile  { display: none  !important; }
        @media (max-width: 640px) {
          .album-desktop { display: none  !important; }
          .album-mobile  { display: flex  !important; }
        }
      `}</style>
    </>
  );
}