import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { publishedDocument } from '@/lib/knowledge/repository';
export const dynamic = 'force-dynamic';
export default async function Reader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser();
  const result = await publishedDocument((await params).id);
  if (!result) notFound();
  const { document, version } = result;
  return (
    <WorkspaceShell user={user}>
      <Link className="back-link" href="/knowledge">
        ← Knowledge library
      </Link>
      <h1>{document.title}</h1>
      <p className="muted">
        {document.job_role} · {version.filename}
      </p>
      <article
        className="card markdown-content"
        aria-label="Published guide"
        data-source-version={version.id}
      >
        <ReactMarkdown skipHtml disallowedElements={['img']}>
          {version.content}
        </ReactMarkdown>
      </article>
    </WorkspaceShell>
  );
}
