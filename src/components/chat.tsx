'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { JOB_ROLES, type JobRole } from '@/lib/knowledge/types';
import type { AnswerResult } from '@/lib/answers/types';
export function Chat() {
  const [question, setQuestion] = useState(''),
    [scope, setScope] = useState<JobRole | 'All roles'>('Frontend Developer'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [result, setResult] = useState<AnswerResult | null>(null);
  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, scope }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || 'The answer is unavailable. Please retry.',
        );
      setResult(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Connection interrupted. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card chat-card">
      <form onSubmit={ask}>
        <label htmlFor="chat-scope">Search scope</label>
        <select
          id="chat-scope"
          value={scope}
          disabled={busy}
          onChange={(e) => {
            setScope(e.target.value as JobRole | 'All roles');
            setResult(null);
          }}
        >
          {[...JOB_ROLES, 'All roles'].map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
        <label htmlFor="question">Your question</label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={1000}
          required
          rows={3}
          placeholder="How do I run the frontend project?"
          disabled={busy}
        />
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'Finding guidance…' : 'Ask FirstDay'}
        </button>
      </form>
      {busy ? (
        <p role="status">
          Searching your guides and checking the supporting evidence…
        </p>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      {result ? (
        <article aria-label="FirstDay answer" className="answer">
          <span className="section-label">
            FIRSTDAY · {scope.toUpperCase()}
          </span>
          {result.status === 'no_evidence' ? (
            <p>{result.answer}</p>
          ) : (
            result.claims.map((claim, index) => (
              <section key={index}>
                <p className="answer-text">{claim.text}</p>
                <div className="source-links">
                  {claim.citations.map((source) => (
                    <Link key={source.id} href={source.href}>
                      View source: {source.title}
                      {source.heading ? ' · ' + source.heading : ''}
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </article>
      ) : null}
      <p className="muted chat-footnote">
        Answers use published team guides. Open a source to check the original
        passage.
      </p>
    </section>
  );
}
