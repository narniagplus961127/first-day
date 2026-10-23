import { JOB_ROLES } from '@/lib/knowledge/types';
export type OnboardingRole = (typeof JOB_ROLES)[number];
export type ChecklistActivity = {
  role: OnboardingRole;
  completed: Partial<Record<OnboardingRole, string[]>>;
};
const KEY = 'firstday.demo.checklists.v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function emptyChecklistActivity(): ChecklistActivity {
  return { role: 'Frontend Developer', completed: {} };
}
export function loadChecklistActivity(): ChecklistActivity {
  const raw = localStorage.getItem(KEY);
  if (!raw) return emptyChecklistActivity();
  if (raw.length > 12000)
    throw new Error('Saved checklist progress is too large.');
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== 'object' ||
    !('version' in value) ||
    value.version !== 1 ||
    !('role' in value) ||
    !JOB_ROLES.includes(value.role as OnboardingRole) ||
    !('completed' in value) ||
    !value.completed ||
    typeof value.completed !== 'object' ||
    Array.isArray(value.completed)
  )
    throw new Error('Saved checklist progress is invalid.');
  const completed: ChecklistActivity['completed'] = {};
  for (const role of JOB_ROLES) {
    const entries = (value.completed as Record<string, unknown>)[role];
    if (entries === undefined) continue;
    if (
      !Array.isArray(entries) ||
      entries.length > 40 ||
      entries.some((id) => typeof id !== 'string' || !UUID.test(id))
    )
      throw new Error('Saved checklist progress is invalid.');
    completed[role] = [...new Set(entries as string[])];
  }
  return { role: value.role as OnboardingRole, completed };
}
export function saveChecklistActivity(activity: ChecklistActivity) {
  localStorage.setItem(KEY, JSON.stringify({ version: 1, ...activity }));
}
