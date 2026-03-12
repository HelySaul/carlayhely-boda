import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 });
    }

    const { data: admin, error } = await getSupabaseAdmin()
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Password incorrecto' }, { status: 401 });
    }

    const token = signToken({ username: admin.username, id: admin.id });
    return NextResponse.json({ token });

  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}