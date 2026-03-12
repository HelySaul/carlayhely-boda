import { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

interface Props { params: Promise<{ codigo: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params;

  const { data } = await getSupabaseAdmin()
    .from('invitaciones')
    .select('nombre, invitados(nombre)')
    .eq('codigo', codigo)
    .single();

  let titulo = "Tienes una invitación — Carla & Hely";
  let descripcion = "Con alegría en el corazón, te invitamos a celebrar el inicio de nuestra vida juntos. 13 de Junio, 2026.";

  if (data?.invitados?.length) {
    const nombres = data.invitados.map((i: { nombre: string }) => i.nombre.split(" ")[0]);
    if (nombres.length === 1) {
      titulo = `${nombres[0]}, tienes una invitación`;
      descripcion = `Carla & Hely te invitan a celebrar su boda el 13 de Junio de 2026 en Brisas del Renacer, Falcón.`;
    } else {
      const lista = nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];
      titulo = `${lista}, tienen una invitación`;
      descripcion = `Carla & Hely los invitan a celebrar su boda el 13 de Junio de 2026 en Brisas del Renacer, Falcón.`;
    }
  }

  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      type: "website",
      siteName: "Carla & Hely · 13 · 06 · 2026",
    },
  };
}

export default function LayoutInvitacion({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}