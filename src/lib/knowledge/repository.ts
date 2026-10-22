import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AuthError } from '@/lib/auth';
import type { DocumentVersion, KnowledgeDocument } from './types';

function storageError() {
  return new AuthError(
    503,
    'Knowledge storage is temporarily unavailable. Please try again.',
  );
}

export async function listDocuments(): Promise<KnowledgeDocument[]> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from('knowledge_documents')
    .select('id,title,job_role,active_version_id,created_at')
    .order('created_at', { ascending: false });
  if (error) throw storageError();
  return data;
}

export async function inspectDocument(id: string): Promise<{
  document: KnowledgeDocument;
  version: DocumentVersion;
} | null> {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return null;
  const client = await createSupabaseServerClient();
  const { data: document, error } = await client
    .from('knowledge_documents')
    .select('id,title,job_role,active_version_id,created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw storageError();
  if (!document) return null;
  const { data: version, error: versionError } = await client
    .from('knowledge_versions')
    .select(
      'id,document_id,filename,content,status,created_at,chunk_count,index_error,published_at',
    )
    .eq('document_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (versionError) throw storageError();
  return version ? { document, version } : null;
}

export async function saveDocument(input: {
  title: string;
  jobRole: string;
  filename: string;
  content: string;
}): Promise<{ document: KnowledgeDocument; version: DocumentVersion }> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc('create_knowledge_document', {
    p_title: input.title,
    p_job_role: input.jobRole,
    p_filename: input.filename,
    p_content: input.content,
  });
  if (error) throw storageError();
  return data;
}

export async function publishedDocument(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const client = await createSupabaseServerClient();
  const { data: document, error } = await client
    .from('knowledge_documents')
    .select('id,title,job_role,active_version_id,created_at')
    .eq('id', id)
    .not('active_version_id', 'is', null)
    .maybeSingle();
  if (error) throw storageError();
  if (!document) return null;
  const { data: version, error: versionError } = await client
    .from('knowledge_versions')
    .select(
      'id,document_id,filename,content,status,created_at,chunk_count,index_error,published_at',
    )
    .eq('id', document.active_version_id)
    .eq('status', 'ready')
    .not('published_at', 'is', null)
    .maybeSingle();
  if (versionError) throw storageError();
  return version ? { document, version } : null;
}
export async function indexProgress(versionId: string) {
  const client = await createSupabaseServerClient();
  const { count, error } = await client
    .from('knowledge_chunks')
    .select('id', { count: 'exact', head: true })
    .eq('version_id', versionId)
    .not('embedding', 'is', null);
  if (error) throw storageError();
  return count || 0;
}
