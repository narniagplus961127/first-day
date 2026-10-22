'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOB_ROLES } from '@/lib/knowledge/types';

export function UploadForm() {
  const router = useRouter();
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
    <section className="card upload-card" aria-labelledby="upload-title">
      <span className="section-label">ADD KNOWLEDGE</span>
      <h2 id="upload-title">Give a first day a better starting point.</h2>
      <p>
        Upload an English Markdown guide. It stays private to administrators
        until indexing is complete.
      </p>
      <form onSubmit={submit} className="upload-form">
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
      </form>
    </section>
  );
}
