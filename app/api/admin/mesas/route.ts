// app/api/admin/mesas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

async function auth(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return admin;
}

// GET — listar mesas con sus invitaciones asignadas
export async function GET(req: NextRequest) {
  const admin = await auth(req);
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await getSupabaseAdmin()
    .from('mesas')
    .select(`
      id, numero, alias,
      invitaciones (
        id, codigo, nombre,
        invitados ( id, nombre, sexo, confirmacion_1, confirmacion_2, confirmacion_3, asistio )
      )
    `)
    .order('numero', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — crear mesa
export async function POST(req: NextRequest) {
  const admin = await auth(req);
  if (admin instanceof NextResponse) return admin;
  if (admin.rol !== 'super_admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const { numero, alias } = await req.json();
  if (!numero) return NextResponse.json({ error: 'Número requerido' }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from('mesas')
    .insert({ numero, alias: alias || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH — editar alias y/o posición
export async function PATCH(req: NextRequest) {
  const admin = await auth(req);
  if (admin instanceof NextResponse) return admin;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if ('alias' in body) update.alias = body.alias ?? null;
  if ('pos_x' in body) update.pos_x = body.pos_x;
  if ('pos_y' in body) update.pos_y = body.pos_y;

  const { data, error } = await getSupabaseAdmin()
    .from('mesas')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — eliminar mesa
export async function DELETE(req: NextRequest) {
  const admin = await auth(req);
  if (admin instanceof NextResponse) return admin;
  if (admin.rol !== 'super_admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const { error } = await getSupabaseAdmin().from('mesas').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}