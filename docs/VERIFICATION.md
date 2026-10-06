# Verification

## One-command application verification

After installing dependencies and setting `DATABASE_URL`, `AUTH_SECRET`, and `ENCRYPTION_KEY`:

```bash
npm run verify
npx prisma migrate dev --name init
npm run db:seed
npm run worker
npm run dev
```

`npm run verify` runs source coverage checks, compiles/runs the C++20 worker health check, TypeScript type checking, and the Next.js production build.

## End-to-end acceptance checklist

1. Sign up, log out, and log back in.
2. Create, duplicate, and delete a workflow.
3. Add and connect trigger, HTTP, AI, condition, delay, approval, and database nodes.
4. Save a draft, publish it, edit the draft, and confirm the published version remains immutable.
5. Run manually and inspect execution + per-attempt step logs.
6. Force an HTTP failure, confirm retries/backoff and FAILED state, then retry the job.
7. Pause/resume/cancel an execution.
8. Trigger the published webhook URL.
9. Set a UTC cron schedule and confirm the worker creates one deduplicated scheduled execution.
10. Add an APPROVER member and resolve an approval; confirm the worker continues the same execution.
11. Save a secret, reference it as `{{env.KEY}}`, and confirm its value is absent from step-input logs/API responses.
12. Verify notifications and mark-read behavior.
13. Verify Analytics shows success rate and execution duration statistics.
14. Test narrow/mobile viewport behavior.
15. Deploy with production secrets and PostgreSQL, then repeat 1–13 against the public URL.

## Checks completed in the packaging environment

- `npm run verify:source`: PASS.
- `npm run verify:cpp`: PASS with GNU C++ 14.2 / C++20.
- ZIP CRC/integrity: run before packaging completion.
- Full npm dependency install: BLOCKED by sandbox network timeout, therefore TypeScript/Next.js build is not claimed as executed here.
- PostgreSQL E2E: BLOCKED because this sandbox has no PostgreSQL service/client/container runtime.
- GitHub/public deployment: requires the submitter's external account/credentials.
