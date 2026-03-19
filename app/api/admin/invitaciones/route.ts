// app/api/admin/invitaciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

async function auth(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return null;
}

function generarCodigo(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// GET — lista todas las invitaciones con sus invitados
export async function GET(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const { data, error } = await getSupabaseAdmin()
    .from('invitaciones')
    .select(`*, invitados(*)`)
    .order("created_at", { referencedTable: "invitados", ascending: true })
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — crear invitacion con invitados
export async function POST(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const { invitados, nombre, creado_por } = await req.json();

  if (!invitados || invitados.length === 0) {
    return NextResponse.json({ error: 'Al menos un invitado es requerido' }, { status: 400 });
  }

  let codigo = generarCodigo();
  let intentos = 0;
  while (intentos < 10) {
    const { data } = await getSupabaseAdmin().from('invitaciones').select('id').eq('codigo', codigo).single();
    if (!data) break;
    codigo = generarCodigo();
    intentos++;
  }

  const { data: invitacion, error: rError } = await getSupabaseAdmin()
    .from('invitaciones')
    .insert({ codigo, nombre: nombre || null, creado_por: creado_por || null })
    .select()
    .single();

  if (rError) return NextResponse.json({ error: rError.message }, { status: 500 });

  const rows = invitados.map((inv: { nombre: string; whatsapp?: string }) => ({
    invitacion_id: invitacion.id,
    nombre: inv.nombre.trim(),
    whatsapp: inv.whatsapp?.trim() || null,
  }));

  const { error: iError } = await getSupabaseAdmin().from('invitados').insert(rows);
  if (iError) return NextResponse.json({ error: iError.message }, { status: 500 });

  const { data: full } = await getSupabaseAdmin()
    .from('invitaciones')
    .select(`*, invitados(*)`)
    .order("created_at", { referencedTable: "invitados", ascending: true })
    .eq('id', invitacion.id)
    .single();

  return NextResponse.json(full, { status: 201 });
}

// PATCH — actualizar nombre del grupo y/o mesa_id
export async function PATCH(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const body = await req.json();
  const update: Record<string, unknown> = {};

  if ('nombre'  in body) update.nombre  = body.nombre  || null;
  if ('mesa_id' in body) update.mesa_id = body.mesa_id || null;

  const { error } = await getSupabaseAdmin().from('invitaciones').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — eliminar invitacion
export async function DELETE(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const { error } = await getSupabaseAdmin().from('invitaciones').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}