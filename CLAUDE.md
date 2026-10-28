## Project Overview

This is NextJS 16 App Router app, using shadcn for styling and drizzle for datebase.

## Project Structure

- 'app/' - Pages, file-based routing
- 'components/' - Shared UI components
- 'db/' - Database migrations and schemas
- 'features/' - App features,
- 'lib/' - Utilites, API helpers, DTO and DAL

## Purpose

It's Transport Order Manager. The core functionality is CRUD orders and display on timeline table.

## Development Commands

- 'pnpm add' - Install dependencies (NOT npm)
- 'pnpm dev' - Start the db container and Next dev server on :3000. If :3000 is down, start it in the background and read its log; use it to check UI acceptance criteria.
- 'pnpm check' - Run Biome check --write
- 'pnpm typecheck' - Run tsc --noEmit
- 'pnpm exec vitest --run [path]' - Run tests once (browser mode, Chromium). 'pnpm test' is watch mode.
- 'pnpm test:e2e' - Playwright against the db-test container and a production build

## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Git conventions

- Commit messages: concise Conventional Commits (`type(scope): subject`), minimal or no body.
- No `Co-Authored-By` trailer or any other attribution lines in commits.
- No "Generated with Claude Code" (or similar) line in PR descriptions.
- Every change goes on a branch for its feature (e.g. `feat/<feature>`, `chore/<topic>`), never directly on `main` or on an unrelated feature branch.
