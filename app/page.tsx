
import Link from 'next/link';

export default function Home() {
  return (
    <main
      className="container"
      style={{
        paddingTop: 100,
        paddingBottom: 60,
      }}
    >
      <div className="badge">
        Automation that actually runs
      </div>

      <h1
        style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          maxWidth: 850,
          margin: '20px 0',
          lineHeight: 1.12,
        }}
      >
        Build AI workflows visually.
        <br />
        Ship them reliably.
      </h1>

      <p
        className="muted"
        style={{
          fontSize: 20,
          maxWidth: 700,
          lineHeight: 1.7,
        }}
      >
        Connect triggers, APIs, AI actions, conditions,
        approvals, and delays. Publish workflow versions,
        inspect executions, and manage failed jobs.
      </p>

      <div
        className="row"
        style={{
          marginTop: 30,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Link className="btn" href="/signup">
          Start building
        </Link>

        <Link className="btn secondary" href="/login">
          Log in
        </Link>
      </div>

      <footer
        style={{
          marginTop: 100,
          paddingTop: 24,
          borderTop: '1px solid #34506f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <span className="muted">
          FlowPilot — Visual AI Workflow Builder
        </span>

        <a
          href="https://www.codyza.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#93c5fd',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Powered by Codyza
        </a>
      </footer>
    </main>
  );
}
