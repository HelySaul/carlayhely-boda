import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// GET /api/config — pública, devuelve ronda_actual
export async function GET() {
  const { data } = await getSupabaseAdmin()
    .from('config')
    .select('value')
    .eq('key', 'ronda_actual')
    .single();

  return NextResponse.json({ ronda: parseInt(data?.value ?? '1') });
}