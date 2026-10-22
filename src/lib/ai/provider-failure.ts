import 'server-only';
import { APICallError } from 'ai';
import { AuthError } from '@/lib/auth';

function retryDelay(error: unknown) {
  if (!APICallError.isInstance(error)) return undefined;
  const header = Object.entries(error.responseHeaders || {}).find(
    ([name]) => name.toLowerCase() === 'retry-after',
  )?.[1];
  let seconds: number | undefined;
  if (header && header.length <= 128) {
    seconds = /^\d+(?:\.\d+)?$/.test(header)
      ? Number(header)
      : (Date.parse(header) - Date.now()) / 1000;
  }
  if (
    (seconds === undefined || !Number.isFinite(seconds)) &&
    error.responseBody &&
    error.responseBody.length <= 8192
  ) {
    try {
      const details = JSON.parse(error.responseBody)?.error?.details;
      if (Array.isArray(details)) {
        const retry = details
          .slice(0, 10)
          .find(
            (d) => d?.['@type'] === 'type.googleapis.com/google.rpc.RetryInfo',
          );
        if (
          typeof retry?.retryDelay === 'string' &&
          /^\d+(?:\.\d{1,9})?s$/.test(retry.retryDelay)
        )
          seconds = Number(retry.retryDelay.slice(0, -1));
      }
    } catch {
      /* Provider bodies are never returned or logged. */
    }
  }
  return seconds !== undefined &&
    Number.isFinite(seconds) &&
    seconds >= 0 &&
    seconds <= 604800
    ? Math.max(1, Math.ceil(seconds))
    : undefined;
}

export function providerFailure(
  provider: 'Google' | 'Groq',
  operation: string,
  error: unknown,
) {
  const quota = APICallError.isInstance(error) && error.statusCode === 429;
  const retryAfterSeconds = retryDelay(error) ?? (quota ? 60 : undefined);
  return new AuthError(
    503,
    quota
      ? provider + ' ' + operation + ' quota reached. Wait before retrying.'
      : provider +
          ' ' +
          operation +
          ' is temporarily unavailable. Please retry.',
    {
      code: provider.toLowerCase() + (quota ? '_quota' : '_unavailable'),
      retryAfterSeconds,
      ...(retryAfterSeconds
        ? {
            retryAt: new Date(
              Date.now() + retryAfterSeconds * 1000,
            ).toISOString(),
          }
        : {}),
    },
  );
}
