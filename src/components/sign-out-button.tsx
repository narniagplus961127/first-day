'use client';
import { useState } from 'react';
export function SignOutButton() {
  const [error, setError] = useState(false);
  return (
    <>
      <button
        className="button secondary full"
        onClick={async () => {
          setError(false);
          try {
            const r = await fetch('/api/auth/logout', { method: 'POST' });
            if (!r.ok) throw Error();
            window.location.assign('/login');
          } catch {
            setError(true);
          }
        }}
      >
        Sign out
      </button>
      {error && (
        <p role="alert" className="hint">
          Unable to sign out. Please try again.
        </p>
      )}
    </>
  );
}
