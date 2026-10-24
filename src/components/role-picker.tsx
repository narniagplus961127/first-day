'use client';
import { useId, useRef } from 'react';
import { JOB_ROLES } from '@/lib/knowledge/types';
import type { OnboardingRole } from '@/lib/demo/checklists';
const descriptions = [
  'Build interfaces and find your frontend tools.',
  'Explore services, data and backend conventions.',
  'Find the design workspace and team practices.',
  'Understand discovery, requirements and delivery.',
  'Explore the fictional people and onboarding guides.',
];
export function RolePicker({
  role,
  onSelect,
}: {
  role: OnboardingRole;
  onSelect: (role: OnboardingRole) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  return (
    <>
      <button
        className="role-label role-picker-trigger"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
      >
        <strong>{role}</strong>
        <span>
          Change role <span aria-hidden="true">⌄</span>
        </span>
      </button>
      <dialog ref={dialog} aria-labelledby={id} className="role-dialog">
        <span className="section-label">YOUR WORKSPACE</span>
        <h2 id={id}>Choose your role.</h2>
        <p className="muted">
          A clear starting point for the work you do. Your progress stays
          separate for each role.
        </p>
        <div className="role-options">
          {JOB_ROLES.map((option, index) => (
            <button
              key={option}
              className="role-option"
              aria-pressed={option === role}
              onClick={() => {
                onSelect(option);
                dialog.current?.close();
              }}
            >
              <strong>{option}</strong>
              <span>{descriptions[index]}</span>
              {option === role && (
                <span className="role-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          className="button secondary full"
          onClick={() => dialog.current?.close()}
        >
          Keep current role
        </button>
      </dialog>
    </>
  );
}
