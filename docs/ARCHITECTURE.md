# Architecture

FlowPilot is a Next.js application backed by PostgreSQL/Prisma. The React Flow editor saves a draft graph. Publishing copies that graph into an immutable `WorkflowVersion`; executions point at a version so later edits cannot rewrite history.

The execution engine traverses directed edges from a trigger node, persists an `ExecutionStep` before each action, interpolates runtime variables, executes the adapter, records output/duration, and selects the next edge. Condition nodes select `true` or `false` handles. HTTP and AI nodes perform real network calls. Approval nodes persist an approval and pause execution. Secrets use AES-256-GCM at rest.

For production scale, API handlers should enqueue executions and the included worker should consume them. A managed queue (Redis/SQS) and scheduler (e.g. cron service) can replace database polling without changing the execution data model. Database action nodes intentionally require an approved adapter rather than accepting arbitrary SQL from the browser.

Security boundaries: HttpOnly signed sessions; team-scoped authorization; role checks for secret mutation; encrypted secret values never returned by the API; immutable versions; webhook tokens; server-side execution. Add CSRF/origin enforcement, rate limits, audit logs, secret rotation and a dedicated queue before high-risk production use.
