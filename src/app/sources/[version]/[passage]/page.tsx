import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { requirePageUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { WorkspaceShell } from '@/components/workspace-shell';
export const dynamic = 'force-dynamic';
export default async function Source({
  params,
}: {
  params: Promise<{ version: string; passage: string }>;
}) {
  const user = await requirePageUser();
  const { version, passage } = await params;
  if (
    ![version, passage].every((id) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      ),
    )
  )
    notFound();
  const client = await createSupabaseServerClient();
  const { data: v } = await client
    .from('knowledge_versions')
    .select('id,document_id,filename,content')
    .eq('id', version)
    .eq('status', 'ready')
    .not('published_at', 'is', null)
    .maybeSingle();
  if (!v) notFound();
  const [{ data: p }, { data: d }] = await Promise.all([
    client
      .from('knowledge_chunks')
      .select('id,heading,content,start_line,end_line')
      .eq('id', passage)
      .eq('version_id', version)
      .maybeSingle(),
    client
      .from('knowledge_documents')
      .select('id,title,job_role')
      .eq('id', v.document_id)
      .maybeSingle(),
  ]);
  if (!p || !d) notFound();
  return (
    <WorkspaceShell user={user}>
      <Link className="back-link" href="/chat">
        ← Ask FirstDay
      </Link>
      <h1>{d.title}</h1>
      <p className="muted">
        {d.job_role} · {v.filename}
      </p>
      <p className="source-identity">
        Source version: {v.id} · Lines {p.start_line}–{p.end_line}
      </p>
      <h2>{p.heading || 'Supporting passage'}</h2>
      <article
        aria-label="Supporting passage"
        className="card markdown-content"
        data-source-version={v.id}
      >
        <ReactMarkdown skipHtml disallowedElements={['img']}>
          {p.content}
        </ReactMarkdown>
      </article>
      <details className="full-source">
        <summary>Read this document version in full</summary>
        <article className="markdown-content">
          <ReactMarkdown skipHtml disallowedElements={['img']}>
            {v.content}
          </ReactMarkdown>
        </article>
      </details>
    </WorkspaceShell>
  );
}
