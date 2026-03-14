// app/invitacion/[codigo]/page.tsx
import type { Metadata } from "next";
import { PaginaInvitacionCliente } from "./PaginaInvitacionCliente";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tienes una invitación — Carla & Hely",
    description: undefined,
    openGraph: {
      title: "Tienes una invitación — Carla & Hely",
      description: undefined,
    },
  };
}

export default function Page() {
  return <PaginaInvitacionCliente />;
}