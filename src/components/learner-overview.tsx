'use client';
import Link from 'next/link';
import { ResetDemo } from '@/components/reset-demo';
import { subscribeDemoReset } from '@/lib/demo/activity';
import { useEffect, useState } from 'react';
import { JOB_ROLES } from '@/lib/knowledge/types';
import { STAGES, type Checklist } from '@/lib/checklists/types';
import {
  emptyChecklistActivity,
  loadChecklistActivity,
  rememberOnboardingRole,
  subscribeChecklistActivity,
  type ChecklistActivity,
  type OnboardingRole,
} from '@/lib/demo/checklists';

export function LearnerOverview() {
  const [activity, setActivity] = useState<ChecklistActivity>(
    emptyChecklistActivity,
  );
  const [ready, setReady] = useState(false);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    try {
      setActivity(loadChecklistActivity());
    } catch {
      setNotice(
        'Saved progress could not be loaded. Your progress is temporary in this tab and may be lost on navigation or reload.',
      );
    }
    setReady(true);
  }, []);
  useEffect(
    () =>
      subscribeChecklistActivity(() => {
        try {
          setActivity(loadChecklistActivity());
        } catch {
          setNotice(
            'Saved progress could not be loaded. Your progress is temporary in this tab and may be lost on navigation or reload.',
          );
        }
      }),
    [],
  );
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    setChecklist(null);
    setError('');
    async function read() {
      try {
        const response = await fetch(
          '/api/checklists?role=' + encodeURIComponent(activity.role),
          {
            signal: controller.signal,
            cache: 'no-store',
          },
        );
        if (!response.ok)
          throw new Error('Checklist could not be loaded. Please try again.');
        const value: Checklist = await response.json();
        if (!controller.signal.aborted) setChecklist(value);
      } catch {
        if (!controller.signal.aborted)
          setError('Checklist could not be loaded. Please try again.');
      }
    }
    void read();
    return () => controller.abort();
  }, [ready, activity.role, attempt]);
  const current = checklist?.job_role === activity.role ? checklist : null;
  useEffect(
    () =>
      subscribeDemoReset(() => {
        let fresh = emptyChecklistActivity();
        try {
          fresh = loadChecklistActivity();
        } catch {
          /* The reset still clears visible stale state. */
        }
        setActivity(fresh);
        setNotice('');
      }),
    [],
  );
  const completed = new Set(activity.completed[activity.role] || []);
  const ordered = STAGES.flatMap(
    (stage) => current?.tasks.filter((task) => task.stage === stage) || [],
  );
  const count = ordered.filter((task) => completed.has(task.id)).length;
  const next = ordered.filter((task) => !completed.has(task.id)).slice(0, 3);
  const checklistHref = '/checklist?role=' + encodeURIComponent(activity.role);
  return (
    <>
      <h1>Your first day, a little clearer.</h1>
      <p className="muted">
        Welcome in. Here is your {activity.role} onboarding path.
      </p>
      <label htmlFor="overview-role">Job role</label>
      <select
        id="overview-role"
        value={activity.role}
        disabled={!ready}
        onChange={(event) => {
          const role = event.target.value as OnboardingRole;
          const value = { ...activity, role };
          setActivity(value);
          try {
            rememberOnboardingRole(role);
          } catch {
            setNotice(
              'Progress cannot be saved in this browser. Your progress is temporary in this tab and may be lost on navigation or reload.',
            );
          }
        }}
      >
        {JOB_ROLES.map((role) => (
          <option key={role}>{role}</option>
        ))}
      </select>
      <section className="hero">
        <span className="section-label">YOUR NEXT CHAPTER</span>
        <h2>Settle in. Then build something great.</h2>
        <p>A few small steps will help you feel right at home.</p>
        <Link className="button" href={checklistHref}>
          Continue onboarding →
        </Link>
      </section>
      <ResetDemo disabled={!ready} />
      {notice ? (
        <p role="status" className="notice">
          {notice}
        </p>
      ) : null}
      {error ? (
        <div role="alert" className="notice">
          <p>{error}</p>
          <button
            className="button secondary"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Retry checklist
          </button>
        </div>
      ) : !current ? (
        <p role="status">Loading your checklist…</p>
      ) : current.tasks.length ? (
        <>
          <section
            className="card checklist-progress"
            aria-label="Checklist progress"
          >
            <span className="section-label">YOUR PROGRESS</span>
            <p>
              {count} of {current.tasks.length} tasks complete
            </p>
            <strong>{Math.round((count / current.tasks.length) * 100)}%</strong>
            <progress
              aria-label="Onboarding completion"
              value={count}
              max={current.tasks.length}
            />
          </section>
          {next.length ? (
            <section aria-label="Next steps" className="checklist-stage">
              <h2>Pick up where you left off</h2>
              <p className="muted">Your role, your pace.</p>
              {next.map((task) => (
                <article className="card checklist-task" key={task.id}>
                  <span className="section-label">UP NEXT · {task.stage}</span>
                  <h3>
                    <Link href={checklistHref + '#task-' + task.id}>
                      {task.title}
                    </Link>
                  </h3>
                </article>
              ))}
            </section>
          ) : (
            <section className="card checklist-progress">
              <h2>Well done. You have completed this checklist.</h2>
              <p>Keep exploring at your own pace.</p>
              <p>
                <Link href="/knowledge">Explore guides</Link> or{' '}
                <Link href="/chat">Keep asking FirstDay</Link>.
              </p>
            </section>
          )}
        </>
      ) : (
        <p className="notice">
          Coming soon. This role’s checklist has not been prepared yet.
        </p>
      )}
      <div className="cards">
        <section className="card">
          <span className="section-label">YOUR KNOWLEDGE</span>
          <h3>Team guides</h3>
          <p>
            Explore published guides across every role to help you get started.
          </p>
          <Link href="/knowledge">Browse knowledge →</Link>
        </section>
        <section className="card">
          <span className="section-label">YOUR COMPANION</span>
          <h3>A little guidance</h3>
          <p>
            Ask onboarding questions and inspect the sources behind each answer.
          </p>
          <Link href="/chat">Ask FirstDay →</Link>
        </section>
        <section className="card">
          <span className="section-label">YOUR PACE</span>
          <h3>Room to explore</h3>
          <p>
            Your progress stays in this browser, separate from other visitors.
            Clearing browser data loses your progress.
          </p>
        </section>
      </div>
    </>
  );
}
