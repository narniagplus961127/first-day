import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { LearnerOverview } from '@/components/learner-overview';
export const dynamic = 'force-dynamic';
export default async function Workspace() {
  const user = await requirePageUser();
  return (
    <WorkspaceShell user={user}>
      <LearnerOverview />
    </WorkspaceShell>
  );
}
