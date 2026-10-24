import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { assertSameOrigin } from '@/lib/auth';
import { HttpError, httpErrorResponse } from '@/lib/http-error';
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
      throw new HttpError(400, 'Enter a valid email address and password.');
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: body.email.trim(),
      password: body.password,
    });
    if (error)
      throw new HttpError(
        401,
        'Email or password is incorrect. Please try again.',
      );
    const {
      data: { user },
      error: verificationError,
    } = await supabase.auth.getUser();
    if (verificationError || !user) {
      await supabase.auth.signOut({ scope: 'local' });
      throw new HttpError(
        401,
        'Your session could not be verified. Please sign in again.',
      );
    }
    return NextResponse.json(
      {
        redirect: ['admin', 'admin_demo'].includes(user.app_metadata.role)
          ? '/admin'
          : '/workspace',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return httpErrorResponse(error);
  }
}
