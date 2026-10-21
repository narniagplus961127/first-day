import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { assertSameOrigin, authErrorResponse } from '@/lib/auth';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    return NextResponse.json(
      { ok: true },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
