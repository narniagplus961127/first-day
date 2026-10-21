import { requirePageUser } from '@/lib/auth';
import { WorkspaceShell } from '@/components/workspace-shell';
export const dynamic = 'force-dynamic';
export default async function Workspace() {
  const user = await requirePageUser();
  return (
    <WorkspaceShell user={user}>
      <h1>Your first day, a little clearer.</h1>
      <p className="muted">
        Welcome in. Your starting point as a Frontend Developer.
      </p>
      <section className="hero">
        <span className="section-label">YOUR NEXT CHAPTER</span>
        <h2>Settle in. Then build something great.</h2>
        <p>A few small steps will help you feel right at home.</p>
      </section>
      <div className="cards">
        <section className="card">
          <span className="section-label">YOUR KNOWLEDGE</span>
          <h3>Team guides</h3>
          <p>
            Your administrator will publish the guides that help you get
            started.
          </p>
        </section>
        <section className="card">
          <span className="section-label">YOUR COMPANION</span>
          <h3>A little guidance</h3>
          <p>
            Grounded answers and source citations are coming in the next
            milestone.
          </p>
        </section>
        <section className="card">
          <span className="section-label">YOUR PACE</span>
          <h3>Room to explore</h3>
          <p>
            Your demo activity stays in this browser, separate from other
            visitors.
          </p>
        </section>
      </div>
    </WorkspaceShell>
  );
}
