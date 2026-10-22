import { requirePageUser } from '@/lib/auth';
import { HttpError } from '@/lib/http-error';
import { WorkspaceShell } from '@/components/workspace-shell';
import Link from 'next/link';
import { listDocuments } from '@/lib/knowledge/repository';
import { UploadForm } from './upload-form';
import type { KnowledgeDocument } from '@/lib/knowledge/types';
export const dynamic = 'force-dynamic';
export default async function Admin() {
  const user = await requirePageUser(true);
  let documents: KnowledgeDocument[] = [];
  let storageError = '';
  try {
    documents = await listDocuments();
  } catch (error) {
    if (!(error instanceof HttpError)) throw error;
    storageError = error.message;
  }
  return (
    <WorkspaceShell user={user}>
      <h1>Good onboarding starts with good knowledge.</h1>
      <p className="muted">
        A private space to maintain your team’s onboarding guides.
      </p>
      <UploadForm />
      <section className="knowledge-list" aria-label="Knowledge documents">
        <h2>Knowledge documents</h2>
        <p className="muted">Inspect your uploaded guides before publishing.</p>
        {storageError ? (
          <p className="error" role="alert">
            {storageError}
          </p>
        ) : documents.length ? (
          <div className="document-grid">
            {documents.map((document) => (
              <Link
                href={'/admin/documents/' + document.id}
                className="card document-card"
                key={document.id}
              >
                <span className="badge">{document.job_role}</span>
                <h3>{document.title}</h3>
                <span className="document-link">Inspect document →</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="notice">
            No guides uploaded yet. Add your first Markdown document above.
          </p>
        )}
      </section>
    </WorkspaceShell>
  );
}
