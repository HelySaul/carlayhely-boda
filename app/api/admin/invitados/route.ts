import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

async function auth(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return null;
}

// PATCH /api/admin/invitados?id=xxx — actualizar confirmado/asistio/nombre/whatsapp
export async function PATCH(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const body = await req.json();
  const allowed = ['confirmado', 'asistio', 'nombre', 'whatsapp'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
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

// DELETE /api/admin/invitados?id=xxx
export async function DELETE(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const { error } = await getSupabaseAdmin().from('invitados').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// POST /api/admin/invitados — agregar invitado a grupo existente
export async function POST(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const { grupo_id, nombre, whatsapp } = await req.json();
  if (!grupo_id || !nombre) {
    return NextResponse.json({ error: 'grupo_id y nombre requeridos' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('invitados')
    .insert({ grupo_id, nombre, whatsapp: whatsapp || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}