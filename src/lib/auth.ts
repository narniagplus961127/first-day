import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './supabase/server';
import { HttpError } from './http-error';
export type Viewer = {
  id: string;
  email: string;
  role: 'admin' | 'admin_demo' | 'learner';
};
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
    role:
      user.app_metadata.role === 'admin'
        ? 'admin'
        : user.app_metadata.role === 'admin_demo'
          ? 'admin_demo'
          : 'learner',
  };
});
export async function requireUser() {
  const viewer = await getViewer();
  if (!viewer)
    throw new HttpError(401, 'Your session has expired. Please sign in again.');
  return viewer;
}
export async function requireAdministrator() {
  const viewer = await requireUser();
  if (viewer.role !== 'admin')
    throw new HttpError(
      403,
      viewer.role === 'admin_demo'
        ? 'The admin demo is read only. Use a private administrator account to save changes.'
        : 'Administrator access is required.',
    );
  return viewer;
}
export async function requireAdministratorView() {
  const viewer = await requireUser();
  if (viewer.role === 'learner')
    throw new HttpError(403, 'Administrator access is required.');
  return viewer;
}
export async function requirePageUser(admin = false) {
  try {
    return admin ? await requireAdministratorView() : await requireUser();
  } catch (error) {
    if (error instanceof HttpError)
      redirect(
        error.status === 403
          ? '/workspace?notice=administrator-required'
          : '/login?reason=session',
      );
    throw error;
  }
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
    throw new HttpError(
      403,
      'This request must come from the FirstDay application.',
    );
}
