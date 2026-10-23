import { activityGeneration, LEGACY_GENERATION } from '@/lib/demo/activity';
import { JOB_ROLES, type JobRole } from '@/lib/knowledge/types';
const KEY = 'firstday.demo.task-handoff.v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type TaskIntent = {
  generation?: string;
  nonce: string;
  role: JobRole;
  taskId: string;
  createdAt: number;
};
export function beginTaskQuestion(role: JobRole, taskId: string): string {
  const nonce = crypto.randomUUID();
  const intent: TaskIntent = {
    nonce,
    role,
    taskId,
    createdAt: Date.now(),
    generation: activityGeneration(),
  };
  sessionStorage.setItem(KEY, JSON.stringify(intent));
  return '/chat?taskIntent=' + nonce;
}
// Consume before asynchronous work or confirmation: back, refresh and cancel cannot replay it.
export function consumeTaskQuestion(nonce: string): TaskIntent | null {
  const raw = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  if (!UUID.test(nonce) || !raw || raw.length > 512) return null;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const intent = value as Partial<TaskIntent>;
  if (
    (intent.generation ?? LEGACY_GENERATION) !== activityGeneration() ||
    intent.nonce !== nonce ||
    !JOB_ROLES.includes(intent.role as JobRole) ||
    typeof intent.taskId !== 'string' ||
    !UUID.test(intent.taskId) ||
    typeof intent.createdAt !== 'number' ||
    Date.now() - intent.createdAt < 0 ||
    Date.now() - intent.createdAt > 300000
  )
    return null;
  return intent as TaskIntent;
}
