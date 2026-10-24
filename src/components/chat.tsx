'use client';
import { ActivityStorageNotice } from '@/components/activity-storage-notice';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ChatSources } from './chat-sources';
import { ResetDemo } from '@/components/reset-demo';
import {
  activityGeneration,
  generationIsCurrent,
  subscribeDemoReset,
} from '@/lib/demo/activity';
import { consumeTaskQuestion } from '@/lib/demo/task-question';
import type { Checklist } from '@/lib/checklists/types';
import type { JobRole } from '@/lib/knowledge/types';
import type { AnswerResult, ConversationScope } from '@/lib/answers/types';
import {
  CONVERSATION_SCOPES,
  loadConversations,
  saveConversations,
  type DemoConversations,
} from '@/lib/demo/conversations';

import { requestErrorMessage } from '@/lib/request-error-message';
export function Chat() {
  const generation = useRef('legacy');
  const requestIdentity = useRef<object | null>(null);
  const suggestionDialog = useRef<HTMLDialogElement>(null);
  const [taskSuggestion, setTaskSuggestion] = useState<{
    generation: string;
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
    generation.current = activityGeneration();
    const startedGeneration = generation.current;
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
          if (!active || !generationIsCurrent(startedGeneration)) return;
          const current = currentActivity.current;
          const existing = current.drafts?.[suggestion.role] || '';
          if (existing && existing !== suggestion.question) {
            persist({ ...current, scope: suggestion.role });
            setTaskSuggestion({ ...suggestion, generation: startedGeneration });
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
          if (active && generationIsCurrent(startedGeneration))
            setError(
              'This task question is unavailable. Open the current checklist and try again. Your drafts have been kept.',
            );
        })
        .finally(() => {
          if (active && generationIsCurrent(startedGeneration)) setReady(true);
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
    if (!generationIsCurrent(generation.current)) return;
    currentActivity.current = state;
    setActivity(state);
    try {
      saveConversations(state, generation.current);
    } catch {
      setStorageNotice(
        'Activity cannot be saved in this browser. History and question drafts are temporary in this tab.',
      );
    }
  }
  function clearVisibleActivity() {
    const nextGeneration = activityGeneration();
    if (nextGeneration === generation.current) return;
    generation.current = nextGeneration;
    requestIdentity.current = null;
    const empty: DemoConversations = {
      scope: 'Frontend Developer',
      conversations: {},
      drafts: {},
    };
    currentActivity.current = empty;
    setActivity(empty);
    draftVersion.current++;
    setTaskSuggestion(null);
    taskResolution.current = null;
    setError('');
    setStorageNotice('');
    setBusy(false);
    setReady(true);
  }
  useEffect(() => subscribeDemoReset(clearVisibleActivity), []);
  function latestActivity() {
    if (!generationIsCurrent(generation.current)) clearVisibleActivity();
    return currentActivity.current;
  }
  const exchanges = conversations[scope] || [];
  const sources = [
    ...new Map(
      (exchanges.at(-1)?.result.claims || [])
        .flatMap((claim) => claim.citations)
        .map((source) => [source.versionId + source.id, source]),
    ).values(),
  ];
  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy) return;
    if (!generationIsCurrent(generation.current)) {
      clearVisibleActivity();
      return;
    }
    const submittedGeneration = generation.current;
    const identity = {};
    requestIdentity.current = identity;
    const isCurrent = () =>
      requestIdentity.current === identity &&
      generationIsCurrent(submittedGeneration);
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
      if (!isCurrent()) return;
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
      if (!isCurrent()) return;
      setError(
        error instanceof Error
          ? error.message
          : 'Connection interrupted. Please try again.',
      );
    } finally {
      if (isCurrent()) setBusy(false);
    }
  }
  return (
    <section className="chat-layout">
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
              if (
                taskSuggestion &&
                !generationIsCurrent(taskSuggestion.generation)
              ) {
                clearVisibleActivity();
                return;
              }
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
      <div className="chat-controls">
        <label htmlFor="chat-scope">Search scope</label>
        <select
          id="chat-scope"
          value={scope}
          disabled={!ready || busy}
          onChange={(event) => {
            const next = event.target.value as ConversationScope;
            setError('');
            persist({ ...latestActivity(), scope: next });
          }}
        >
          {CONVERSATION_SCOPES.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
        <p className="muted">
          Current conversation: <strong>{scope}</strong>
        </p>
        <button
          type="button"
          className="badge scope-shortcut"
          disabled={!ready || busy}
          aria-pressed={scope === 'All roles'}
          onClick={() => {
            setError('');
            persist({ ...latestActivity(), scope: 'All roles' });
          }}
        >
          All roles
        </button>
      </div>
      <div className="chat-thread card">
        {!exchanges.length && (
          <div className="chat-welcome">
            <span className="badge">FIRSTDAY</span>
            <h2>A little help, on day one.</h2>
            <p>
              Ask about your tools, team guides or next steps. Every supported
              answer links back to its sources.
            </p>
          </div>
        )}

        {busy ? (
          <p role="status">
            Searching your guides and checking the supporting evidence…
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
                FIRSTDAY · {scope.toUpperCase()}
              </span>
              {exchange.result.status === 'no_evidence' ? (
                <>
                  <h2>I could not find that in the guides.</h2>
                  <p>{exchange.result.answer}</p>
                </>
              ) : (
                exchange.result.claims.map((claim, index) => (
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
          </section>
        ))}
      </div>
      <ChatSources
        sources={sources}
        noEvidence={exchanges.at(-1)?.result.status === 'no_evidence'}
      />
      <form className="chat-composer" onSubmit={ask}>
        <label htmlFor="question">Your question</label>
        <textarea
          id="question"
          value={question}
          onChange={(event) => {
            const latest = latestActivity();
            draftVersion.current++;
            persist({
              ...latest,
              drafts: {
                ...latest.drafts,
                [latest.scope]: event.target.value,
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
          {busy ? 'Finding guidance…' : 'Ask FirstDay'}
        </button>
      </form>
      <p className="muted chat-footnote">
        When browser storage is available, demo conversations and unfinished
        question drafts stay in this browser, separately for each search scope.
        Up to three recent completed exchanges are sent to the server and AI
        providers to interpret follow-ups. Answers still need published source
        evidence.
      </p>
      <ActivityStorageNotice />
      <ResetDemo disabled={!ready} />
    </section>
  );
}
