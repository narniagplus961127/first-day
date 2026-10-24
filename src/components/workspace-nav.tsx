'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export function WorkspaceNav({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const links = admin
    ? [
        ['/admin', 'Documents'],
        ['/admin/checklists', 'Manage checklists'],
        ['/workspace', 'Learner workspace'],
        ['/chat', 'Ask FirstDay'],
        ['/knowledge', 'Knowledge library'],
        ['/checklist', 'Checklist'],
      ]
    : [
        ['/workspace', 'Overview'],
        ['/chat', 'Ask FirstDay'],
        ['/knowledge', 'Knowledge library'],
        ['/checklist', 'Checklist'],
      ];
  const activeHref = links
    .filter(
      ([href]) =>
        pathname === href ||
        (href !== '/workspace' && pathname.startsWith(href + '/')) ||
        (href === '/chat' && pathname.startsWith('/sources/')),
    )
    .sort(([left], [right]) => right.length - left.length)[0]?.[0];
  return (
    <>
      {links.map(([href, label], index) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={active ? 'active' : undefined}
            aria-current={active ? 'page' : undefined}
          >
            <span className="nav-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>
              {label === 'Knowledge library'
                ? 'Knowledge'
                : label === 'Checklist'
                  ? 'My checklist'
                  : label}
            </span>
          </Link>
        );
      })}
    </>
  );
}
