import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

async function auth(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return null;
}

// GET /api/admin/grupos — lista todos los grupos con sus invitados
export async function GET(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const { data, error } = await getSupabaseAdmin()
    .from('grupos')
    .select(`*, invitados(*)`)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/admin/grupos — crear grupo con invitados
export async function POST(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const { nombre, codigo, invitados } = await req.json();

  if (!nombre || !codigo) {
    return NextResponse.json({ error: 'Nombre y código requeridos' }, { status: 400 });
  }

  // Crear grupo
  const { data: grupo, error: gError } = await getSupabaseAdmin()
    .from('grupos')
    .insert({ nombre, codigo: codigo.toUpperCase() })
    .select()
    .single();

  if (gError) {
    if (gError.code === '23505') {
      return NextResponse.json({ error: 'Ese código ya existe' }, { status: 409 });
    }
    return NextResponse.json({ error: gError.message }, { status: 500 });
  }

  // Crear invitados si vienen
  if (invitados && invitados.length > 0) {
    const rows = invitados.map((inv: { nombre: string; whatsapp?: string }) => ({
      grupo_id: grupo.id,
      nombre: inv.nombre,
      whatsapp: inv.whatsapp || null,
    }));
    const { error: iError } = await getSupabaseAdmin().from('invitados').insert(rows);
    if (iError) return NextResponse.json({ error: iError.message }, { status: 500 });
  }

  // Retornar grupo completo
  const { data: full } = await getSupabaseAdmin()
    .from('grupos')
    .select(`*, invitados(*)`)
    .eq('id', grupo.id)
    .single();

  return NextResponse.json(full, { status: 201 });
}

// DELETE /api/admin/grupos?id=xxx
export async function DELETE(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const { error } = await getSupabaseAdmin().from('grupos').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}