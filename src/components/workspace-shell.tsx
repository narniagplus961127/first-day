'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceNav } from './workspace-nav';
import { Brand } from './brand';
import { SignOutButton } from './sign-out-button';
import { ResetDemo } from './reset-demo';
import { RolePicker } from './role-picker';
import {
  loadChecklistActivity,
  rememberOnboardingRole,
  subscribeChecklistActivity,
  type OnboardingRole,
} from '@/lib/demo/checklists';
import { subscribeDemoReset } from '@/lib/demo/activity';
import type { Viewer } from '@/lib/auth';
export function WorkspaceShell({
  user,
  children,
}: {
  user: Viewer;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<OnboardingRole>('Frontend Developer');
  const [roleNotice, setRoleNotice] = useState('');
  const menu = useRef<HTMLDetailsElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const admin = user.role !== 'learner';
  const demoAdmin = user.role === 'admin_demo';
  const managing = pathname.startsWith('/admin');
  const home = admin ? '/admin' : '/workspace';
  useEffect(() => {
    const sync = () => {
      try {
        setRole(loadChecklistActivity().role);
      } catch {
        /* Existing activity notice explains storage fallback. */
      }
    };
    sync();
    const unsub = subscribeChecklistActivity(sync);
    const reset = subscribeDemoReset(sync);
    window.addEventListener('firstday-onboarding-role', sync);
    const mq = matchMedia('(max-width: 650px)');
    const resize = () => {
      if (!mq.matches) drawer.current?.close();
    };
    mq.addEventListener('change', resize);
    const menuLink = (event: MouseEvent) => {
      if (
        drawer.current?.open &&
        event.target instanceof Element &&
        drawer.current.contains(event.target) &&
        event.target.closest('a')
      ) {
        // Dismiss even when the editor cancels navigation; its draft stays intact.
        queueMicrotask(() => {
          drawer.current?.close();
          if (menu.current) menu.current.open = false;
        });
      }
    };
    document.addEventListener('click', menuLink, true);
    return () => {
      unsub();
      reset();
      window.removeEventListener('firstday-onboarding-role', sync);
      mq.removeEventListener('change', resize);
      document.removeEventListener('click', menuLink, true);
    };
  }, []);
  function closeMenu() {
    drawer.current?.close();
    if (menu.current) menu.current.open = false;
  }
  function selectRole(next: OnboardingRole) {
    setRole(next);
    try {
      rememberOnboardingRole(next);
    } catch {
      setRoleNotice('Your selected role is temporary in this tab.');
    }
    closeMenu();
    router.push('/workspace');
  }
  const navigation = <WorkspaceNav admin={admin} />;
  const mobileLinks = managing
    ? [
        ['/admin', 'Documents'],
        ['/admin/checklists', 'Checklists'],
      ]
    : [
        ['/workspace', 'Overview'],
        ['/chat', 'Ask'],
        ['/knowledge', 'Knowledge'],
        ['/checklist', 'Checklist'],
      ];
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Brand href={home} />
        <div className="sidebar-scroll">
          <span className="sidebar-caption">
            {managing ? 'ADMINISTRATION' : 'YOUR WORKSPACE'}
          </span>
          {managing ? (
            <div className="role-label">
              <strong>Administrator</strong>
              <span>{demoAdmin ? 'READ-ONLY DEMO' : 'PRIVATE MANAGEMENT'}</span>
            </div>
          ) : (
            <RolePicker role={role} onSelect={selectRole} />
          )}
          <nav className="nav" aria-label="Workspace">
            {navigation}
          </nav>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-help">
            <strong>A little help, on day one.</strong>
            <p>Answers from your team’s knowledge, with sources.</p>
          </div>
          <ResetDemo />
          <div className="account-identity">
            <span className="avatar" aria-hidden="true">
              {admin ? 'A' : 'D'}
            </span>
            <div>
              <strong>{admin ? 'Administrator' : 'Demo explorer'}</strong>
              <small>{user.email}</small>
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <details
          ref={menu}
          className="mobile-menu"
          onToggle={(e) => {
            if (e.currentTarget.open && !drawer.current?.open)
              drawer.current?.showModal();
            else if (!e.currentTarget.open) drawer.current?.close();
          }}
        >
          <summary>
            <Brand href={home} />
            <span>Menu</span>
          </summary>
          <dialog
            ref={drawer}
            className="mobile-drawer"
            aria-label="Workspace menu"
            onClose={() => {
              if (menu.current) menu.current.open = false;
            }}
          >
            <div className="drawer-heading">
              <Brand href={home} />
              <button className="text-button" onClick={closeMenu}>
                Close
              </button>
            </div>
            <span className="sidebar-caption">YOUR WORKSPACE</span>
            {!managing && <RolePicker role={role} onSelect={selectRole} />}
            <nav
              aria-label="Mobile workspace"
              onClick={(event) => {
                if (
                  !event.defaultPrevented &&
                  (event.target as HTMLElement).closest('a')
                )
                  closeMenu();
              }}
            >
              {navigation}
            </nav>
            <div className="drawer-footer">
              <ResetDemo />
              <SignOutButton />
            </div>
          </dialog>
        </details>
        <header className="workspace-header">
          <span>
            WORKSPACE /{' '}
            {managing
              ? 'ADMINISTRATION'
              : role.replace(' Developer', '').toUpperCase()}
          </span>
          <span className="badge">
            {demoAdmin
              ? 'Admin demo · Read only'
              : managing
                ? 'Private admin'
                : 'Demo workspace'}
          </span>
        </header>
        <main className="workspace-content">
          {demoAdmin && (
            <p role="status" className="notice">
              You are exploring the read-only admin demo. Browse published
              guides and checklists. Uploading, publishing and saving changes
              require a private administrator account.
            </p>
          )}
          {roleNotice && <p role="status">{roleNotice}</p>}
          {children}
        </main>
        <nav
          className="mobile-bottom-nav"
          aria-label="Primary mobile navigation"
        >
          {mobileLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                pathname === href ||
                (href !== '/admin' && pathname.startsWith(href + '/')) ||
                (href === '/admin' &&
                  pathname.startsWith('/admin/documents/')) ||
                (href === '/chat' && pathname.startsWith('/sources/'))
                  ? 'page'
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
