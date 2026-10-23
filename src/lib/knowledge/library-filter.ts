import { JOB_ROLES, type JobRole } from './types';

// URL state is relevance only; it never grants or limits read permission.
export function libraryRole(
  value: string | string[] | undefined,
): JobRole | undefined {
  return typeof value === 'string'
    ? JOB_ROLES.find((role) => role === value)
    : undefined;
}

export function libraryHref(role: JobRole | undefined) {
  return role
    ? '/knowledge?' + new URLSearchParams({ role }).toString()
    : '/knowledge';
}
