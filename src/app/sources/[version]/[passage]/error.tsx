'use client';
import Link from 'next/link';
export default function SourceError({ reset }: { reset: () => void }) {
  return (
    <main className="workspace-content">
      <h1>Source storage is temporarily unavailable</h1>
      <p role="alert">
        We could not load this evidence. Please try again shortly.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link href="/chat">Back to Ask FirstDay</Link>
    </main>
  );
}
