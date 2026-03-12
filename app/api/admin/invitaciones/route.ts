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
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — crear invitacion con invitados
export async function POST(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const { invitados } = await req.json();

  if (!invitados || invitados.length === 0) {
    return NextResponse.json({ error: 'Al menos un invitado es requerido' }, { status: 400 });
  }

  // Generar código único
  let codigo = generarCodigo();
  let intentos = 0;
  while (intentos < 10) {
    const { data } = await getSupabaseAdmin().from('invitaciones').select('id').eq('codigo', codigo).single();
    if (!data) break;
    codigo = generarCodigo();
    intentos++;
  }

  // Crear invitacion
  const { data: invitacion, error: rError } = await getSupabaseAdmin()
    .from('invitaciones')
    .insert({ codigo })
    .select()
    .single();

  if (rError) return NextResponse.json({ error: rError.message }, { status: 500 });

  // Crear invitados
  const rows = invitados.map((inv: { nombre: string; whatsapp?: string }) => ({
    invitacion_id: invitacion.id,
    nombre: inv.nombre.trim(),
    whatsapp: inv.whatsapp?.trim() || null,
  }));

  const { error: iError } = await getSupabaseAdmin().from('invitados').insert(rows);
  if (iError) return NextResponse.json({ error: iError.message }, { status: 500 });

  // Retornar invitacion completa
  const { data: full } = await getSupabaseAdmin()
    .from('invitaciones')
    .select(`*, invitados(*)`)
    .eq('id', invitacion.id)
    .single();

  return NextResponse.json(full, { status: 201 });
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