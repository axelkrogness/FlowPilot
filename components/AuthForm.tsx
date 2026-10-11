
'use client';

import { useState, type FormEvent } from 'react';

type AuthMode = 'login' | 'signup';

export default function AuthForm({
  mode,
}: {
  mode: AuthMode;
}) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);

      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        setError(
          data.error ||
            (mode === 'login'
              ? 'Unable to log in. Please check your details.'
              : 'Unable to create your account.')
        );

        setLoading(false);
        return;
      }

      // Authentication succeeded.
      // Perform a full navigation so the dashboard receives
      // the newly established authentication cookie.
      window.location.replace('/dashboard');
    } catch {
      setError(
        'A connection error occurred. Please try again.'
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card auth">
      <h1>
        {mode === 'login'
          ? 'Welcome back'
          : 'Create your account'}
      </h1>

      {mode === 'signup' && (
        <>
          <label htmlFor="auth-name">Name</label>
          <input
            id="auth-name"
            className="input"
            name="name"
            autoComplete="name"
            required
            disabled={loading}
          />
        </>
      )}

      <label htmlFor="auth-email">Email</label>
      <input
        id="auth-email"
        className="input"
        type="email"
        name="email"
        autoComplete="email"
        required
        disabled={loading}
      />

      <label htmlFor="auth-password">Password</label>
      <input
        id="auth-password"
        className="input"
        type="password"
        name="password"
        autoComplete={
          mode === 'login'
            ? 'current-password'
            : 'new-password'
        }
        minLength={8}
        required
        disabled={loading}
      />

      {error && (
        <p
          role="alert"
          style={{
            color: '#fca5a5',
            marginTop: 12,
            fontSize: 14,
          }}
        >
          {error}
        </p>
      )}

      <button
        className="btn"
        type="submit"
        disabled={loading}
        aria-busy={loading}
        style={{
          width: '100%',
          marginTop: 16,
          opacity: loading ? 0.75 : 1,
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading
          ? mode === 'login'
            ? 'Logging in...'
            : 'Creating account...'
          : mode === 'login'
            ? 'Log in'
            : 'Sign up'}
      </button>

      {loading && (
        <p
          className="muted"
          role="status"
          style={{
            textAlign: 'center',
            fontSize: 13,
            marginTop: 10,
          }}
        >
          {mode === 'login'
            ? 'Signing you in, please wait...'
            : 'Creating your account, please wait...'}
        </p>
      )}
    </form>
  );
}
