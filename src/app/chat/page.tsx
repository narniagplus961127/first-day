import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Chat } from '@/components/chat';
export const dynamic = 'force-dynamic';
export default async function ChatPage() {
  const user = await requirePageUser();
  return (
    <WorkspaceShell user={user}>
      <span className="section-label">YOUR ONBOARDING COMPANION</span>
      <h1>A little guidance, backed by your team.</h1>
      <p className="muted">
        Ask about the published guides and explore the passages behind each
        answer.
      </p>
      <Chat />
    </WorkspaceShell>
  );
}
