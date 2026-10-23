import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import {
  readChecklist,
  listChecklistGuides,
} from '@/lib/checklists/repository';
import { JOB_ROLES } from '@/lib/knowledge/types';
export const dynamic = 'force-dynamic';
export default async function TaskGuide({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; task?: string }>;
}) {
  const user = await requirePageUser();
  const query = await searchParams;
  const role = JOB_ROLES.find((role) => role === query.role);
  if (role) {
    const [checklist, guides] = await Promise.all([
      readChecklist(role),
      listChecklistGuides(role),
    ]);
    const task = checklist.tasks.find((task) => task.id === query.task);
    if (task?.guideId && guides.some((guide) => guide.id === task.guideId))
      redirect('/knowledge/' + task.guideId);
  }
  return (
    <WorkspaceShell user={user}>
      <h1>Guide unavailable</h1>
      <p>
        This task’s guide is no longer available. Your checklist progress has
        been kept.
      </p>
      <Link
        href={'/checklist' + (role ? '?role=' + encodeURIComponent(role) : '')}
      >
        Back to checklist
      </Link>
    </WorkspaceShell>
  );
}
