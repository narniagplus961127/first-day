'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestErrorMessage } from '@/lib/request-error-message';
export function IndexGuide({
  id,
  status,
  completed,
  total,
  failure,
}: {
  id: string;
  status: string;
  completed: number;
  total: number;
  failure: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(failure || '');
  const [progress, setProgress] = useState({ completed, total });
  async function index() {
    setBusy(true);
    setError('');
    try {
      let state;
      do {
        const response = await fetch(`/api/admin/documents/${id}/index`, {
          method: 'POST',
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            requestErrorMessage(data, 'Indexing interrupted. Please retry.'),
          );
        state = data.status;
        setProgress(data);
      } while (state === 'processing');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please retry.');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  if (status === 'ready')
    return (
      <p className="notice">
        Published and available in the knowledge library.
      </p>
    );
  return (
    <section className="notice" aria-label="Indexing progress">
      <p>
        This candidate becomes available to learners after all passages are
        indexed.
      </p>
      <p role="status">
        {progress.completed} of {progress.total} passages indexed
        {busy ? ' · Indexing…' : ''}
      </p>
      {error && <p role="alert">{error}</p>}
      <button className="button primary" disabled={busy} onClick={index}>
        {busy
          ? 'Indexing…'
          : status === 'failed'
            ? 'Retry indexing'
            : status === 'processing'
              ? 'Resume indexing'
              : 'Index and publish'}
      </button>
    </section>
  );
}
