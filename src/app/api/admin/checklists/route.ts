import { NextResponse } from 'next/server';
import { assertSameOrigin, requireAdministrator } from '@/lib/auth';
import { HttpError, httpErrorResponse } from '@/lib/http-error';
import { readBoundedBody } from '@/lib/request-body';
import { checklistSaveInput, STARTER_TASKS } from '@/lib/checklists/types';
import { saveChecklist } from '@/lib/checklists/repository';
export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdministrator();
    const bytes = await readBoundedBody(request.body, 256 * 1024, {
      missing: 'Enter a checklist.',
      tooLarge: 'Checklist request must be at most 256 KiB.',
    });
    let input: unknown;
    try {
      input = JSON.parse(bytes.toString('utf8'));
    } catch {
      throw new HttpError(400, 'Enter a valid checklist.');
    }
    const parsed = checklistSaveInput.safeParse(input);
    if (!parsed.success)
      throw new HttpError(
        400,
        'Check task titles (1–120 characters), stages, instructions (at most 2000 characters), identities and saved revision. Use at most 40 tasks.',
      );
    const { jobRole, expectedRevision, tasks } = parsed.data;
    return NextResponse.json(
      await saveChecklist(jobRole, expectedRevision, tasks),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return httpErrorResponse(error);
  }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdministrator();
    return NextResponse.json(
      await saveChecklist('Frontend Developer', 0, STARTER_TASKS, true),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return httpErrorResponse(error);
  }
}
