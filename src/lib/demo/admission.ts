import 'server-only';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { createClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/http-error';

async function requestContext(request: Request) {
  const fixture = process.env.FIRSTDAY_REQUEST_CONTEXT_URL;
  if (fixture) {
    const endpoint = new URL(fixture);
    if (
      process.env.NODE_ENV !== 'development' ||
      process.env.VERCEL ||
      endpoint.origin !== 'http://127.0.0.1:19032' ||
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:55421' ||
      !process.env.FIRSTDAY_REQUEST_CONTEXT_SECRET
    )
      throw new HttpError(
        503,
        'Request identity configuration is unavailable.',
      );
    const response = await fetch(new URL('/context', endpoint), {
      headers: {
        authorization: 'Bearer ' + process.env.FIRSTDAY_REQUEST_CONTEXT_SECRET,
        'x-firstday-context': (
          request.headers.get('x-firstday-context') || ''
        ).slice(0, 200),
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    const result = await response.json();
    if (
      !response.ok ||
      typeof result.identity !== 'string' ||
      !result.identity ||
      result.identity.length > 128 ||
      typeof result.now !== 'string' ||
      !Number.isFinite(Date.parse(result.now))
    )
      throw new HttpError(503, 'Request identity is temporarily unavailable.');
    return { identity: result.identity, now: result.now };
  }
  // Only Vercel's boundary overwrites these headers. Self-hosted requests share
  // one conservative bucket until a trusted hosting adapter is configured.
  const forwarded =
    process.env.VERCEL === '1'
      ? (
          request.headers.get('x-vercel-forwarded-for') ||
          request.headers.get('x-forwarded-for') ||
          ''
        )
          .split(',')[0]
          .trim()
      : '';
  return {
    identity: isIP(forwarded) ? forwarded.toLowerCase() : 'shared-local',
    now: null,
  };
}

export async function admitQuestion(request: Request) {
  try {
    const key = process.env.SUPABASE_SECRET_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!key || !url) throw new Error('Missing admission configuration');
    const context = await requestContext(request);
    const identity = createHmac('sha256', key)
      .update(context.identity)
      .digest('hex');
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client
      .rpc('admit_demo_question', {
        p_identity: identity,
        p_now: context.now,
      })
      .abortSignal(AbortSignal.timeout(5000));
    if (error || !data || typeof data.allowed !== 'boolean')
      throw new Error('Admission unavailable');
    if (!data.allowed)
      throw new HttpError(
        429,
        data.code === 'app_daily'
          ? 'The shared demo has reached 100 questions today. It resets at midnight UTC.'
          : 'This connection has reached 5 questions in 60 seconds. Please wait before asking again.',
        {
          code: data.code,
          retryAfterSeconds: data.retryAfterSeconds,
          retryAt: data.retryAt,
        },
      );
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      503,
      'Demo usage storage is temporarily unavailable. Please try again.',
    );
  }
}
