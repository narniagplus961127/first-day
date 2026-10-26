import { createHash, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

export async function GET(request: Request) {
  const respond = (ok: boolean, status: number) =>
    Response.json({ ok }, { status, headers: { 'Cache-Control': 'no-store' } });
  const secret = process.env.CRON_SECRET;
  if (!secret) return respond(false, 503);
  const hash = (value: string) => createHash('sha256').update(value).digest();
  if (
    !timingSafeEqual(
      hash(request.headers.get('authorization') || ''),
      hash('Bearer ' + secret),
    )
  )
    return respond(false, 401);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return respond(false, 503);
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client
      .from('knowledge_documents')
      .select('id')
      .limit(1)
      .retry(false)
      .abortSignal(AbortSignal.timeout(5000));
    return respond(!error, error ? 503 : 200);
  } catch {
    return respond(false, 503);
  }
}
