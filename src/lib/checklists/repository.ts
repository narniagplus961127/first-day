import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { HttpError } from '@/lib/http-error';
import type { JobRole } from '@/lib/knowledge/types';
import type { Checklist, ChecklistTaskInput } from './types';
export async function readChecklist(role: JobRole): Promise<Checklist> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from('onboarding_checklists')
    .select('job_role,revision,tasks')
    .eq('job_role', role)
    .maybeSingle();
  if (error)
    throw new HttpError(
      503,
      'Checklist storage is unavailable. Please try again.',
    );
  return data ?? { job_role: role, revision: 0, tasks: [] };
}
export async function saveChecklist(
  role: JobRole,
  revision: number,
  tasks: ChecklistTaskInput[],
  seed = false,
): Promise<Checklist> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc('save_onboarding_checklist', {
    p_job_role: role,
    p_expected_revision: revision,
    p_tasks: tasks,
    p_seed: seed,
  });
  if (error) {
    if (error.code === 'PT409')
      throw new HttpError(
        409,
        'Checklist changed. Reload before saving. Your edits have been kept.',
      );
    if (error.code === 'PT400') throw new HttpError(400, error.message);
    throw new HttpError(
      503,
      'Checklist could not be saved. Your edits have been kept. Please try again.',
    );
  }
  return {
    job_role: data.job_role,
    revision: data.revision,
    tasks: data.tasks,
  };
}

export async function listChecklistGuides(
  role: JobRole,
): Promise<{ id: string; title: string }[]> {
  const client = await createSupabaseServerClient();
  const { data: documents, error } = await client
    .from('knowledge_documents')
    .select('id,title,active_version_id')
    .eq('job_role', role)
    .not('active_version_id', 'is', null)
    .order('title');
  if (error)
    throw new HttpError(503, 'Guides could not be loaded. Please try again.');
  if (!documents.length) return [];
  const { data: versions, error: versionError } = await client
    .from('knowledge_versions')
    .select('id,document_id')
    .in(
      'id',
      documents.map((document) => document.active_version_id!),
    )
    .eq('status', 'ready')
    .not('published_at', 'is', null);
  if (versionError)
    throw new HttpError(503, 'Guides could not be loaded. Please try again.');
  return documents
    .filter((document) =>
      versions.some(
        (version) =>
          version.id === document.active_version_id &&
          version.document_id === document.id,
      ),
    )
    .map(({ id, title }) => ({ id, title }));
}
