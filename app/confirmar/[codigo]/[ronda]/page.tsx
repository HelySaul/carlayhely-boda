// app/confirmar/[codigo]/[ronda]/page.tsx
import type { Metadata } from "next";
import { PaginaConfirmarCliente } from "./PaginaConfirmarCliente";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Confirmación — Carla & Hely",
    description: undefined,
    openGraph: {
      title: "Confirmación — Carla & Hely",
      description: undefined,
    },
  };
}

export default function Page() {
  return <PaginaConfirmarCliente />;
}