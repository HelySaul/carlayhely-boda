import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: grupos, error } = await getSupabaseAdmin()
    .from('grupos')
    .select(`*, invitados(*)`)
    .order('nombre');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Generar CSV
  const rows: string[] = [
    'Grupo,Código,Invitado,Confirmado,Asistió,WhatsApp'
  ];

  for (const g of grupos ?? []) {
    const invitados = g.invitados ?? [];
    if (invitados.length === 0) {
      rows.push(`"${g.nombre}","${g.codigo}","(sin invitados)","","",""`)
    } else {
      for (const inv of invitados) {
        rows.push([
          `"${g.nombre}"`,
          `"${g.codigo}"`,
          `"${inv.nombre}"`,
          inv.confirmado ? 'Sí' : 'No',
          inv.asistio   ? 'Sí' : 'No',
          `"${inv.whatsapp ?? ''}"`,
        ].join(','));
      }
    }
  }

  const csv = rows.join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="invitados-carlayhely-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}