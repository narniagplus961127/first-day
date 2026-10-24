'use client';
import { ActivityStorageNotice } from '@/components/activity-storage-notice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { beginTaskQuestion } from '@/lib/demo/task-question';
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

export function LearnerOverview({ guideCount }: { guideCount?: number }) {
  const router = useRouter();
  useEffect(() => {
    const sync = () => {
      try {
        setActivity(loadChecklistActivity());
      } catch {
        /* Existing storage notice explains the fallback. */
      }
    };
    window.addEventListener('firstday-onboarding-role', sync);
    return () => window.removeEventListener('firstday-onboarding-role', sync);
  }, []);
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
        'Saved progress could not be loaded. Your progress is temporary in this tab and may be lost on reload.',
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
            'Saved progress could not be loaded. Your progress is temporary in this tab and may be lost on reload.',
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
      <h1>
        Your first day,
        <br className="mobile-heading-break" /> a little clearer.
      </h1>
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
              'Progress cannot be saved in this browser. Your progress is temporary in this tab and may be lost on reload.',
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
        <h2>
          Settle in.<span> Then build something great.</span>
        </h2>
        <p>A few small steps will help you feel right at home.</p>
        <Link className="button primary" href={checklistHref}>
          Continue onboarding →
        </Link>
      </section>
      <ActivityStorageNotice />
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
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
      ) : (
        <>
          <div className="overview-stats">
            <section
              className="card checklist-progress"
              aria-label="Checklist progress"
            >
              <span className="section-label">YOUR PROGRESS</span>
              <p>
                {count} of {current.tasks.length} tasks complete
              </p>
              {current.tasks.length > 0 && (
                <>
                  <strong>
                    {current.tasks.length
                      ? Math.round((count / current.tasks.length) * 100)
                      : 0}
                    %
                  </strong>
                  <progress
                    aria-label="Onboarding completion"
                    value={count}
                    max={current.tasks.length}
                  />
                </>
              )}
              <small
                className={current.tasks.length ? 'progress-helper' : undefined}
              >
                {current.tasks.length
                  ? count === current.tasks.length
                    ? 'All steps complete.'
                    : 'A steady start. Keep going.'
                  : 'Coming soon. This role’s checklist has not been prepared yet.'}
              </small>
            </section>
            <Link href="/knowledge" className="card overview-stat">
              <span className="section-label">YOUR KNOWLEDGE</span>
              <strong>
                {guideCount === undefined
                  ? 'Team guides'
                  : guideCount + ' guides'}
              </strong>
              <small>Everything you need, in one place.</small>
            </Link>
            <Link href="/chat" className="card overview-stat">
              <span className="section-label">YOUR COMPANION</span>
              <strong>Ask FirstDay</strong>
              <small>No question is too small.</small>
            </Link>
          </div>
          <div className="overview-lower">
            <section
              aria-label={next.length ? 'Next steps' : undefined}
              className="checklist-stage"
            >
              <h2>Pick up where you left off</h2>
              <p className="muted">Your role, your pace.</p>
              {next.length ? (
                next.map((task) => (
                  <article className="card checklist-task" key={task.id}>
                    <span className="badge">UP NEXT · {task.stage}</span>
                    <h3>
                      <Link href={checklistHref + '#task-' + task.id}>
                        {task.title}
                      </Link>
                    </h3>
                    <p>Follow the guide and check it off when you are ready.</p>
                  </article>
                ))
              ) : (
                <section className="card">
                  <h3>
                    {current.tasks.length
                      ? 'Well done. You have completed this checklist.'
                      : 'Your next chapter is on its way.'}
                  </h3>
                  <Link href="/knowledge">Explore guides</Link> or{' '}
                  <Link href="/chat">Keep asking FirstDay</Link>.
                </section>
              )}
            </section>
            <aside className="card suggested-questions">
              <h2>Wondering where to start?</h2>
              {current.tasks
                .filter((task) => task.suggestedQuestion)
                .slice(0, 3)
                .map((task) => (
                  <Link
                    key={task.id}
                    href="/chat"
                    onClick={(event) => {
                      event.preventDefault();
                      let href = '/chat?taskIntent=unavailable';
                      try {
                        href = beginTaskQuestion(activity.role, task.id);
                      } catch {
                        /* Chat explains an unavailable handoff. */
                      }
                      router.push(href);
                    }}
                  >
                    {task.suggestedQuestion} <span aria-hidden="true">→</span>
                  </Link>
                ))}
              <Link href="/knowledge">Explore your guides →</Link>
            </aside>
          </div>
        </>
      )}
      <div className="overview-actions">
        <ResetDemo disabled={!ready} />
      </div>
    </>
  );
}
