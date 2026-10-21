import { NextResponse } from 'next/server';
import { requireUser, authErrorResponse } from '@/lib/auth';
export async function GET() {
  try {
    return NextResponse.json(
      { user: await requireUser() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
