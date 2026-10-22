import 'server-only';
import { cache } from 'react';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import {
  createSupabaseServerClient,
  ConfigurationError,
} from './supabase/server';
export type Viewer = { id: string; email: string; role: 'admin' | 'learner' };
export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: {
      code: string;
      retryAfterSeconds?: number;
      retryAt?: string;
    },
  ) {
    super(message);
  }
}
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return {
    id: user.id,
    email: user.email ?? '',
    role: user.app_metadata.role === 'admin' ? 'admin' : 'learner',
  };
});
export async function requireUser() {
  const viewer = await getViewer();
  if (!viewer)
    throw new AuthError(401, 'Your session has expired. Please sign in again.');
  return viewer;
}
export async function requireAdministrator() {
  const viewer = await requireUser();
  if (viewer.role !== 'admin')
    throw new AuthError(403, 'Administrator access is required.');
  return viewer;
}
export async function requirePageUser(admin = false) {
  try {
    return admin ? await requireAdministrator() : await requireUser();
  } catch (error) {
    if (error instanceof AuthError)
      redirect(
        error.status === 403
          ? '/workspace?notice=administrator-required'
          : '/login?reason=session',
      );
    throw error;
  }
}
export function authErrorResponse(error: unknown) {
  const status =
    error instanceof AuthError
      ? error.status
      : error instanceof ConfigurationError
        ? 503
        : 500;
  const message =
    error instanceof AuthError || error instanceof ConfigurationError
      ? error.message
      : 'The workspace is temporarily unavailable. Please try again.';
  return NextResponse.json(
    { error: message, ...(error instanceof AuthError ? error.details : {}) },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        ...(error instanceof AuthError && error.details?.retryAfterSeconds
          ? { 'Retry-After': String(error.details.retryAfterSeconds) }
          : {}),
      },
    },
  );
}
export function assertSameOrigin(request: Request) {
  let valid = false;
  try {
    const value = request.headers.get('origin');
    if (value) {
      const origin = new URL(value);
      valid =
        ['http:', 'https:'].includes(origin.protocol) &&
        origin.host === request.headers.get('host');
    }
  } catch {
    valid = false;
  }
  if (!valid)
    throw new AuthError(
      403,
      'This request must come from the FirstDay application.',
    );
}
