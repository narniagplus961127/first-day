import { HttpError } from '@/lib/http-error';
import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { listDocuments } from '@/lib/knowledge/repository';
import { LearnerOverview } from '@/components/learner-overview';
export const dynamic = 'force-dynamic';
export default async function Workspace() {
  const user = await requirePageUser();
  let guideCount: number | undefined;
  try {
    guideCount = (await listDocuments()).filter(
      (guide) => guide.active_version_id,
    ).length;
  } catch (error) {
    if (!(error instanceof HttpError)) throw error;
  }
  return (
    <WorkspaceShell user={user}>
      <LearnerOverview guideCount={guideCount} />
    </WorkspaceShell>
  );
}
