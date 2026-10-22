import { NextResponse } from 'next/server';
import {
  assertSameOrigin,
  authErrorResponse,
  AuthError,
  requireUser,
} from '@/lib/auth';
import { JOB_ROLES, type JobRole } from '@/lib/knowledge/types';
import { answerQuestion } from '@/lib/answers/answer';
import { parseHistory } from '@/lib/answers/history';
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireUser();
    const reader = request.body?.getReader();
    if (!reader) throw new AuthError(400, 'Enter a question.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32768) {
        await reader.cancel();
        throw new AuthError(413, 'The question request is too large.');
      }
      chunks.push(value);
    }
    let input;
    try {
      input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      throw new AuthError(400, 'Send a valid question.');
    }
    if (
      !input ||
      typeof input.question !== 'string' ||
      !input.question.trim() ||
      input.question.length > 1000
    )
      throw new AuthError(400, 'Enter a question of up to 1000 characters.');
    if (input.scope !== 'All roles' && !JOB_ROLES.includes(input.scope))
      throw new AuthError(400, 'Choose a supported job role or All roles.');
    const history = parseHistory(input.history, input.scope);
    return NextResponse.json(
      await answerQuestion(
        input.question.trim(),
        input.scope as JobRole | 'All roles',
        history,
      ),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
