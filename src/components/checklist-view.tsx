'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JOB_ROLES } from '@/lib/knowledge/types';
import {
  STAGES,
  type Checklist,
  type ChecklistTaskInput,
} from '@/lib/checklists/types';
export function ChecklistView({
  initial,
  admin = false,
}: {
  initial: Checklist;
  admin?: boolean;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<ChecklistTaskInput[]>(initial.tasks);
  const [revision, setRevision] = useState(initial.revision);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!dirty) return;
    const leaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', leaving);
    return () => window.removeEventListener('beforeunload', leaving);
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
      if (!response.ok)
        throw new Error(
          result.error || 'Checklist could not be saved. Please try again.',
        );
      setTasks(result.tasks);
      setRevision(result.revision);
      setDirty(false);
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
  return (
    <>
      <span className="section-label">
        {admin ? 'CHECKLIST MANAGEMENT' : 'YOUR ONBOARDING PATH'}
      </span>
      <h1>
        {admin ? 'Shape a good first day.' : 'Your onboarding checklist.'}
      </h1>
      <p className="muted">
        {admin
          ? 'Define clear actions for each role, then save the complete checklist.'
          : 'Explore the onboarding steps for any role. Stages suggest a sequence, not deadlines.'}
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
            (admin ? '/admin/checklists' : '/checklist') +
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
      <p role="status" aria-live="polite">
        {pending
          ? 'Saving checklist…'
          : message ||
            (dirty ? 'Unsaved changes' : `Saved revision ${revision}`)}
      </p>
      {!tasks.length ? (
        <p className="notice">
          {admin
            ? 'No tasks yet. Add a task to prepare this role’s checklist.'
            : 'Coming soon. This role’s checklist has not been prepared yet.'}
        </p>
      ) : null}
      {admin ? (
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
                  onChange={(event) =>
                    edit(index, { title: event.target.value })
                  }
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
                <label htmlFor={`task-instructions-${index}`}>
                  Instructions
                </label>
                <textarea
                  id={`task-instructions-${index}`}
                  maxLength={2000}
                  rows={3}
                  value={task.instructions}
                  onChange={(event) =>
                    edit(index, { instructions: event.target.value })
                  }
                />
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
              <button type="submit" className="button">
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
      ) : (
        STAGES.map((stage) => {
          const stageTasks = tasks.filter((task) => task.stage === stage);
          return stageTasks.length ? (
            <section className="checklist-stage" key={stage}>
              <h2>{stage}</h2>
              {stageTasks.map((task) => (
                <article className="card checklist-task" key={task.id}>
                  <h3>{task.title}</h3>
                  {task.instructions ? (
                    <p className="checklist-instructions">
                      {task.instructions}
                    </p>
                  ) : null}
                </article>
              ))}
            </section>
          ) : null;
        })
      )}
    </>
  );
}
