"use client";
// ── helpers.ts ────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export type Rol = "super_admin" | "organizador" | "recepcion";

export interface AdminToken {
  id: string;
  username: string;
  nombre: string;
  rol: Rol;
}

export function token() { return localStorage.getItem("admin_token") ?? ""; }

export function authHeaders(): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token()}` };
}

export function fechaCorta(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit" });
}

export function parseAdminToken(): AdminToken | null {
  try {
    return JSON.parse(atob((localStorage.getItem("admin_token") ?? "..").split(".")[1])) as AdminToken;
  } catch { return null; }
}

// ── Permisos por rol ──────────────────────────────────────────────────────────
export interface Permisos {
  puedeEditarInvitados: boolean;
  puedeCambiarRonda: boolean;
  puedeEliminar: boolean;
  puedeCrearUsuarios: boolean;
  puedeVerAdmin: boolean;
  puedeMarcarAsistencia: boolean;
  puedeAgregarEnPuerta: boolean;
  puedeExportar: boolean;
}

export function permisosDeRol(rol: Rol): Permisos {
  switch (rol) {
    case "super_admin":
      return {
        puedeEditarInvitados:  true,
        puedeCambiarRonda:     true,
        puedeEliminar:         true,
        puedeCrearUsuarios:    true,
        puedeVerAdmin:         true,
        puedeMarcarAsistencia: true,
        puedeAgregarEnPuerta:  true,
        puedeExportar:         true,
      };
    case "organizador":
      return {
        puedeEditarInvitados:  true,
        puedeCambiarRonda:     false,
        puedeEliminar:         false,
        puedeCrearUsuarios:    false,
        puedeVerAdmin:         true,
        puedeMarcarAsistencia: false,
        puedeAgregarEnPuerta:  false,
        puedeExportar:         true,
      };
    case "recepcion":
      return {
        puedeEditarInvitados:  false,
        puedeCambiarRonda:     false,
        puedeEliminar:         false,
        puedeCrearUsuarios:    false,
        puedeVerAdmin:         false,
        puedeMarcarAsistencia: true,
        puedeAgregarEnPuerta:  true,
        puedeExportar:         false,
      };
  }
}

export function usePermisos(): Permisos {
  const p = parseAdminToken();
  const rol: Rol = p?.rol ?? "organizador";
  return permisosDeRol(rol);
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