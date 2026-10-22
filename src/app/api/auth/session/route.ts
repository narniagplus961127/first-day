import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { httpErrorResponse } from '@/lib/http-error';
export async function GET() {
  try {
    return NextResponse.json(
      { user: await requireUser() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return httpErrorResponse(error);
  }
}
