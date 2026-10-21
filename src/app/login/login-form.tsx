'use client';
import { useRef, useState } from 'react';
import { Brand } from '@/components/brand';
export function LoginForm({
  demoEmail,
  demoPassword,
  initialMessage,
}: {
  demoEmail: string;
  demoPassword: string;
  initialMessage: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialMessage);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok)
        throw Error(data.error ?? 'Unable to sign in. Please try again.');
      window.location.assign(data.redirect);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in.');
      setBusy(false);
    }
  }
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label + ' copied.');
    } catch {
      setCopied('Copy unavailable. Select the credential to copy it manually.');
    }
  }
  return (
    <main className="login-layout">
      <section className="welcome-panel">
        <Brand />
        <div className="welcome-copy">
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h1>
            Great work starts
            <br />
            with a good first day.
          </h1>
          <p>
            Find your bearings. Meet your tools.
            <br />
            Ask the questions that move you forward.
          </p>
          <div className="welcome-card">
            <span className="section-label">YOUR FIRST WEEK, MADE CLEAR</span>
            <h2>One place for every new beginning.</h2>
            <ul>
              <li>A clear path for your role</li>
              <li>Answers grounded in team knowledge</li>
              <li>Small steps. Visible progress.</li>
            </ul>
          </div>
        </div>
        <span className="welcome-footer">
          FIRSTDAY / BUILT FOR CURIOUS PEOPLE
        </span>
      </section>
      <section className="login-panel">
        <div className="login-content">
          <span className="section-label">YOUR NEXT CHAPTER</span>
          <h2>Welcome to FirstDay</h2>
          <p className="muted">Your next chapter starts here.</p>
          <form onSubmit={submit}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="button primary full" disabled={busy}>
              {busy ? 'Signing in…' : 'Log in →'}
            </button>
          </form>
          <button
            className="button secondary full"
            onClick={() => dialog.current?.showModal()}
          >
            View demo account
          </button>
          <p className="hint">
            Just exploring? Try the sample workspace.
            <br />
            Your demo chats and progress stay in this browser.
          </p>
          <p className="admin-hint">
            Administrator? Use your private account to sign in.
          </p>
        </div>
      </section>
      <dialog
        ref={dialog}
        aria-labelledby="demo-title"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <span className="eyebrow">EXPLORE FIRSTDAY</span>
        <h2 id="demo-title">A first day, without the signup.</h2>
        <p className="muted">
          Use the sample account to explore your workspace.
        </p>
        {demoEmail && demoPassword ? (
          <>
            <div className="credential">
              <span>Demo email</span>
              <div>
                <code>{demoEmail}</code>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => copy(demoEmail, 'Email')}
                >
                  Copy email
                </button>
              </div>
            </div>
            <div className="credential">
              <span>Demo password</span>
              <div>
                <code>{demoPassword}</code>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => copy(demoPassword, 'Password')}
                >
                  Copy password
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="notice">
            The demo account is not configured yet. Ask the workspace owner to
            finish setup.
          </p>
        )}
        <p role="status" className="hint">
          {copied}
        </p>
        <div className="dialog-actions">
          <button
            className="button primary"
            disabled={!demoEmail || !demoPassword}
            onClick={() => {
              setEmail(demoEmail);
              setPassword(demoPassword);
              dialog.current?.close();
            }}
          >
            Fill login form
          </button>
          <button
            className="button secondary"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <p className="hint">
          Sample content only. Activity stays in this browser.
        </p>
      </dialog>
    </main>
  );
}
