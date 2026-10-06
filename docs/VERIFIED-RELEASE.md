# Verified release notes — v1.1

Date: 2026-10-06

## Verified in the packaging environment
- C++20 worker configures and compiles successfully with CMake.
- `flowpilot-worker --health` exits successfully and prints `ok`.
- All local TypeScript/TSX imports resolve to files present in the archive.
- Required submission artifacts are present: README, API docs, architecture, `.env.example`, Prisma database schema, requirement traceability and verification checklist.
- ZIP integrity is checked after packaging.
- Requirement audit corrected retries, durable delays, approval continuation, scheduling/deduplication, database actions, workflow duplicate/delete UI, execution controls, team/notification APIs and scheduling UI.

## Not verifiable without external infrastructure
`npm install` timed out in this sandbox, so `prisma generate`, `tsc`, `next build`, and browser/PostgreSQL end-to-end tests could not be completed here. Before a public submission, run the commands in `docs/VERIFICATION.md` on a machine with npm registry access and PostgreSQL. A public URL and GitHub repository also require the submitter's external accounts.

No claim in this repository should be read as evidence that those external checks/deployments have already occurred.
