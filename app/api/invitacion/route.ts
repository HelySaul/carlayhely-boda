import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET /api/invitacion?codigo=123456
export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get('codigo');
  if (!codigo) return NextResponse.json({ error: 'Código requerido' }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from('invitaciones')
    .select('id, codigo, nombre, invitados(id, nombre, whatsapp, sexo, confirmacion_1, confirmacion_2, confirmacion_3)')
    .eq('codigo', codigo)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });
  return NextResponse.json(data);
}