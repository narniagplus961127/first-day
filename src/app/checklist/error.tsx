'use client';
export default function ChecklistError({ reset }: { reset: () => void }) {
  return (
    <section>
      <h1>Checklist unavailable</h1>
      <p role="alert">The checklist could not be loaded. Please try again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
