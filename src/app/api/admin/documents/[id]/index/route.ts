import { NextResponse } from 'next/server';
import {
  assertSameOrigin,
  authErrorResponse,
  requireAdministrator,
} from '@/lib/auth';
import { indexDocument } from '@/lib/knowledge/indexing';
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    await requireAdministrator();
    return NextResponse.json(await indexDocument((await params).id), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
