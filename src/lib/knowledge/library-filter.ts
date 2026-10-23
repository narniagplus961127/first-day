import { JOB_ROLES, type JobRole } from './types';

// URL state is relevance only; it never grants or limits read permission.
export function libraryRole(
  value: string | string[] | undefined,
): JobRole | undefined {
  return typeof value === 'string'
    ? JOB_ROLES.find((role) => role === value)
    : undefined;
}

export function librarySearch(value: string | string[] | undefined) {
  if (Array.isArray(value))
    return { query: '', error: 'Use a single title search.' };
  const query = value?.trim() || '';
  if (query.length > 200)
    return {
      query: '',
      error: 'Title search must be 200 characters or fewer.',
    };
  return { query, error: undefined };
}

export function libraryHref(role: JobRole | undefined, query = '') {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (query) params.set('q', query);
  return '/knowledge' + (params.size ? '?' + params.toString() : '');
}
