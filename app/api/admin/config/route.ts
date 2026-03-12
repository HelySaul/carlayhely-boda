import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAdminFromRequest } from '@/lib/auth';

async function auth(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return null;
}

// GET — leer ronda actual
export async function GET(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;
  const { data } = await getSupabaseAdmin()
    .from('config').select('value').eq('key', 'ronda_actual').single();
  return NextResponse.json({ ronda: parseInt(data?.value ?? '1') });
}

// PATCH — cambiar ronda actual
export async function PATCH(req: NextRequest) {
  const deny = await auth(req); if (deny) return deny;
  const { ronda } = await req.json();
  if (![1, 2, 3].includes(ronda)) {
    return NextResponse.json({ error: 'Ronda inválida' }, { status: 400 });
  }
  await getSupabaseAdmin()
    .from('config')
    .upsert({ key: 'ronda_actual', value: String(ronda) });
  return NextResponse.json({ ok: true, ronda });
}