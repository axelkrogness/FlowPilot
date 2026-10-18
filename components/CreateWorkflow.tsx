
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateWorkflow() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createWorkflow() {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Untitled workflow',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not create workflow'
        );
      }

      if (!data.id) {
        throw new Error('Workflow ID was not returned');
      }

      router.push(`/workflows/${data.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      );
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="btn"
        type="button"
        onClick={createWorkflow}
        disabled={loading}
        aria-busy={loading}
        style={{
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'wait' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Creating workflow...' : '+ New workflow'}
      </button>

      {error && (
        <span
          role="alert"
          style={{
            color: '#fca5a5',
            fontSize: 13,
          }}
        >
          {error}
        </span>
      )}
    </>
  );
}
