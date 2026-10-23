'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOB_ROLES } from '@/lib/knowledge/types';
import {
  STAGES,
  type Checklist,
  type ChecklistTaskInput,
} from '@/lib/checklists/types';
function historyIndex(): number | undefined {
  const navigation: unknown = Reflect.get(window, 'navigation');
  if (!navigation || typeof navigation !== 'object') return;
  const entry: unknown = Reflect.get(navigation, 'currentEntry');
  if (!entry || typeof entry !== 'object') return;
  const index: unknown = Reflect.get(entry, 'index');
  return typeof index === 'number' && Number.isInteger(index) && index >= 0
    ? index
    : undefined;
}
export function ChecklistView({
  initial,
  guides = [],
}: {
  initial: Checklist;
  guides?: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<ChecklistTaskInput[]>(initial.tasks);
  const [revision, setRevision] = useState(initial.revision);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [conflict, setConflict] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [historyGuardAvailable, setHistoryGuardAvailable] = useState<
    boolean | null
  >(null);
  useEffect(() => {
    if (!dirty) return;
    const editorUrl = new URL(window.location.href);
    const navigation: unknown = Reflect.get(window, 'navigation');
    const historyAvailable =
      navigation instanceof EventTarget && historyIndex() !== undefined;
    setHistoryGuardAvailable(historyAvailable);
    const leaving = (event: BeforeUnloadEvent) => event.preventDefault();
    const following = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest('a[href]');
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.hasAttribute('download') ||
        (anchor.target && anchor.target !== '_self')
      )
        return;
      const destination = new URL(anchor.href);
      if (
        destination.origin !== editorUrl.origin ||
        (destination.pathname === editorUrl.pathname &&
          destination.search === editorUrl.search)
      )
        return;
      if (!window.confirm('Discard unsaved checklist changes?')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const traversing = (event: Event) => {
      if (
        Reflect.get(event, 'navigationType') !== 'traverse' ||
        !event.cancelable
      )
        return;
      const destination: unknown = Reflect.get(event, 'destination');
      if (
        !destination ||
        typeof destination !== 'object' ||
        Reflect.get(destination, 'sameDocument') !== true
      )
        return;
      const url: unknown = Reflect.get(destination, 'url');
      if (typeof url !== 'string') return;
      const target = new URL(url);
      if (
        target.origin !== editorUrl.origin ||
        (target.pathname === editorUrl.pathname &&
          target.search === editorUrl.search)
      )
        return;
      // Ask before the browser commits the traversal, preserving this editor and history.
      if (!window.confirm('Discard unsaved checklist changes?'))
        event.preventDefault();
    };
    if (historyAvailable) navigation.addEventListener('navigate', traversing);
    window.addEventListener('beforeunload', leaving);
    document.addEventListener('click', following, true);
    return () => {
      if (historyAvailable)
        navigation.removeEventListener('navigate', traversing);
      window.removeEventListener('beforeunload', leaving);
      document.removeEventListener('click', following, true);
    };
  }, [dirty]);
  function edit(index: number, patch: Partial<ChecklistTaskInput>) {
    setTasks((previous) =>
      previous.map((task, i) => (i === index ? { ...task, ...patch } : task)),
    );
    setDirty(true);
    setMessage('');
  }
  function reorder(index: number, direction: -1 | 1) {
    const task = tasks[index];
    const peers = tasks.flatMap((entry, i) =>
      entry.stage === task.stage ? [i] : [],
    );
    const destination = peers[peers.indexOf(index) + direction];
    if (destination === undefined) return;
    setTasks((previous) => {
      const updated = [...previous];
      [updated[index], updated[destination]] = [
        updated[destination],
        updated[index],
      ];
      return updated;
    });
    setDirty(true);
    setMessage('');
  }
  function moveStage(index: number, stage: (typeof STAGES)[number]) {
    if (tasks[index].stage === stage) return;
    setTasks((previous) => {
      const moved = { ...previous[index], stage };
      const remaining = previous.filter((_, i) => i !== index);
      return STAGES.flatMap((group) => [
        ...remaining.filter((task) => task.stage === group),
        ...(group === stage ? [moved] : []),
      ]);
    });
    setDirty(true);
    setMessage('');
  }
  async function save(seed = false) {
    setPending(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/checklists', {
        method: seed ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: seed
          ? undefined
          : JSON.stringify({
              jobRole: initial.job_role,
              expectedRevision: revision,
              tasks: tasks.map((task, position) => ({ ...task, position })),
            }),
      });
      const result = await response.json();
      if (response.status === 409) {
        setConflict(true);
        setError(
          'Another administrator saved a newer checklist. Your edits have been kept. Copy any work you want to keep, then reload the saved checklist before saving again.',
        );
        return;
      }
      if (!response.ok)
        throw new Error(
          result.error || 'Checklist could not be saved. Please try again.',
        );
      setTasks(result.tasks);
      setRevision(result.revision);
      setDirty(false);
      setConflict(false);
      setMessage('Changes saved. Learners can now read this checklist.');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message + ' Your edits have been kept. Please try again.'
          : 'Please try again. Your edits have been kept.',
      );
    } finally {
      setPending(false);
    }
  }
  async function reloadSaved() {
    if (
      !window.confirm(
        'Discard your unsaved edits and load the latest saved checklist?',
      )
    )
      return;
    setPending(true);
    setReloading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(
        '/api/checklists?role=' + encodeURIComponent(initial.job_role),
        { cache: 'no-store' },
      );
      if (!response.ok)
        throw new Error('The saved checklist could not be loaded.');
      const saved: Checklist = await response.json();
      setTasks(saved.tasks);
      setRevision(saved.revision);
      setDirty(false);
      setConflict(false);
      setMessage('Saved checklist reloaded. You can edit the latest revision.');
    } catch {
      setError(
        'The saved checklist could not be loaded. Your edits have been kept. Please try reloading again.',
      );
    } finally {
      setPending(false);
      setReloading(false);
    }
  }
  return (
    <>
      <span className="section-label">CHECKLIST MANAGEMENT</span>
      <h1>Shape a good first day.</h1>
      <p className="muted">
        Define clear actions for each role, then save the complete checklist.
      </p>
      <label htmlFor="checklist-role">Job role</label>
      <select
        id="checklist-role"
        value={initial.job_role}
        disabled={pending}
        onChange={(event) => {
          if (dirty && !window.confirm('Discard unsaved checklist changes?'))
            return;
          router.push(
            '/admin/checklists' +
              '?role=' +
              encodeURIComponent(event.target.value),
          );
        }}
      >
        {JOB_ROLES.map((role) => (
          <option key={role}>{role}</option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
      {conflict ? (
        <button
          type="button"
          className="button secondary"
          disabled={pending}
          onClick={() => void reloadSaved()}
        >
          Reload saved checklist
        </button>
      ) : null}
      <p role="status" aria-live="polite">
        {pending
          ? reloading
            ? 'Loading saved checklist…'
            : 'Saving checklist…'
          : message ||
            (dirty ? 'Unsaved changes' : `Saved revision ${revision}`)}
      </p>
      {dirty && historyGuardAvailable === false ? (
        <p role="status" className="notice">
          Save your edits before using browser Back or Forward. This browser
          cannot protect those buttons; page links and reload still ask before
          discarding edits.
        </p>
      ) : null}
      {!tasks.length ? (
        <p className="notice">
          No tasks yet. Add a task to prepare this role’s checklist.
        </p>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <fieldset disabled={pending} className="checklist-fields">
          <legend className="sr-only">Checklist tasks</legend>
          {tasks.map((task, index) => (
            <section
              className="card checklist-task"
              key={task.id || `new-${index}`}
              aria-label={`Task ${index + 1}`}
            >
              <h2>Task {index + 1}</h2>
              <label htmlFor={`task-title-${index}`}>Task title</label>
              <input
                id={`task-title-${index}`}
                required
                maxLength={120}
                value={task.title}
                onChange={(event) => edit(index, { title: event.target.value })}
              />
              <label htmlFor={`task-stage-${index}`}>Stage</label>
              <select
                id={`task-stage-${index}`}
                value={task.stage}
                onChange={(event) =>
                  moveStage(
                    index,
                    event.target.value as (typeof STAGES)[number],
                  )
                }
              >
                {STAGES.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
              <label htmlFor={`task-instructions-${index}`}>Instructions</label>
              <textarea
                id={`task-instructions-${index}`}
                maxLength={2000}
                rows={3}
                value={task.instructions}
                onChange={(event) =>
                  edit(index, { instructions: event.target.value })
                }
              />
              <label htmlFor={`task-question-${index}`}>
                Suggested question
              </label>
              <textarea
                id={`task-question-${index}`}
                maxLength={1000}
                rows={3}
                value={task.suggestedQuestion || ''}
                onChange={(event) =>
                  edit(index, {
                    suggestedQuestion: event.target.value || null,
                  })
                }
              />
              <p className="muted">
                Optional. Learners review and submit this question themselves.
              </p>
              <label htmlFor={`task-guide-${index}`}>Guide</label>
              <select
                id={`task-guide-${index}`}
                value={task.guideId || ''}
                onChange={(event) =>
                  edit(index, { guideId: event.target.value || null })
                }
              >
                <option value="">No guide</option>
                {task.guideId &&
                !guides.some((guide) => guide.id === task.guideId) ? (
                  <option value={task.guideId}>
                    Guide unavailable — remove or choose another
                  </option>
                ) : null}
                {guides.map((guide) => (
                  <option key={guide.id} value={guide.id}>
                    {guide.title}
                  </option>
                ))}
              </select>
              <p className="muted">
                Only published guides for this role can be attached.
              </p>
              <div
                className="checklist-order-actions"
                role="group"
                aria-label={`Order task ${index + 1}`}
              >
                <button
                  type="button"
                  className="button secondary"
                  aria-label={`Move task ${index + 1} up`}
                  disabled={
                    !tasks
                      .slice(0, index)
                      .some((entry) => entry.stage === task.stage)
                  }
                  onClick={() => reorder(index, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="button secondary"
                  aria-label={`Move task ${index + 1} down`}
                  disabled={
                    !tasks
                      .slice(index + 1)
                      .some((entry) => entry.stage === task.stage)
                  }
                  onClick={() => reorder(index, 1)}
                >
                  Move down
                </button>
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setTasks((previous) =>
                    previous.filter((_, i) => i !== index),
                  );
                  setDirty(true);
                  setMessage('');
                }}
              >
                Remove task {index + 1}
              </button>
            </section>
          ))}
          <div className="checklist-actions">
            <button
              type="button"
              className="button secondary"
              disabled={tasks.length >= 40}
              onClick={() => {
                setTasks((previous) => [
                  ...previous,
                  { title: '', stage: 'Before you start', instructions: '' },
                ]);
                setDirty(true);
                setMessage('');
              }}
            >
              Add task
            </button>
            <button type="submit" className="button" disabled={conflict}>
              Save changes
            </button>
            {initial.job_role === 'Frontend Developer' && revision === 0 ? (
              <button
                type="button"
                className="button secondary"
                disabled={dirty}
                onClick={() => void save(true)}
              >
                Prepare Frontend starter tasks
              </button>
            ) : null}
          </div>
        </fieldset>
      </form>
    </>
  );
}
