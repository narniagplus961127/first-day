import Link from 'next/link';
import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { listDocuments } from '@/lib/knowledge/repository';
import { JOB_ROLES } from '@/lib/knowledge/types';
import {
  libraryRole,
  librarySearch,
  libraryHref,
} from '@/lib/knowledge/library-filter';
export const dynamic = 'force-dynamic';
export default async function Knowledge({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[]; q?: string | string[] }>;
}) {
  const user = await requirePageUser();
  const query = await searchParams;
  const role = libraryRole(query.role);
  const search = librarySearch(query.q);
  const titleQuery = search.query.toLowerCase();
  const documents = search.error
    ? []
    : (await listDocuments()).filter(
        (d) =>
          d.active_version_id &&
          (!role || d.job_role === role) &&
          d.title.toLowerCase().includes(titleQuery),
      );
  return (
    <WorkspaceShell user={user}>
      <span className="section-label">YOUR KNOWLEDGE LIBRARY</span>
      <h1>Find your next step.</h1>
      <p className="muted">
        Explore published onboarding guides across all five roles.
      </p>
      <form
        className="library-filters native-library-filters"
        key={JSON.stringify([role, search.query])}
        action="/knowledge"
        method="get"
      >
        <div>
          <label htmlFor="library-role">Filter guides by role</label>
          <select id="library-role" name="role" defaultValue={role || ''}>
            <option value="">All roles</option>
            {JOB_ROLES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="library-search">Search guide titles</label>
          <input
            id="library-search"
            type="search"
            name="q"
            maxLength={200}
            defaultValue={search.query}
            placeholder="Search by guide title"
            aria-describedby={search.error ? 'library-search-error' : undefined}
            aria-invalid={Boolean(search.error)}
          />
        </div>
        <button className="button primary" type="submit">
          Apply filters
        </button>
        {role && (
          <Link
            className="button secondary"
            href={libraryHref(undefined, search.query)}
          >
            Clear role
          </Link>
        )}
        {search.query && (
          <Link className="button secondary" href={libraryHref(role)}>
            Clear search
          </Link>
        )}
        {(role || search.query || search.error) && (
          <Link className="button secondary" href="/knowledge">
            Clear filters
          </Link>
        )}
      </form>
      <nav className="library-role-tabs" aria-label="Guide roles">
        {[
          ['', 'All roles'],
          ...JOB_ROLES.map((value) => [
            value,
            value
              .replace(' Developer', '')
              .replace('Designer', 'Design')
              .replace('Business Analyst', 'Business analysis'),
          ]),
        ].map(([value, label]) => (
          <Link
            key={value}
            href={libraryHref(
              JOB_ROLES.find((item) => item === value),
              search.query,
            )}
            aria-current={(role || '') === value ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      {query.role && !role && (
        <p className="notice">Unknown role filter. Showing all roles.</p>
      )}
      {search.error && (
        <p id="library-search-error" className="notice" role="alert">
          {search.error}
        </p>
      )}
      {search.error ? null : documents.length ? (
        <div className="document-grid">
          {documents.map((d) => (
            <article className="card library-card" key={d.id}>
              <span className="badge">{d.job_role}</span>
              <h2>
                <Link
                  href={libraryHref(role, search.query).replace(
                    '/knowledge',
                    `/knowledge/${d.id}`,
                  )}
                >
                  {d.title}
                </Link>
              </h2>
              <p className="muted">
                A practical guide to your tools, team habits, and next steps.
              </p>
              <Link
                className="document-link"
                href={libraryHref(role, search.query).replace(
                  '/knowledge',
                  '/knowledge/' + d.id,
                )}
              >
                Read guide →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="notice" role="status">
          {search.query
            ? 'No published guides match these filters. Change the title search or clear a filter.'
            : role
              ? `No published guides for ${role} yet. Clear filters to explore other roles.`
              : 'No guides have been published yet. Check back after your administrator indexes the first guide.'}
        </p>
      )}
    </WorkspaceShell>
  );
}
