import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { assertSameOrigin, AuthError, authErrorResponse } from '@/lib/auth';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      body.email.length > 254 ||
      body.password.length > 256 ||
      !body.email.includes('@') ||
      !body.password
    )
      throw new AuthError(400, 'Enter a valid email address and password.');
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: body.email.trim(),
      password: body.password,
    });
    if (error)
      throw new AuthError(
        401,
        'Email or password is incorrect. Please try again.',
      );
    const {
      data: { user },
      error: verificationError,
    } = await supabase.auth.getUser();
    if (verificationError || !user) {
      await supabase.auth.signOut({ scope: 'local' });
      throw new AuthError(
        401,
        'Your session could not be verified. Please sign in again.',
      );
    }
    return NextResponse.json(
      {
        redirect: user.app_metadata.role === 'admin' ? '/admin' : '/workspace',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
