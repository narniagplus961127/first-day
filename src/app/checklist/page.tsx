import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { LearnerChecklist } from '@/components/learner-checklist';
import {
  readChecklist,
  listChecklistGuides,
} from '@/lib/checklists/repository';
import { JOB_ROLES } from '@/lib/knowledge/types';
export const dynamic = 'force-dynamic';
export default async function ChecklistPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await requirePageUser();
  const { role } = await searchParams;
  const selected = JOB_ROLES.find((value) => value === role) ?? JOB_ROLES[0];
  const [checklist, guides] = await Promise.all([
    readChecklist(selected),
    listChecklistGuides(selected),
  ]);
  return (
    <WorkspaceShell user={user}>
      <LearnerChecklist
        key={selected}
        initial={checklist}
        guides={guides}
        explicitRole={role === selected}
      />
    </WorkspaceShell>
  );
}
