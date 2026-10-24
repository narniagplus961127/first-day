import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Chat } from '@/components/chat';
export const dynamic = 'force-dynamic';
export default async function ChatPage() {
  const user = await requirePageUser();
  return (
    <WorkspaceShell user={user}>
      <span className="section-label">YOUR ONBOARDING COMPANION</span>
      <h1>A little guidance goes a long way.</h1>
      <p className="muted">
        Ask a question. Get an answer grounded in your onboarding documents.
      </p>
      <Chat />
    </WorkspaceShell>
  );
}
