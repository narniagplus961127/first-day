import { readBoundedBody } from '@/lib/request-body';
import { NextResponse } from 'next/server';
import { assertSameOrigin, requireUser } from '@/lib/auth';
import { httpErrorResponse, HttpError } from '@/lib/http-error';
import { JOB_ROLES, type JobRole } from '@/lib/knowledge/types';
import { answerQuestion } from '@/lib/answers/answer';
import { parseHistory } from '@/lib/answers/history';
import { admitQuestion } from '@/lib/demo/admission';
export const maxDuration = 90;
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireUser();
    const body = await readBoundedBody(request.body, 32768, {
      missing: 'Enter a question.',
      tooLarge: 'The question request is too large.',
    });
    let input;
    try {
      input = JSON.parse(body.toString('utf8'));
    } catch {
      throw new HttpError(400, 'Send a valid question.');
    }
    if (
      !input ||
      typeof input.question !== 'string' ||
      !input.question.trim() ||
      input.question.length > 1000
    )
      throw new HttpError(400, 'Enter a question of up to 1000 characters.');
    if (input.scope !== 'All roles' && !JOB_ROLES.includes(input.scope))
      throw new HttpError(400, 'Choose a supported job role or All roles.');
    const history = parseHistory(input.history, input.scope);
    await admitQuestion(request);
    return NextResponse.json(
      await answerQuestion(
        input.question.trim(),
        input.scope as JobRole | 'All roles',
        history,
      ),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return httpErrorResponse(error);
  }
}
