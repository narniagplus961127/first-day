import { JOB_ROLES } from '@/lib/knowledge/types';
import type {
  AnswerClaim,
  AnswerResult,
  Citation,
  ConversationScope,
} from '@/lib/answers/types';

const STORAGE_KEY = 'firstday.demo.conversations.v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CONVERSATION_SCOPES: ConversationScope[] = [
  ...JOB_ROLES,
  'All roles',
];
export type Exchange = { id: string; question: string; result: AnswerResult };
export type Conversations = Partial<Record<ConversationScope, Exchange[]>>;
export type QuestionDrafts = Partial<Record<ConversationScope, string>>;
export type DemoConversations = {
  scope: ConversationScope;
  conversations: Conversations;
  drafts?: QuestionDrafts;
};
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function citation(value: unknown): Citation | null {
  if (!record(value)) return null;
  const { id, versionId, documentId, title, heading, startLine, endLine } =
    value;
  if (
    typeof id !== 'string' ||
    !UUID.test(id) ||
    typeof versionId !== 'string' ||
    !UUID.test(versionId) ||
    typeof documentId !== 'string' ||
    !UUID.test(documentId) ||
    typeof title !== 'string' ||
    title.length > 200 ||
    typeof heading !== 'string' ||
    heading.length > 12000 ||
    typeof startLine !== 'number' ||
    !Number.isInteger(startLine) ||
    startLine < 1 ||
    typeof endLine !== 'number' ||
    !Number.isInteger(endLine) ||
    endLine < startLine
  )
    return null;
  return {
    id,
    versionId,
    documentId,
    title,
    heading,
    startLine,
    endLine,
    href: '/sources/' + versionId + '/' + id,
  };
}
function result(value: unknown): AnswerResult | null {
  if (
    !record(value) ||
    !['answered', 'no_evidence'].includes(String(value.status)) ||
    typeof value.answer !== 'string' ||
    value.answer.length > 10000 ||
    !Array.isArray(value.claims) ||
    value.claims.length > 6
  )
    return null;
  const claims: AnswerClaim[] = [];
  for (const claim of value.claims) {
    if (
      !record(claim) ||
      typeof claim.text !== 'string' ||
      !claim.text.trim() ||
      claim.text.length > 1500 ||
      !Array.isArray(claim.citations) ||
      claim.citations.length < 1 ||
      claim.citations.length > 3
    )
      return null;
    const citations = claim.citations.map(citation);
    if (citations.some((c) => c === null)) return null;
    claims.push({ text: claim.text, citations: citations as Citation[] });
  }
  if (
    (value.status === 'answered' && !claims.length) ||
    (value.status === 'no_evidence' && claims.length)
  )
    return null;
  return {
    status: value.status as AnswerResult['status'],
    answer:
      value.status === 'answered'
        ? claims.map((c) => c.text).join('\n\n')
        : value.answer,
    claims,
  };
}
export function loadConversations(): DemoConversations {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { scope: 'Frontend Developer', conversations: {} };
  if (raw.length > 2000000)
    throw new Error('Stored conversation is too large.');
  const value: unknown = JSON.parse(raw);
  if (!record(value) || value.version !== 1 || !record(value.conversations))
    throw new Error('Stored conversation is invalid.');
  const conversations: Conversations = {};
  for (const scope of CONVERSATION_SCOPES) {
    const entries = value.conversations[scope];
    if (!Array.isArray(entries)) continue;
    conversations[scope] = entries.slice(-20).flatMap((entry: unknown) => {
      if (
        !record(entry) ||
        typeof entry.id !== 'string' ||
        !UUID.test(entry.id) ||
        typeof entry.question !== 'string' ||
        !entry.question.trim() ||
        entry.question.length > 1000
      )
        return [];
      const restored = result(entry.result);
      return restored
        ? [{ id: entry.id, question: entry.question, result: restored }]
        : [];
    });
  }
  const scope = CONVERSATION_SCOPES.includes(value.scope as ConversationScope)
    ? (value.scope as ConversationScope)
    : 'Frontend Developer';
  const drafts: QuestionDrafts = {};
  if (record(value.drafts)) {
    for (const draftScope of CONVERSATION_SCOPES) {
      const draft = value.drafts[draftScope];
      if (typeof draft === 'string' && draft.length <= 1000)
        drafts[draftScope] = draft;
    }
  }
  return { scope, conversations, drafts };
}
export function saveConversations(state: DemoConversations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...state }));
}
export function resetDemoActivity() {
  for (const key of Object.keys(localStorage))
    if (key.startsWith('firstday.demo.')) localStorage.removeItem(key);
}
