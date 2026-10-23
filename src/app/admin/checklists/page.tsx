import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { ChecklistView } from '@/components/checklist-view';
import {
  readChecklist,
  listChecklistGuides,
} from '@/lib/checklists/repository';
import { JOB_ROLES } from '@/lib/knowledge/types';
export const dynamic = 'force-dynamic';
export default async function AdminChecklistPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await requirePageUser(true);
  const { role } = await searchParams;
  const selected = JOB_ROLES.find((value) => value === role) ?? JOB_ROLES[0];
  const [checklist, guides] = await Promise.all([
    readChecklist(selected),
    listChecklistGuides(selected),
  ]);
  return (
    <WorkspaceShell user={user}>
      <ChecklistView key={selected} initial={checklist} guides={guides} />
    </WorkspaceShell>
  );
}
