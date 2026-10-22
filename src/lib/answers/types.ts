import type { JobRole } from '@/lib/knowledge/types';
export type ConversationScope = JobRole | 'All roles';
export type HistoryExchange = {
  scope: ConversationScope;
  question: string;
  answer: string;
};
export type Citation = {
  id: string;
  versionId: string;
  documentId: string;
  title: string;
  heading: string;
  startLine: number;
  endLine: number;
  href: string;
};
export type AnswerClaim = { text: string; citations: Citation[] };
export type AnswerResult = {
  status: 'answered' | 'no_evidence';
  answer: string;
  claims: AnswerClaim[];
};
