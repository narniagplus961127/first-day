import Link from 'next/link';
import { Brand } from './brand';
import { SignOutButton } from './sign-out-button';
import type { Viewer } from '@/lib/auth';
export function WorkspaceShell({
  user,
  children,
}: {
  user: Viewer;
  children: React.ReactNode;
}) {
  const admin = user.role === 'admin';
  const navigation = (
    <>
      <Link href={admin ? '/admin' : '/workspace'} className="active">
        {admin ? 'Documents' : 'Overview'}
      </Link>
      {admin && <Link href="/workspace">Learner workspace</Link>}
      <Link href="/knowledge">Knowledge library</Link>
    </>
  );
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Brand />
        <div className="role-label">
          <strong>{admin ? 'Administrator' : 'Frontend Developer'}</strong>
          <span>{admin ? 'PRIVATE MANAGEMENT' : 'YOUR STARTING POINT'}</span>
        </div>
        <nav className="nav" aria-label="Workspace">
          {navigation}
        </nav>
        <div className="sidebar-footer">
          <strong>{admin ? 'Administrator' : 'Demo explorer'}</strong>
          <small>{user.email}</small>
          <SignOutButton />
        </div>
      </aside>
      <div className="workspace">
        <details className="mobile-menu">
          <summary>
            <Brand />
            <span>Menu</span>
          </summary>
          <nav aria-label="Mobile workspace">
            {navigation}
            <SignOutButton />
          </nav>
        </details>
        <header className="workspace-header">
          <span>WORKSPACE / {admin ? 'ADMINISTRATION' : 'FRONTEND'}</span>
          <span className="badge">
            {admin ? 'Private admin' : 'Demo workspace'}
          </span>
        </header>
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
