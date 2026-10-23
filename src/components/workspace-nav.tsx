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
        ['/checklist', 'Checklist'],
        ['/knowledge', 'Knowledge library'],
        ['/chat', 'Ask FirstDay'],
      ]
    : [
        ['/workspace', 'Overview'],
        ['/checklist', 'Checklist'],
        ['/knowledge', 'Knowledge library'],
        ['/chat', 'Ask FirstDay'],
      ];
  return (
    <>
      {links.map(([href, label]) => {
        const active =
          pathname === href ||
          (href !== '/workspace' && pathname.startsWith(href + '/')) ||
          (href === '/chat' && pathname.startsWith('/sources/'));
        return (
          <Link
            key={href}
            href={href}
            className={active ? 'active' : undefined}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
