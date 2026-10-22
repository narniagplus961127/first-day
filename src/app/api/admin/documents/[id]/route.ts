import { NextResponse } from 'next/server';
import { requireAdministrator } from '@/lib/auth';
import { HttpError, httpErrorResponse } from '@/lib/http-error';
import { inspectDocument } from '@/lib/knowledge/repository';
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdministrator();
    const result = await inspectDocument((await context.params).id);
    if (!result)
      throw new HttpError(404, 'This knowledge document was not found.');
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return httpErrorResponse(error);
  }
}
