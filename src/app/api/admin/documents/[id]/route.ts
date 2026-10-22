import { NextResponse } from 'next/server';
import { AuthError, authErrorResponse, requireAdministrator } from '@/lib/auth';
import { inspectDocument } from '@/lib/knowledge/repository';
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdministrator();
    const result = await inspectDocument((await context.params).id);
    if (!result)
      throw new AuthError(404, 'This knowledge document was not found.');
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
