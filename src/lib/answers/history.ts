import 'server-only';
import { HttpError } from '@/lib/http-error';
import type { ConversationScope, HistoryExchange } from './types';

export function parseHistory(
  value: unknown,
  scope: ConversationScope,
): HistoryExchange[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 3)
    throw new HttpError(
      400,
      'Send at most three completed exchanges from the selected scope.',
    );
  return value.map((item: unknown) => {
    if (!item || typeof item !== 'object')
      throw new HttpError(400, 'Send valid completed conversation exchanges.');
    const entry = item as Record<string, unknown>;
    if (
      entry.scope !== scope ||
      typeof entry.question !== 'string' ||
      !entry.question.trim() ||
      entry.question.length > 1000 ||
      typeof entry.answer !== 'string' ||
      !entry.answer.trim() ||
      entry.answer.length > 2000
    )
      throw new HttpError(
        400,
        'History must match the selected scope, with questions up to 1000 and answers up to 2000 characters.',
      );
    return {
      scope,
      question: entry.question.trim(),
      answer: entry.answer.trim(),
    };
  });
}
