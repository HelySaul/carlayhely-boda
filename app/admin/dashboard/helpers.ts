"use client";
// ── helpers.ts ────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export function token() { return localStorage.getItem("admin_token") ?? ""; }

export function authHeaders(): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token()}` };
}

export function fechaCorta(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit" });
}

export function parseAdminToken() {
  try {
    return JSON.parse(atob((localStorage.getItem("admin_token") ?? "..").split(".")[1]));
  } catch { return {}; }
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}