'use client';
import { useId, useRef } from 'react';
import Link from 'next/link';
import type { Citation } from '@/lib/answers/types';
function SourceCards({
  sources,
  noEvidence,
}: {
  sources: Citation[];
  noEvidence?: boolean;
}) {
  return (
    <>
      <p className="muted">
        {sources.length
          ? sources.length +
            ' supporting passage' +
            (sources.length === 1 ? '' : 's')
          : noEvidence
            ? 'No matching sources. Try a different question or ask your onboarding contact.'
            : 'Supporting passages appear here after a grounded answer.'}
      </p>
      {sources.map((source, index) => (
        <Link
          className="card source-card"
          key={source.versionId + source.id}
          href={source.href}
        >
          <span className="badge">SOURCE {index + 1}</span>
          <h3>{source.title}</h3>
          {source.heading && <p>{source.heading}</p>}
          <span>Read source →</span>
        </Link>
      ))}
    </>
  );
}
export function ChatSources({
  sources,
  noEvidence,
}: {
  sources: Citation[];
  noEvidence?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  return (
    <>
      <aside className="chat-sources card" aria-label="Answer sources">
        <h2>Sources</h2>
        <SourceCards sources={sources} noEvidence={noEvidence} />
      </aside>
      <button
        type="button"
        className="mobile-sources text-button"
        onClick={() => dialog.current?.showModal()}
      >
        Sources ↗
      </button>
      <dialog ref={dialog} className="sources-dialog" aria-labelledby={id}>
        <div className="drawer-heading">
          <h2 id={id}>Sources</h2>
          <button
            className="text-button"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <p className="muted">Check the passages behind this answer.</p>
        <div
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) dialog.current?.close();
          }}
        >
          <SourceCards sources={sources} noEvidence={noEvidence} />
        </div>
      </dialog>
    </>
  );
}
