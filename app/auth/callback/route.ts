import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        // Redirigir al campus de alumno para que elija escuela si es nuevo
        return NextResponse.redirect(`${origin}/alumno`);
      }
    } catch (e) {
      console.error('Auth callback error:', e);
    }
  }

  // Fallback a home
  return NextResponse.redirect(`${origin}/`);
}
