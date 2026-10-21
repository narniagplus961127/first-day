import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
export const dynamic = 'force-dynamic';
export default async function Admin() {
  const user = await requirePageUser(true);
  return (
    <WorkspaceShell user={user}>
      <h1>Good onboarding starts with good knowledge.</h1>
      <p className="muted">
        A private space to maintain your team’s onboarding guides.
      </p>
      <section className="card empty">
        <span className="section-label">KNOWLEDGE MANAGEMENT</span>
        <h2>Your workspace is ready.</h2>
        <p>
          Document upload and publishing will be added in the next
          implementation slice.
        </p>
      </section>
    </WorkspaceShell>
  );
}
