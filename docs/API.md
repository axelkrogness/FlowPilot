# FlowPilot API

All routes except signup/login/webhooks require the signed `flowpilot_session` HttpOnly cookie. Team-scoped routes verify membership; privileged routes enforce role checks.

## Authentication
`POST /api/auth/signup` — `{name,email,password}`. Creates user/team and session.  
`POST /api/auth/login` — `{email,password}`.  
`POST /api/auth/logout` — clears session.

## Workflows
`GET /api/workflows` — list accessible workflows.  
`POST /api/workflows` — `{name}` create draft.  
`PUT /api/workflows/:id` — update name/draft graph.  
`DELETE /api/workflows/:id` — delete workflow.  
`POST /api/workflows/:id/duplicate` — duplicate draft.  
`POST /api/workflows/:id/publish` — create immutable version and mark published.  
`POST /api/workflows/:id/execute` — `{input}` manual execution.  
`PUT /api/workflows/:id/schedule` — `{cron}` five-field UTC cron; empty disables.

## Executions
`GET /api/executions/:id` — execution, steps and approvals.  
`POST /api/executions/:id/pause`  
`POST /api/executions/:id/resume`  
`POST /api/executions/:id/retry` — creates a new execution using the same version/input.  
`POST /api/executions/:id/cancel`

## Approvals
`POST /api/approvals/:id/resolve` — `{approved,note}`; OWNER, ADMIN or APPROVER. Approval continues the paused execution; rejection fails it.

## Webhooks
`POST /api/webhooks/:token` — invokes a published workflow with request JSON as input.

## Teams, notifications, secrets
`GET /api/team` — accessible teams/roles.  
`GET /api/team/members` — members of current team.  
`POST /api/team/members` — `{email,role}`; OWNER/ADMIN; target must already be a FlowPilot user.  
`GET /api/notifications` — current user's notifications.  
`PATCH /api/notifications` — `{id}` marks read.  
`GET /api/secrets` — secret keys/metadata only.  
`POST /api/secrets` — `{key,value}` encrypted upsert; OWNER/ADMIN.

## Analytics / health
`GET /api/analytics` — total executions, success rate, average duration.  
`GET /api/health` — web health.
