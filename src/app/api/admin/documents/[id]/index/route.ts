import { NextResponse } from 'next/server';
import { assertSameOrigin, requireAdministrator } from '@/lib/auth';
import { httpErrorResponse } from '@/lib/http-error';
import { indexDocument } from '@/lib/knowledge/indexing';
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    await requireAdministrator();
    return NextResponse.json(
      await indexDocument(
        (await params).id,
        new URL(request.url).searchParams.get('version'),
      ),
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  } catch (error) {
    return httpErrorResponse(error);
  }
}
