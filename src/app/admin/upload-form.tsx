'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOB_ROLES } from '@/lib/knowledge/types';

export function UploadForm({ readOnly = false }: { readOnly?: boolean }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    setSaving(true);
    try {
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        body: form,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          body?.error || 'The upload could not be saved. Please try again.',
        );
      dialog.current?.close();
      router.push('/admin/documents/' + body.document.id);
      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof TypeError
          ? 'We could not reach FirstDay. Please try again.'
          : failure instanceof Error
            ? failure.message
            : 'Connection lost. Please try uploading again.',
      );
      setSaving(false);
    }
  }
  return (
    <section
      className="card upload-card"
      aria-labelledby="upload-title"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes('Files')) event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (readOnly || saving) return;
        dialog.current?.showModal();
        if (event.dataTransfer.files.length !== 1) {
          setError('Choose one Markdown file at a time.');
          return;
        }
        setError('');
        if (fileInput.current)
          fileInput.current.files = event.dataTransfer.files;
      }}
    >
      <span className="section-label">ADD KNOWLEDGE</span>
      <h2 id="upload-title">Give every first day a better starting point.</h2>
      <p>
        Upload .md files, assign a job role, and make them available for search.
      </p>
      <div className="upload-trigger">
        <span>Drop Markdown files here, or choose files →</span>
        <button
          type="button"
          className="button primary"
          disabled={readOnly}
          onClick={() => dialog.current?.showModal()}
        >
          Upload Markdown +
        </button>
      </div>
      <dialog
        ref={dialog}
        className="upload-dialog"
        aria-labelledby="upload-dialog-title"
        onCancel={(event) => {
          if (saving) event.preventDefault();
        }}
      >
        <div className="drawer-heading">
          <h2 id="upload-dialog-title">Add a knowledge document</h2>
          <button
            type="button"
            className="text-button"
            disabled={saving}
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <p className="muted">
          Markdown files keep headings and source references.
        </p>
        <form onSubmit={submit} className="upload-form">
          <fieldset className="checklist-fields" disabled={readOnly}>
            <label htmlFor="document-title">Document title</label>
            <input
              id="document-title"
              name="title"
              maxLength={160}
              required
              placeholder="Frontend environment setup"
            />
            <label htmlFor="job-role">Job role</label>
            <select id="job-role" name="jobRole">
              {JOB_ROLES.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
            <label htmlFor="markdown-file">Markdown file</label>
            <input
              ref={fileInput}
              id="markdown-file"
              name="file"
              type="file"
              accept=".md,text/markdown,text/plain"
              required
              aria-describedby="file-hint"
            />
            <p id="file-hint" className="hint">
              One .md file, up to 100 KB. Use fictional demo content only.
            </p>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="button primary" disabled={saving} type="submit">
              {saving ? 'Saving guide…' : 'Upload Markdown + '}
            </button>
            {saving && (
              <p role="status" className="hint">
                Saving your guide securely. Please keep this page open.
              </p>
            )}
          </fieldset>
        </form>
      </dialog>
    </section>
  );
}
