"use client";
import { useEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Reveal({ children, delay = 0, className = "", style = {} }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Diferir la animación al idle del browser — no bloquea el scroll
        const apply = () => {
          el.style.transitionDelay = `${delay}s`;
          el.classList.add("visible");
          observer.unobserve(el);
        };
        if ("requestIdleCallback" in window) {
          requestIdleCallback(apply, { timeout: 300 });
        } else {
          // Fallback para Safari que no tiene requestIdleCallback
          requestAnimationFrame(apply);
        }
      },
      {
        threshold: 0.1,       // Bajado de 0.12 — menos recálculos
        rootMargin: "0px",    // Sin rootMargin negativo — menos trabajo para el browser
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
}