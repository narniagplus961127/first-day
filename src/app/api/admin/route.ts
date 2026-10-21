import { NextResponse } from 'next/server';
import { requireAdministrator, authErrorResponse } from '@/lib/auth';
export async function GET() {
  try {
    return NextResponse.json(
      { user: await requireAdministrator() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
