import { NextResponse } from 'next/server';
import { ConfigurationError } from './supabase/server';
export class HttpError extends Error {
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
export function httpErrorResponse(error: unknown) {
  const status =
    error instanceof HttpError
      ? error.status
      : error instanceof ConfigurationError
        ? 503
        : 500;
  const message =
    error instanceof HttpError || error instanceof ConfigurationError
      ? error.message
      : 'The workspace is temporarily unavailable. Please try again.';
  return NextResponse.json(
    { error: message, ...(error instanceof HttpError ? error.details : {}) },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        ...(error instanceof HttpError && error.details?.retryAfterSeconds
          ? { 'Retry-After': String(error.details.retryAfterSeconds) }
          : {}),
      },
    },
  );
}
