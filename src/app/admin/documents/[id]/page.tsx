import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { inspectDocument, publishedDocument } from '@/lib/knowledge/repository';
import { ReplaceGuide } from '@/components/replace-guide';
import { IndexGuide } from '@/components/index-guide';
import { indexProgress } from '@/lib/knowledge/repository';
import { indexingLabel } from '@/lib/knowledge/types';
export const dynamic = 'force-dynamic';
export default async function DocumentInspection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser(true);
  const id = (await params).id;
  const readOnly = user.role === 'admin_demo';
  const result = await (readOnly ? publishedDocument(id) : inspectDocument(id));
  if (!result) notFound();
  const { document, version } = result;
  return (
    <WorkspaceShell user={user}>
      <Link className="back-link" href="/admin">
        ← All documents
      </Link>
      <div className="document-heading">
        <span className="section-label">ADMINISTRATOR PREVIEW</span>
        <span className="badge">{indexingLabel(version.status)}</span>
      </div>
      <h1>{document.title}</h1>
      <p className="muted">
        {document.job_role} · {version.filename}
      </p>
      {!readOnly && <ReplaceGuide id={document.id} />}
      {!readOnly && (
        <IndexGuide
          key={version.id}
          versionId={version.id}
          id={document.id}
          status={version.status}
          completed={await indexProgress(version.id)}
          total={version.chunk_count}
          failure={version.index_error}
        />
      )}
      <article className="card markdown-content" aria-label="Document content">
        <ReactMarkdown skipHtml disallowedElements={['img']}>
          {version.content}
        </ReactMarkdown>
      </article>
    </WorkspaceShell>
  );
}
