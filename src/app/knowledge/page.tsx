import Link from 'next/link';
import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { listDocuments } from '@/lib/knowledge/repository';
export const dynamic = 'force-dynamic';
export default async function Knowledge() {
  const user = await requirePageUser();
  const documents = (await listDocuments()).filter((d) => d.active_version_id);
  return (
    <WorkspaceShell user={user}>
      <span className="section-label">YOUR KNOWLEDGE LIBRARY</span>
      <h1>Find your next step.</h1>
      <p className="muted">
        Explore published onboarding guides across all five roles.
      </p>
      {documents.length ? (
        <div className="document-grid">
          {documents.map((d) => (
            <article className="card" key={d.id}>
              <span className="badge">{d.job_role}</span>
              <h2>
                <Link href={`/knowledge/${d.id}`}>{d.title}</Link>
              </h2>
              <p className="muted">Ready to explore →</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="notice">
          No guides have been published yet. Check back after your administrator
          indexes the first guide.
        </p>
      )}
    </WorkspaceShell>
  );
}
