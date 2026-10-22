export const JOB_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Designer',
  'Business Analyst',
  'HR',
] as const;

export type JobRole = (typeof JOB_ROLES)[number];
export const MAX_FILE_BYTES = 100 * 1024;

export type KnowledgeDocument = {
  id: string;
  title: string;
  job_role: JobRole;
  active_version_id: string | null;
  created_at: string;
};

export type DocumentVersion = {
  id: string;
  document_id: string;
  filename: string;
  content: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  chunk_count: number;
  index_error: string | null;
  published_at: string | null;
  created_at: string;
};

export function indexingLabel(status: DocumentVersion['status']) {
  return {
    pending: 'Not indexed',
    processing: 'Indexing',
    ready: 'Ready',
    failed: 'Indexing failed',
  }[status];
}
