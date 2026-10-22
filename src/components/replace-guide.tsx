'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
export function ReplaceGuide({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function replace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/documents/' + id + '/replace', {
        method: 'POST',
        body: new FormData(form),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || 'Replacement could not be saved. Please retry.',
        );
      form.reset();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Connection interrupted. Please retry.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="card replacement-form">
      <summary>Replace guide</summary>
      <p>
        Upload a revised Markdown guide for this document. Its title and job
        role stay the same.
      </p>
      <p>
        The published guide stays available until this candidate is fully
        indexed.
      </p>
      <form onSubmit={replace}>
        <label htmlFor="replacement-file">Replacement Markdown file</label>
        <input
          id="replacement-file"
          name="file"
          type="file"
          accept=".md,text/markdown"
          required
          disabled={busy}
        />
        <p className="muted">One English UTF-8 Markdown file, up to 100 KB.</p>
        <button className="button primary" disabled={busy}>
          {busy ? 'Saving replacement…' : 'Upload replacement'}
        </button>
      </form>
      {error ? <p role="alert">{error}</p> : null}
    </details>
  );
}
