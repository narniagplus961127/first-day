'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { consumeTaskQuestion } from '@/lib/demo/task-question';
import type { Checklist } from '@/lib/checklists/types';
import type { JobRole } from '@/lib/knowledge/types';
import type { AnswerResult, ConversationScope } from '@/lib/answers/types';
import {
  CONVERSATION_SCOPES,
  loadConversations,
  saveConversations,
  resetDemoActivity,
  type DemoConversations,
} from '@/lib/demo/conversations';

import { requestErrorMessage } from '@/lib/request-error-message';
export function Chat() {
  const resetDialog = useRef<HTMLDialogElement>(null);
  const suggestionDialog = useRef<HTMLDialogElement>(null);
  const [taskSuggestion, setTaskSuggestion] = useState<{
    role: JobRole;
    question: string;
  } | null>(null);
  const taskResolution = useRef<Promise<{
    role: JobRole;
    question: string;
  }> | null>(null);
  const [activity, setActivity] = useState<DemoConversations>({
    scope: 'Frontend Developer',
    conversations: {},
    drafts: {},
  });
  const currentActivity = useRef(activity);
  const draftVersion = useRef(0);
  const { scope, conversations, drafts = {} } = activity;
  const question = drafts[scope] || '';
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [storageNotice, setStorageNotice] = useState('');
  useEffect(() => {
    try {
      const stored = loadConversations();
      currentActivity.current = stored;
      setActivity(stored);
    } catch {
      setStorageNotice(
        'Saved activity could not be loaded. History and question drafts are temporary in this tab.',
      );
    }
    const url = new URL(window.location.href);
    const nonce = url.searchParams.get('taskIntent');
    let active = true;
    if (nonce !== null && !taskResolution.current) {
      url.searchParams.delete('taskIntent');
      window.history.replaceState(
        window.history.state,
        '',
        url.pathname + url.search + url.hash,
      );
      taskResolution.current = (async () => {
        const intent = consumeTaskQuestion(nonce);
        if (!intent) throw new Error('Unavailable');
        const response = await fetch(
          '/api/checklists?role=' + encodeURIComponent(intent.role),
          { cache: 'no-store' },
        );
        if (!response.ok) throw new Error('Unavailable');
        const checklist: Checklist = await response.json();
        const task = checklist.tasks.find(
          (entry) => entry.id === intent.taskId,
        );
        if (!task?.suggestedQuestion) throw new Error('Unavailable');
        return { role: intent.role, question: task.suggestedQuestion };
      })();
    }
    if (taskResolution.current) {
      void taskResolution.current
        .then((suggestion) => {
          if (!active) return;
          const current = currentActivity.current;
          const existing = current.drafts?.[suggestion.role] || '';
          if (existing && existing !== suggestion.question) {
            persist({ ...current, scope: suggestion.role });
            setTaskSuggestion(suggestion);
          } else {
            persist({
              ...current,
              scope: suggestion.role,
              drafts: {
                ...current.drafts,
                [suggestion.role]: suggestion.question,
              },
            });
          }
        })
        .catch(() => {
          if (active)
            setError(
              'This task question is unavailable. Open the current checklist and try again. Your drafts have been kept.',
            );
        })
        .finally(() => {
          if (active) setReady(true);
        });
    } else setReady(true);
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (taskSuggestion) suggestionDialog.current?.showModal();
    else suggestionDialog.current?.close();
  }, [taskSuggestion]);
  function persist(state: DemoConversations) {
    currentActivity.current = state;
    setActivity(state);
    try {
      saveConversations(state);
    } catch {
      setStorageNotice(
        'Activity cannot be saved in this browser. History and question drafts are temporary in this tab.',
      );
    }
  }
  function reset() {
    const empty: DemoConversations = {
      scope: 'Frontend Developer',
      conversations: {},
      drafts: {},
    };
    currentActivity.current = empty;
    setActivity(empty);
    draftVersion.current++;
    setError('');
    try {
      resetDemoActivity();
      setStorageNotice(
        'Demo activity reset in this browser. Shared guides and other visitors are unchanged.',
      );
    } catch {
      setStorageNotice(
        'This tab was cleared, but browser storage could not be cleared.',
      );
    }
    resetDialog.current?.close();
  }
  const exchanges = conversations[scope] || [];
  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy) return;
    const submittedVersion = draftVersion.current;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          scope,
          history: exchanges.slice(-3).map((exchange) => ({
            scope,
            question: exchange.question,
            answer: exchange.result.answer.slice(0, 2000),
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          requestErrorMessage(data, 'The answer is unavailable. Please retry.'),
        );
      const result: AnswerResult = data;
      const latest = currentActivity.current;
      const next = {
        ...latest.conversations,
        [scope]: [
          ...exchanges,
          { id: crypto.randomUUID(), question: question.trim(), result },
        ].slice(-20),
      };
      persist({
        ...latest,
        conversations: next,
        drafts: {
          ...latest.drafts,
          ...(draftVersion.current === submittedVersion ? { [scope]: '' } : {}),
        },
      });
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
      <dialog
        ref={suggestionDialog}
        aria-labelledby="replace-draft-title"
        aria-describedby="replace-draft-description"
        onCancel={() => setTaskSuggestion(null)}
      >
        <h2 id="replace-draft-title">Replace your unfinished question?</h2>
        <p id="replace-draft-description">
          This task has a suggested question for {taskSuggestion?.role}.
          Replacing changes only this scope’s draft. Your completed
          conversations and other drafts stay unchanged.
        </p>
        <p className="question-text">{taskSuggestion?.question}</p>
        <div className="dialog-actions">
          <button
            type="button"
            className="button secondary"
            autoFocus
            onClick={() => setTaskSuggestion(null)}
          >
            Keep my draft
          </button>
          <button
            type="button"
            className="button primary"
            onClick={() => {
              if (taskSuggestion) {
                draftVersion.current++;
                persist({
                  ...currentActivity.current,
                  scope: taskSuggestion.role,
                  drafts: {
                    ...currentActivity.current.drafts,
                    [taskSuggestion.role]: taskSuggestion.question,
                  },
                });
              }
              setTaskSuggestion(null);
            }}
          >
            Replace draft
          </button>
        </div>
      </dialog>
      <form onSubmit={ask}>
        <label htmlFor="chat-scope">Search scope</label>
        <select
          id="chat-scope"
          value={scope}
          disabled={!ready || busy}
          onChange={(event) => {
            const next = event.target.value as ConversationScope;
            setError('');
            persist({ ...currentActivity.current, scope: next });
          }}
        >
          {CONVERSATION_SCOPES.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
        <p className="muted">
          Current conversation: <strong>{scope}</strong>
        </p>
        <label htmlFor="question">Your question</label>
        <textarea
          id="question"
          value={question}
          onChange={(event) => {
            draftVersion.current++;
            persist({
              ...currentActivity.current,
              drafts: {
                ...currentActivity.current.drafts,
                [scope]: event.target.value,
              },
            });
          }}
          maxLength={1000}
          required
          rows={3}
          placeholder="How do I run the frontend project?"
          disabled={!ready}
        />
        <button
          type="submit"
          className="button primary"
          disabled={!ready || busy}
        >
          {busy ? 'Finding guidanceÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦' : 'Ask FirstDay'}
        </button>
      </form>
      {busy ? (
        <p role="status">
          Searching your guides and checking the supporting
          evidenceÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦
        </p>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      {storageNotice ? <p role="status">{storageNotice}</p> : null}
      {exchanges.map((exchange) => (
        <section className="conversation-exchange" key={exchange.id}>
          <p className="question-text">
            <strong>You:</strong> {exchange.question}
          </p>
          <article aria-label="FirstDay answer" className="answer">
            <span className="section-label">
              FIRSTDAY Ãƒâ€šÃ‚Â· {scope.toUpperCase()}
            </span>
            {exchange.result.status === 'no_evidence' ? (
              <p>{exchange.result.answer}</p>
            ) : (
              exchange.result.claims.map((claim, index) => (
                <section key={index}>
                  <p className="answer-text">{claim.text}</p>
                  <div className="source-links">
                    {claim.citations.map((source) => (
                      <Link key={source.id} href={source.href}>
                        View source: {source.title}
                        {source.heading ? ' Ãƒâ€šÃ‚Â· ' + source.heading : ''}
                      </Link>
                    ))}
                  </div>
                </section>
              ))
            )}
          </article>
        </section>
      ))}
      <p className="muted chat-footnote">
        Demo conversations and unfinished question drafts stay in this browser,
        separately for each search scope. Up to three recent completed exchanges
        are sent to the server and AI providers to interpret follow-ups. Answers
        still need published source evidence.
      </p>
      <button
        type="button"
        className="button secondary"
        disabled={!ready || busy}
        onClick={() => resetDialog.current?.showModal()}
      >
        Reset demo
      </button>
      <dialog
        ref={resetDialog}
        aria-labelledby="reset-demo-title"
        aria-describedby="reset-demo-description"
      >
        <span className="section-label">A FRESH START</span>
        <h2 id="reset-demo-title">
          Reset this browserÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s demo activity?
        </h2>
        <p id="reset-demo-description">
          This clears this browserÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s checklist progress,
          conversations and question drafts across all roles and search scopes.
          Shared guides and other visitorsÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ activity stay
          unchanged.
        </p>
        <div className="dialog-actions">
          <button
            type="button"
            className="button secondary"
            autoFocus
            onClick={() => resetDialog.current?.close()}
          >
            Keep my history
          </button>
          <button type="button" className="button primary" onClick={reset}>
            Reset this browser
          </button>
        </div>
      </dialog>
    </section>
  );
}
