import { NextResponse } from 'next/server';
import { assertSameOrigin, requireAdministrator } from '@/lib/auth';
import { httpErrorResponse } from '@/lib/http-error';
import { boundedFormData, readMarkdownFile } from '@/lib/knowledge/upload';
import { replaceDocument } from '@/lib/knowledge/repository';
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    await requireAdministrator();
    const file = await readMarkdownFile(await boundedFormData(request));
    const result = await replaceDocument((await params).id, file);
    return NextResponse.json(result, {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return httpErrorResponse(error);
  }
}
