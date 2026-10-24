import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import {
  libraryRole,
  libraryHref,
  librarySearch,
} from '@/lib/knowledge/library-filter';
import { publishedDocument } from '@/lib/knowledge/repository';
export const dynamic = 'force-dynamic';
export default async function Reader({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string | string[]; q?: string | string[] }>;
}) {
  const user = await requirePageUser();
  const result = await publishedDocument((await params).id);
  if (!result) notFound();
  const { document, version } = result;
  const query = await searchParams;
  const role = libraryRole(query.role);
  const search = librarySearch(query.q);
  const content: string = version.content;
  let fence = '';
  const headings = content.split(/\r?\n/).flatMap((line, index) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length)
        fence = '';
      return [];
    }
    if (fence) return [];
    const heading = line.match(/^ {0,3}#{1,3}\s+(.+?)(?:\s+#+\s*)?$/);
    return heading ? [{ line: index + 1, title: heading[1] }] : [];
  });
  return (
    <WorkspaceShell user={user}>
      <Link className="back-link" href={libraryHref(role, search.query)}>
        ← Knowledge library
      </Link>
      <div className="reader-layout">
        <article
          className="card reader-article"
          aria-label="Published guide"
          data-source-version={version.id}
        >
          <span className="badge">{document.job_role}</span>
          <h1>{document.title}</h1>
          <p className="muted">Published guide · {version.filename}</p>
          <div className="markdown-content">
            <ReactMarkdown
              skipHtml
              disallowedElements={['img']}
              components={{
                h1: ({ node, ...props }) => (
                  <h2
                    id={'guide-section-' + node?.position?.start.line}
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    id={'guide-section-' + node?.position?.start.line}
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    id={'guide-section-' + node?.position?.start.line}
                    {...props}
                  />
                ),
              }}
            >
              {version.content}
            </ReactMarkdown>
          </div>
        </article>
        <aside className="card reader-toc">
          <h2>IN THIS GUIDE</h2>
          <nav aria-label="In this guide">
            {headings.map((heading) => (
              <Link key={heading.line} href={'#guide-section-' + heading.line}>
                {heading.title}
              </Link>
            ))}
          </nav>
          <Link className="button secondary" href="/chat">
            Ask about this guide →
          </Link>
        </aside>
      </div>
    </WorkspaceShell>
  );
}
