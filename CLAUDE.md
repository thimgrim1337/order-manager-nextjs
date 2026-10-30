## Project Overview

This is NextJS 16 App Router app, using shadcn for styling and drizzle for datebase.

## Project Structure

- 'app/' - Pages, file-based routing
- 'components/' - Shared UI components
- 'db/' - Database migrations and schemas
- 'features/' - App features,
- 'lib/' - Utilites, API helpers, DTO and DAL
- '__tests__/' - Tests: `*.test.ts` (browser), `*.db.test.ts` (db, seed in `__tests__/db/seed.ts`), `e2e/*.spec.ts` (Playwright, seed in `e2e/helpers/seed.ts`)

## Purpose

It's Transport Order Manager. The core functionality is CRUD orders and display on timeline table.

## Development Commands

- 'pnpm add' - Install dependencies (NOT npm)
- 'pnpm dev' - Start the db container and Next dev server on :3000. If :3000 is down, start it in the background and read its log; use it to check UI acceptance criteria.
- 'pnpm check' - Run Biome check --write
- 'pnpm typecheck' - Run tsc --noEmit
- 'pnpm exec vitest --run [path]' - Run tests once. Two projects: `browser` (Chromium) and `db` (node, `*.db.test.ts` against real Postgres). The `db` project needs the `db-test` container up ('NODE_ENV=test docker compose up db-test -d'); it migrates it, and each test runs inside `withRollback` (`__tests__/db/with-rollback.ts`). Pick one with '--project browser|db'. 'pnpm test' is watch mode. The pre-commit hook runs typecheck and the full suite, so let the commit be the final full run.
- 'pnpm test:e2e' - Playwright against the db-test container and a production build on :3001; if that port is taken, set `E2E_PORT`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`thimgrim1337/order-manager-nextjs`) via the `gh` CLI. Read `docs/agents/issue-tracker.md` before creating, updating or closing one.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Git conventions

- Commit messages: concise Conventional Commits (`type(scope): subject`), minimal or no body.
- Every change goes on a branch for its feature (e.g. `feat/<feature>`, `chore/<topic>`), not an unrelated feature branch. The pre-commit hook rejects commits on `main`.
- Follow-ups from reviewing the current branch (refactors, typos, review findings) stay on that branch.
- `main` stays linear: rebase the branch onto `main`, then fast-forward it (`merge.ff only` refuses anything else). No merge commits.
