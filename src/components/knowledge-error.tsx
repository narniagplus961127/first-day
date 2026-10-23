'use client';
import Link from 'next/link';
export function KnowledgeError() {
  return (
    <main className="workspace-content">
      <span className="section-label">FIRSTDAY KNOWLEDGE</span>
      <h1>Your guides will be back shortly.</h1>
      <p role="alert">
        Knowledge storage is temporarily unavailable. Please try again.
      </p>
      <button className="button primary" onClick={() => window.location.reload()}>
        Try again
      </button>
      <Link className="back-link" href="/workspace">
        Back to workspace
      </Link>
    </main>
  );
}
