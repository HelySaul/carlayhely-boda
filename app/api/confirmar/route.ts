import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// POST /api/confirmar
// body: { codigo, ronda (1|2|3), confirmaciones: [{id, asiste, whatsapp?}] }
export async function POST(req: NextRequest) {
  const { codigo, ronda, confirmaciones } = await req.json();

  if (!codigo || !ronda || !confirmaciones?.length) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Verificar que el código existe
  const { data: inv } = await getSupabaseAdmin()
    .from('invitaciones')
    .select('id, invitados(id)')
    .eq('codigo', codigo)
    .single();

  if (!inv) return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });

  const invIds = inv.invitados.map((i: { id: string }) => i.id);
  const campo = `confirmacion_${ronda}` as 'confirmacion_1' | 'confirmacion_2' | 'confirmacion_3';
  const campoFecha = `confirmacion_${ronda}_fecha` as 'confirmacion_1_fecha' | 'confirmacion_2_fecha' | 'confirmacion_3_fecha';
  const now = new Date().toISOString();

  for (const conf of confirmaciones) {
    // Seguridad: solo se pueden actualizar invitados de esta invitación
    if (!invIds.includes(conf.id)) continue;

    const update: Record<string, unknown> = {
      [campo]: conf.asiste,
      [campoFecha]: conf.asiste ? now : null,
    };

    // Guardar WhatsApp si se envía y no estaba registrado
    if (conf.whatsapp?.trim()) {
      update.whatsapp = conf.whatsapp.trim();
    }

    await getSupabaseAdmin()
      .from('invitados')
      .update(update)
      .eq('id', conf.id);
  }

  return NextResponse.json({ ok: true });
}