import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

async function auth(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return null;
}

// GET — listar usuarios
export async function GET(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const { data, error } = await getSupabaseAdmin()
    .from('admins')
    .select('id, username, nombre, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — crear usuario
export async function POST(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;

  const { username, nombre, password } = await req.json();
  if (!username || !nombre || !password) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data, error } = await getSupabaseAdmin()
    .from('admins')
    .insert({ username: username.trim(), nombre: nombre.trim(), password_hash })
    .select('id, username, nombre, created_at')
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Ese usuario ya existe' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}