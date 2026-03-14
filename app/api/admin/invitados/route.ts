import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

async function auth(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return null;
}

// POST — agregar invitado a invitacion existente
export async function POST(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const { invitacion_id, nombre, whatsapp } = await req.json();
  if (!invitacion_id || !nombre) {
    return NextResponse.json({ error: 'invitacion_id y nombre requeridos' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('invitados')
    .insert({ invitacion_id, nombre: nombre.trim(), whatsapp: whatsapp?.trim() || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH — actualizar confirmaciones, asistencia, nombre, whatsapp
export async function PATCH(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const body = await req.json();
  const allowed = ['nombre', 'whatsapp', 'sexo', 'confirmacion_1', 'confirmacion_2', 'confirmacion_3', 'asistio'];
  const update: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) {
      update[key] = body[key];
      // Si se marca confirmación, guardar fecha automáticamente
      if (key === 'confirmacion_1' && body[key]) update['confirmacion_1_fecha'] = new Date().toISOString();
      if (key === 'confirmacion_2' && body[key]) update['confirmacion_2_fecha'] = new Date().toISOString();
      if (key === 'confirmacion_3' && body[key]) update['confirmacion_3_fecha'] = new Date().toISOString();
      // Si se desmarca, limpiar fecha
      if (key === 'confirmacion_1' && !body[key]) update['confirmacion_1_fecha'] = null;
      if (key === 'confirmacion_2' && !body[key]) update['confirmacion_2_fecha'] = null;
      if (key === 'confirmacion_3' && !body[key]) update['confirmacion_3_fecha'] = null;
    }
  }

  const { data, error } = await getSupabaseAdmin()
    .from('invitados')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — eliminar invitado
export async function DELETE(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const { error } = await getSupabaseAdmin().from('invitados').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}