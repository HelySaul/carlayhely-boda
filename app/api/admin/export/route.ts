import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: reservas, error } = await getSupabaseAdmin()
    .from('reservas')
    .select(`*, invitados(*)`)
    .order('codigo');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows: string[] = [
    'Código,Nombre,WhatsApp,1ra Confirmación,2da Confirmación,3ra Confirmación,Asistió'
  ];

  for (const r of reservas ?? []) {
    for (const inv of r.invitados ?? []) {
      rows.push([
        r.codigo,
        `"${inv.nombre}"`,
        `"${inv.whatsapp ?? ''}"`,
        inv.confirmacion_1 ? (inv.confirmacion_1_fecha ? new Date(inv.confirmacion_1_fecha).toLocaleDateString('es-VE') : 'Sí') : 'No',
        inv.confirmacion_2 ? (inv.confirmacion_2_fecha ? new Date(inv.confirmacion_2_fecha).toLocaleDateString('es-VE') : 'Sí') : 'No',
        inv.confirmacion_3 ? (inv.confirmacion_3_fecha ? new Date(inv.confirmacion_3_fecha).toLocaleDateString('es-VE') : 'Sí') : 'No',
        inv.asistio ? 'Sí' : 'No',
      ].join(','));
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