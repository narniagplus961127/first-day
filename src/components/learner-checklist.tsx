'use client';
import { ActivityStorageNotice } from '@/components/activity-storage-notice';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ResetDemo } from '@/components/reset-demo';
import { subscribeDemoReset } from '@/lib/demo/activity';
import { beginTaskQuestion } from '@/lib/demo/task-question';
import { JOB_ROLES } from '@/lib/knowledge/types';
import { STAGES, type Checklist } from '@/lib/checklists/types';
import {
  emptyChecklistActivity,
  loadChecklistActivity,
  rememberOnboardingRole,
  changeChecklistTask,
  subscribeChecklistActivity,
  type ChecklistActivity,
  type OnboardingRole,
} from '@/lib/demo/checklists';
export function LearnerChecklist({
  initial,
  explicitRole,
  guides = [],
}: {
  initial: Checklist;
  explicitRole: boolean;
  guides?: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [activity, setActivity] = useState<ChecklistActivity>(
    emptyChecklistActivity,
  );
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let restored = emptyChecklistActivity();
    try {
      restored = loadChecklistActivity();
    } catch {
      setNotice(
        'Saved progress could not be loaded. Checklist progress is temporary in this tab and may be lost on reload.',
      );
    }
    if (!explicitRole && restored.role !== initial.job_role) {
      router.replace('/checklist?role=' + encodeURIComponent(restored.role));
      return;
    }
    const ids = new Set(initial.tasks.map((task) => task.id));
    const next = {
      ...restored,
      role: initial.job_role,
      completed: {
        ...restored.completed,
        [initial.job_role]: (restored.completed[initial.job_role] || []).filter(
          (id) => ids.has(id),
        ),
      },
    };
    setActivity(next);
    try {
      rememberOnboardingRole(next.role);
    } catch {
      setNotice(
        'Progress cannot be saved in this browser. Checklist progress is temporary in this tab and may be lost on reload.',
      );
    }
    setReady(true);
  }, [initial, explicitRole, router]);
  useEffect(
    () =>
      subscribeChecklistActivity(() => {
        try {
          setActivity({ ...loadChecklistActivity(), role: initial.job_role });
        } catch {
          setNotice(
            'Saved progress could not be loaded. Checklist progress is temporary in this tab and may be lost on reload.',
          );
        }
      }),
    [initial.job_role],
  );
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
        router.replace('/checklist?role=' + encodeURIComponent(fresh.role));
      }),
    [router],
  );
  const completed = new Set(activity.completed[initial.job_role] || []);
  const count = initial.tasks.filter((task) => completed.has(task.id)).length;
  const percent = initial.tasks.length
    ? Math.round((count / initial.tasks.length) * 100)
    : 0;
  return (
    <>
      <span className="section-label">YOUR ONBOARDING PATH</span>
      <h1>Your onboarding checklist.</h1>
      <p className="muted">
        Explore the onboarding steps for any role. Stages suggest a sequence,
        not deadlines.
      </p>
      <label htmlFor="checklist-role">Job role</label>
      <select
        id="checklist-role"
        value={initial.job_role}
        disabled={!ready}
        onChange={(event) => {
          const role = event.target.value as OnboardingRole;
          setActivity({ ...activity, role });
          try {
            rememberOnboardingRole(role);
          } catch {
            setNotice(
              'Progress cannot be saved in this browser. Checklist progress is temporary in this tab and may be lost on reload.',
            );
          }
          router.push('/checklist?role=' + encodeURIComponent(role));
        }}
      >
        {JOB_ROLES.map((role) => (
          <option key={role}>{role}</option>
        ))}
      </select>
      <p className="muted">
        When browser storage is available, your progress stays in this browser.
        Other visitors using the demo account cannot see it. Clearing browser
        data loses your progress. Use Reset demo to start again.
      </p>
      <ActivityStorageNotice />
      <ResetDemo disabled={!ready} />
      {notice ? (
        <p role="status" className="notice">
          {notice}
        </p>
      ) : null}
      {!ready ? (
        <p role="status">Loading your progress…</p>
      ) : initial.tasks.length ? (
        <section
          className="card checklist-progress"
          aria-label="Checklist progress"
        >
          <p aria-live="polite">
            {count} of {initial.tasks.length} tasks complete
          </p>
          <strong>{percent}%</strong>
          <progress
            aria-label="Onboarding completion"
            max={initial.tasks.length}
            value={count}
          />
          {count === initial.tasks.length ? (
            <p>
              Well done. You have completed this checklist.{' '}
              <Link href="/knowledge">Explore guides</Link> or{' '}
              <Link href="/chat">ask FirstDay</Link>.
            </p>
          ) : null}
        </section>
      ) : (
        <p className="notice">
          Coming soon. This role’s checklist has not been prepared yet.
        </p>
      )}
      {STAGES.map((stage) => {
        const tasks = initial.tasks.filter((task) => task.stage === stage);
        return tasks.length ? (
          <section className="checklist-stage" key={stage} aria-label={stage}>
            <h2>{stage}</h2>
            {tasks.map((task) => (
              <article
                className="card checklist-task"
                key={task.id}
                id={'task-' + task.id}
              >
                <h3>{task.title}</h3>
                {task.instructions ? (
                  <p className="checklist-instructions">{task.instructions}</p>
                ) : null}
                {task.guideId ? (
                  guides.some((guide) => guide.id === task.guideId) ? (
                    <Link
                      className="button secondary"
                      prefetch={false}
                      href={
                        '/checklist/guide?role=' +
                        encodeURIComponent(initial.job_role) +
                        '&task=' +
                        task.id
                      }
                    >
                      Open guide
                    </Link>
                  ) : (
                    <p className="notice">
                      Guide unavailable. You can still complete this task.
                    </p>
                  )
                ) : null}
                {task.suggestedQuestion ? (
                  <Link
                    href="/chat"
                    onClick={(event) => {
                      event.preventDefault();
                      let href = '/chat?taskIntent=unavailable';
                      try {
                        href = beginTaskQuestion(initial.job_role, task.id);
                      } catch {
                        /* Chat explains that the handoff is unavailable. */
                      }
                      router.push(href);
                    }}
                  >
                    Ask about this task
                  </Link>
                ) : null}
                <label className="checklist-completion">
                  <input
                    type="checkbox"
                    disabled={!ready}
                    checked={completed.has(task.id)}
                    aria-label={task.title}
                    onChange={(event) => {
                      const next = new Set(completed);
                      if (event.target.checked) next.add(task.id);
                      else next.delete(task.id);
                      setActivity({
                        ...activity,
                        completed: {
                          ...activity.completed,
                          [initial.job_role]: [...next],
                        },
                      });
                      try {
                        changeChecklistTask(
                          initial.job_role,
                          task.id,
                          event.target.checked,
                        );
                        setActivity({
                          ...loadChecklistActivity(),
                          role: initial.job_role,
                        });
                      } catch {
                        setNotice(
                          'Progress cannot be saved in this browser. Checklist progress is temporary in this tab and may be lost on reload.',
                        );
                      }
                    }}
                  />
                  {completed.has(task.id) ? 'Complete' : 'Mark complete'}
                </label>
              </article>
            ))}
          </section>
        ) : null;
      })}
    </>
  );
}
