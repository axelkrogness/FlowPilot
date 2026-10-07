'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({
  mode,
}: {
  mode: 'login' | 'signup';
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);

      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(form)),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        setError(
          data.error ||
            (mode === 'signup'
              ? 'Account could not be created'
              : 'Unable to log in')
        );

        setLoading(false);
        return;
      }

      // Authentication succeeded. Keep the form in its loading state
      // while Next.js navigates away so stale errors cannot flash.
      setError('');
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError(
        mode === 'signup'
          ? 'Account could not be created'
          : 'Unable to log in'
      );

      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card auth">
      <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>

      {mode === 'signup' && (
        <>
          <label>Name</label>
          <input
            className="input"
            name="name"
            required
            disabled={loading}
          />
        </>
      )}

      <label>Email</label>
      <input
        className="input"
        type="email"
        name="email"
        required
        disabled={loading}
      />

      <label>Password</label>
      <input
        className="input"
        type="password"
        name="password"
        minLength={8}
        required
        disabled={loading}
      />

      {error && (
        <p role="alert" style={{ color: '#fca5a5' }}>
          {error}
        </p>
      )}

      <button
        className="btn"
        type="submit"
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading
          ? mode === 'login'
            ? 'Logging in...'
            : 'Creating account...'
          : mode === 'login'
            ? 'Log in'
            : 'Sign up'}
      </button>
    </form>
  );
}