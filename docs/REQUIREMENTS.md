# FlowPilot challenge requirements — traceability

Every instruction from the supplied brief is represented below. “Implemented” means source exists in this release. “External gate” means completion necessarily requires infrastructure/account access outside the source archive.

| Original instruction | Status | Evidence |
|---|---|---|
| Visual AI Workflow Builder | Implemented | React Flow editor + persisted executor |
| React Flow / Next.js | Implemented | `components/WorkflowEditor.tsx`, Next.js App Router |
| AI | Implemented | OpenAI Responses adapter in `lib/engine.ts` |
| Node.js / Python | Node.js implemented; Python not required | Next.js/Node runtime; user-requested C++20 native boundary also included |
| PostgreSQL | Implemented | Prisma PostgreSQL schema |
| Automation | Implemented | durable worker/scheduler/executor |
| Unique FlowPilot logo | Implemented | global FlowPilot mark in layout/CSS |
| Signup / Login / Logout | Implemented | auth pages/routes + signed HttpOnly session |
| Dashboard | Implemented | `/dashboard` |
| Workflow creation | Implemented | create API/UI |
| Duplication and deletion | Implemented | workflow action API/UI |
| Drag-and-drop workflow canvas | Implemented | React Flow canvas |
| Node connections | Implemented | React Flow edges/handles |
| AI actions | Implemented | AI node |
| HTTP/API requests | Implemented | HTTP node |
| Conditions | Implemented | condition node |
| Delays | Implemented | durable `resumeAt` delays |
| Human approvals | Implemented | approval records + pause/resolve/continue |
| Webhooks | Implemented | tokenized published-workflow webhook route |
| Database actions | Implemented safely | allow-listed DB adapter; arbitrary SQL prohibited |
| Variables | Implemented | `{{input.*}}`, `{{steps.*}}`, `{{env.*}}` interpolation |
| Conditional branches | Implemented | true/false handles and traversal |
| Retries | Implemented | per-node attempts + exponential backoff + logs |
| Scheduled executions | Implemented | 5-field UTC cron worker + ScheduleFire dedupe |
| Manual triggers | Implemented | Run now/API |
| Webhook URLs | Implemented | unique token per workflow displayed in editor |
| Workflow versions | Implemented | immutable publish snapshots |
| Draft and published states | Implemented | state model + editor controls |
| Execution history | Implemented | dashboard/detail |
| Individual step logs | Implemented | ExecutionStep, attempts/duration/errors |
| Failed-job handling | Implemented | FAILED persistence + retry endpoint/control |
| Pause and resume controls | Implemented | API/UI; cancel also included |
| Team members | Implemented | API + `/settings` management UI |
| Role-based approvals | Implemented | APPROVER/ADMIN/OWNER gate |
| Notification system | Implemented | model/API + settings inbox/read UI + workflow DB adapter |
| Secret/environment variable management | Implemented | AES-256-GCM at rest, masked management UI, `{{env.KEY}}`; resolved values excluded from step-input logs |
| Analytics | Implemented | API + `/analytics` UI |
| Success rates | Implemented | dashboard/analytics |
| Execution duration statistics | Implemented | analytics average + recent durations |
| Secure backend authorization | Implemented baseline | signed HttpOnly sessions, team authorization/RBAC, production-secret requirement, no arbitrary SQL |
| Real workflow execution | Implemented | persisted graph executor and worker |
| Persistent database storage | Implemented | PostgreSQL/Prisma |
| Responsive UI | Implemented | responsive CSS/mobile collapse |
| Proper error handling | Implemented baseline | status responses, execution errors, failed steps/retries |
| Powered by Codyza visibly | Implemented | global production layout branding |
| C++ requested in follow-up | Implemented boundary | C++20 native worker executable builds/health-checks; web UI remains React/Next.js as required |
| Public live URL | External gate | deploy source with hosting/PostgreSQL credentials |
| GitHub repository | External gate | push repository to submitter GitHub account |
| README | Implemented | `README.md` |
| API documentation | Implemented | `docs/API.md` |
| `.env.example` | Implemented | root file |
| Database schema | Implemented | `prisma/schema.prisma` |
| Architecture explanation | Implemented | `docs/ARCHITECTURE.md` |

## Definition of 100% submission completion

Source completeness is not the same as deployment verification. The submission becomes fully complete only after `npm run verify`, PostgreSQL migration/E2E acceptance, GitHub publication, public deployment, and repetition of the acceptance checklist against the live URL. No archive can truthfully pre-certify those account/infrastructure steps.
