export function requestErrorMessage(
  data: { error?: unknown; retryAfterSeconds?: unknown },
  fallback: string,
) {
  const message = typeof data.error === 'string' ? data.error : fallback;
  return typeof data.retryAfterSeconds === 'number' &&
    Number.isFinite(data.retryAfterSeconds) &&
    data.retryAfterSeconds > 0
    ? message +
        ' Try again in ' +
        Math.ceil(data.retryAfterSeconds) +
        ' seconds.'
    : message;
}
