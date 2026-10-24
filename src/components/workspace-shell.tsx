import { WorkspaceNav } from './workspace-nav';
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
  const admin = user.role !== 'learner';
  const demoAdmin = user.role === 'admin_demo';
  const navigation = <WorkspaceNav admin={admin} />;
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Brand href={admin ? '/admin' : '/workspace'} />
        <div className="sidebar-scroll">
          <div className="role-label">
            <strong>{admin ? 'Administrator' : 'Onboarding workspace'}</strong>
            <span>
              {demoAdmin
                ? 'READ-ONLY DEMO'
                : admin
                  ? 'PRIVATE MANAGEMENT'
                  : 'YOUR STARTING POINT'}
            </span>
          </div>
          <nav className="nav" aria-label="Workspace">
            {navigation}
          </nav>
        </div>
        <div className="sidebar-footer">
          <strong>{admin ? 'Administrator' : 'Demo explorer'}</strong>
          <small>{user.email}</small>
          <SignOutButton />
        </div>
      </aside>
      <div className="workspace">
        <details className="mobile-menu">
          <summary>
            <Brand href={admin ? '/admin' : '/workspace'} />
            <span>Menu</span>
          </summary>
          <nav aria-label="Mobile workspace">
            {navigation}
            <SignOutButton />
          </nav>
        </details>
        <header className="workspace-header">
          <span>WORKSPACE / {admin ? 'ADMINISTRATION' : 'ONBOARDING'}</span>
          <span className="badge">
            {demoAdmin
              ? 'Admin demo · Read only'
              : admin
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
          {children}
        </main>
      </div>
    </div>
  );
}
