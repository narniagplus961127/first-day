import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { HttpError, httpErrorResponse } from '@/lib/http-error';
import { JOB_ROLES } from '@/lib/knowledge/types';
import { readChecklist } from '@/lib/checklists/repository';
export async function GET(request: Request) {
  try {
    await requireUser();
    const role = JOB_ROLES.find(
      (role) => role === new URL(request.url).searchParams.get('role'),
    );
    if (!role)
      throw new HttpError(400, 'Choose one of the five supported job roles.');
    return NextResponse.json(await readChecklist(role), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return httpErrorResponse(error);
  }
}
