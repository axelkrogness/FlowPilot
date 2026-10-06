# FlowPilot — Visual AI Workflow Builder

FlowPilot is a full-stack visual automation platform for building and executing persisted workflows. The browser editor uses Next.js + React Flow; PostgreSQL/Prisma stores workflows, immutable published versions, executions, attempts, approvals, teams, encrypted secrets and notifications. A durable worker handles queued and scheduled work. A C++20 worker boundary is included and compile-tested for native-worker integration.

**Powered by Codyza** is displayed in the application chrome and landing page.

## Features

FlowPilot includes signup/login/logout, teams and RBAC, workflow create/duplicate/delete, React Flow node editing and connections, variables, HTTP and AI nodes, conditions and branches, durable delays, human approvals, webhooks, allow-listed database actions, retries, UTC cron schedules, manual triggers, immutable versions, draft/published state, execution history, per-attempt step logs, failed-job retry, pause/resume/cancel, notifications, AES-256-GCM encrypted secrets, analytics, success rates and duration metrics.

See `docs/REQUIREMENTS.md` for a line-by-line mapping of the original brief.

## Quick start

```bash
cp .env.example .env
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

Run the durable scheduler/executor in another terminal:

```bash
npm run worker
```

Open `http://localhost:3000`. For AI nodes, set `OPENAI_API_KEY`.

## C++20 worker

```bash
npm run cpp:build
./cpp-worker/build/flowpilot-worker --health
```

The C++ executable is a native worker boundary. The TypeScript worker is the reference PostgreSQL-integrated scheduler/executor in this repository so the app does not depend on third-party native DB/HTTP libraries.

## Environment

`DATABASE_URL` points at PostgreSQL. `AUTH_SECRET` signs HttpOnly sessions. `ENCRYPTION_KEY` protects stored secrets with AES-256-GCM. Use long random production values. `OPENAI_API_KEY` enables AI nodes.

## Architecture

```text
Next.js / React Flow UI
        |
Authenticated Next.js APIs ---- Webhook endpoint
        |
PostgreSQL + Prisma
        |
Durable worker (queue + cron + resume)
        |
Graph executor -> HTTP / OpenAI / approval / DB adapters

C++20 native worker boundary (cpp-worker/)
```

Published workflow versions are immutable snapshots. Executions reference a version and persist context, current node, resume time and every step attempt. Long delays pause with `resumeAt`; the worker requeues them. Schedules use five-field UTC cron expressions and `ScheduleFire` uniqueness prevents duplicate firing for the same minute.

## Security notes

Sessions are signed and stored in HttpOnly cookies. API access is scoped by team membership; privileged operations use role checks. Secret values are encrypted at rest and list APIs never return plaintext. The database workflow node is allow-listed and does not accept arbitrary SQL. For an internet-facing deployment, place the app behind TLS and add infrastructure-level rate limiting/WAF controls.

## Documentation

- `docs/API.md` — HTTP API
- `docs/ARCHITECTURE.md` — system design
- `docs/REQUIREMENTS.md` — original instruction traceability
- `docs/VERIFICATION.md` — build and smoke-test checklist
- `prisma/schema.prisma` — database schema
- `.env.example` — environment template

## Deployment and submission

The source is ready to push to GitHub and deploy to a Node-compatible host with PostgreSQL. Run both the web process (`npm start`) and worker (`npm run worker`). The challenge also requires a **real public URL and GitHub repository**; those must be created in the submitter's external hosting/GitHub accounts and are not fabricated by this package.

## v1.2 verification and acceptance

This release includes a requirements-by-requirements traceability matrix in `docs/REQUIREMENTS.md` and a reproducible acceptance checklist in `docs/VERIFICATION.md`. Run `npm run verify` before deployment. Production must set strong `AUTH_SECRET` and `ENCRYPTION_KEY` values; the application refuses missing production keys. Workflow secrets are referenced as `{{env.KEY}}`, decrypted only for execution, masked in management APIs/UI, and excluded from persisted step-input logs.
