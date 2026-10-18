
'use client';

import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout() {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Reload the application so server-side pages
      // recognize that the session has ended.
      window.location.replace('/login');
    } catch {
      setError('Could not log out. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn secondary"
        onClick={handleLogout}
        disabled={loading}
        aria-busy={loading}
        style={{
          whiteSpace: 'nowrap',
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? 'Logging out...' : 'Log out'}
      </button>

      {error && (
        <span
          role="alert"
          style={{
            color: '#fca5a5',
            fontSize: 12,
          }}
        >
          {error}
        </span>
      )}
    </>
  );
}
