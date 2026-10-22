import { NextResponse } from 'next/server';
import { requireAdministrator } from '@/lib/auth';
import { httpErrorResponse } from '@/lib/http-error';
export async function GET() {
  try {
    return NextResponse.json(
      { user: await requireAdministrator() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return httpErrorResponse(error);
  }
}
