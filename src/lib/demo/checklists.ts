import {
  activityKey,
  readActivity,
  writeActivity,
  activityKeys,
  invalidActivity,
  activityGeneration,
  LEGACY_GENERATION,
} from '@/lib/demo/activity';
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
function loadLegacyActivity(): ChecklistActivity {
  const raw = readActivity(activityKey(KEY));
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

const ROLE_KEY = 'firstday.demo.checklists.role.v2';
const TASK_PREFIX = 'firstday.demo.checklists.task.v2.';
const MAX_RETAINED_TASKS = 1000;
function taskKeys() {
  const keys = activityKeys().filter((key) =>
    key.startsWith(activityKey(TASK_PREFIX)),
  );
  if (keys.length > MAX_RETAINED_TASKS)
    throw new Error('Saved checklist progress is too large.');
  return keys;
}
function readChecklistActivity(): ChecklistActivity {
  const activity =
    activityGeneration() === LEGACY_GENERATION
      ? loadLegacyActivity()
      : emptyChecklistActivity();
  const role = readActivity(activityKey(ROLE_KEY));
  if (role !== null) {
    if (!JOB_ROLES.includes(role as OnboardingRole))
      throw new Error('Saved checklist role is invalid.');
    activity.role = role as OnboardingRole;
  }
  for (const key of taskKeys()) {
    const suffix = key.slice(activityKey(TASK_PREFIX).length);
    const match = /^([0-4])\.([0-9a-f-]{36})$/i.exec(suffix);
    const value = readActivity(key);
    // Quarantined or concurrently removed records are absent, not fresh corruption.
    if (value === null) continue;
    if (!match || !UUID.test(match[2]) || (value !== '1' && value !== '0'))
      throw new Error('Saved checklist progress is invalid.');
    const taskRole = JOB_ROLES[Number(match[1])];
    const completed = new Set(activity.completed[taskRole] || []);
    if (value === '1') completed.add(match[2]);
    else completed.delete(match[2]);
    activity.completed[taskRole] = [...completed];
  }
  return activity;
}
export function rememberOnboardingRole(role: OnboardingRole) {
  if (!JOB_ROLES.includes(role)) throw new Error('Invalid onboarding role.');
  writeActivity(activityKey(ROLE_KEY), role);
}
export function changeChecklistTask(
  role: OnboardingRole,
  id: string,
  complete: boolean,
) {
  if (
    !JOB_ROLES.includes(role) ||
    !UUID.test(id) ||
    typeof complete !== 'boolean'
  )
    throw new Error('Invalid checklist task change.');
  const key = activityKey(TASK_PREFIX) + JOB_ROLES.indexOf(role) + '.' + id;
  const keys = taskKeys();
  if (keys.length >= MAX_RETAINED_TASKS && !keys.includes(key))
    throw new Error('Saved checklist progress is too large.');
  // One atomic storage operation per task keeps unrelated tab updates independent.
  // Explicit false values also override completion in supported legacy snapshots.
  writeActivity(key, complete ? '1' : '0');
}
export function subscribeChecklistActivity(onChange: () => void) {
  function receive(event: StorageEvent) {
    if (
      event.key === null ||
      event.key === activityKey(KEY) ||
      event.key === activityKey(ROLE_KEY) ||
      event.key.startsWith(activityKey(TASK_PREFIX))
    )
      onChange();
  }
  window.addEventListener('storage', receive);
  return () => window.removeEventListener('storage', receive);
}

export function loadChecklistActivity(): ChecklistActivity {
  try {
    return readChecklistActivity();
  } catch {
    for (const key of [
      activityKey(KEY),
      activityKey(ROLE_KEY),
      ...activityKeys().filter((key) =>
        key.startsWith(activityKey(TASK_PREFIX)),
      ),
    ])
      invalidActivity(key);
    return emptyChecklistActivity();
  }
}
