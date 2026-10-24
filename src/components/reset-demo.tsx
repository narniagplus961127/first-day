'use client';
import { useId, useRef, useState } from 'react';
import { resetDemoActivity } from '@/lib/demo/activity';
export function ResetDemo({ disabled = false }: { disabled?: boolean }) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState('');
  return (
    <div className="reset-control">
      <button
        type="button"
        className="button secondary"
        disabled={disabled}
        onClick={() => dialog.current?.showModal()}
      >
        Reset demo
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={id + '-title'}
        aria-describedby={id + '-description'}
      >
        <span className="section-label">A FRESH START</span>
        <h2 id={id + '-title'}>Reset this browser’s demo activity?</h2>
        <p id={id + '-description'}>
          This clears this browser’s checklist progress, conversations and
          question drafts across all roles and search scopes, including pending
          task questions. Open tabs return to Frontend Developer. You stay
          signed in. Shared guides, other visitors and question allowances stay
          unchanged. Reset does not refill question limits or stop a question
          already processing.
        </p>
        <div className="dialog-actions">
          <button
            type="button"
            className="button secondary"
            autoFocus
            onClick={() => dialog.current?.close()}
          >
            Keep my history
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => {
              const confirmed = resetDemoActivity();
              setNotice(
                confirmed
                  ? 'Demo activity reset in this browser. Shared guides and other visitors are unchanged.'
                  : 'This tab was cleared, but browser-wide clearing could not be confirmed. Old activity may return on reload.',
              );
              dialog.current?.close();
            }}
          >
            Reset this browser
          </button>
        </div>
      </dialog>
      {notice ? <p role="status">{notice}</p> : null}
    </div>
  );
}
