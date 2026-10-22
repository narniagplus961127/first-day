import Link from 'next/link';
import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
export default async function UnavailableSource() {
  const user = await requirePageUser();
  return (
    <WorkspaceShell user={user}>
      <h1>Source unavailable</h1>
      <p>
        The original version may have expired from the three-version history.
        Ask a new question to inspect current evidence.
      </p>
      <Link className="button primary" href="/chat">
        Ask FirstDay
      </Link>
    </WorkspaceShell>
  );
}
