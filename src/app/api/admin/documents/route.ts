import { NextResponse } from 'next/server';
import { assertSameOrigin, requireAdministrator } from '@/lib/auth';
import { HttpError, httpErrorResponse } from '@/lib/http-error';
import { JOB_ROLES } from '@/lib/knowledge/types';
import { boundedFormData, readMarkdownFile } from '@/lib/knowledge/upload';
import { listDocuments, saveDocument } from '@/lib/knowledge/repository';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdministrator();
    const form = await boundedFormData(request);
    const { filename, content } = await readMarkdownFile(form);
    const title = form.get('title');
    const jobRole = form.get('jobRole');
    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.trim().length > 160
    ) {
      throw new HttpError(
        400,
        'Enter a document title between 1 and 160 characters.',
      );
    }
    if (
      typeof jobRole !== 'string' ||
      !JOB_ROLES.some((role) => role === jobRole)
    ) {
      throw new HttpError(400, 'Choose one of the five supported job roles.');
    }
    const result = await saveDocument({
      title: title.trim(),
      jobRole,
      filename,
      content,
    });
    return NextResponse.json(result, {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return httpErrorResponse(error);
  }
}

export async function GET() {
  try {
    await requireAdministrator();
    return NextResponse.json(
      { documents: await listDocuments() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return httpErrorResponse(error);
  }
}
