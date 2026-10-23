import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { LearnerChecklist } from '@/components/learner-checklist';
import { readChecklist } from '@/lib/checklists/repository';
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
  const checklist = await readChecklist(selected);
  return (
    <WorkspaceShell user={user}>
      <LearnerChecklist
        key={selected}
        initial={checklist}
        explicitRole={role === selected}
      />
    </WorkspaceShell>
  );
}
