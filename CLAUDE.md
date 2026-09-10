# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal, single-user web app for creating and taking practice tests generated from
the user's own notes. Workflow: user writes notes, separately prompts an external AI
(Claude/ChatGPT, outside this app) to convert them into a standardized JSON test format
(documented in `README.md` and `schema/test-import.schema.json`), uploads that JSON here,
the app validates and stores it in Postgres, and the user takes the test and reviews the
graded result.

This app never calls an LLM itself — AI generation is entirely external. There is no
authentication/user system; it's single-user by design.

`AGENTS.md` in this repo is auto-generated/re-added by `next dev` itself (Next.js 16
ships breaking changes from older training data); it's official Next.js behavior, not
something to remove — see its contents for where to find the bundled docs.

## Tech stack

- **Next.js (App Router) + TypeScript** — one unified app, no separate frontend/backend.
- **Prisma ORM 7** with the **`@prisma/adapter-pg`** driver adapter — Prisma 7's
  `prisma-client` generator does not connect via `DATABASE_URL` alone; it requires an
  explicit driver adapter (`src/lib/prisma.ts`). There is no native query-engine binary
  to worry about in Docker.
- **Zod** — single source of truth for the test-upload JSON contract
  (`src/lib/test-import-schema.ts`) and API request validation. The JSON Schema doc at
  `schema/test-import.schema.json` is generated from this Zod schema
  (`npm run schema:generate`), so it can't drift from the real validator.
- **Tailwind CSS** — plain utility classes, no component library.
- **Vitest** — unit tests for grading logic and schema validation.
- Plain integer autoincrement primary keys throughout (no UUIDs — no multi-tenancy here).

## Commands

```bash
npm install
npx prisma dev              # start local Postgres (no Docker needed) — see "Local database" below
npm run db:push             # apply prisma/schema.prisma to the local dev database
npm run dev                 # http://localhost:3000

npm test                    # vitest run
npm run lint                # eslint
npm run build                # production build (also type-checks)
npm run schema:generate      # regenerate schema/test-import.schema.json from Zod

npm run db:generate         # regenerate the Prisma Client after schema changes
npm run db:migrate:deploy   # apply committed migrations (used in production, see Deployment)
```

Run a single Vitest file: `npx vitest run src/lib/grading.test.ts`.

## Architecture

### Data model (`prisma/schema.prisma`)

Five models, all mapped into a dedicated Postgres schema called `test_taking_app` (see
"Local database" below for why):

- `Test` — title/description, `rawImport` (the original uploaded JSON, kept for debugging).
- `Question` — belongs to a `Test`; `type` is `multiple_choice` or `true_false`.
- `QuestionOption` — belongs to a `Question`. **Both question types are graded through
  this table.** `true_false` questions have no explicit options in the JSON import
  format, so the upload handler (`src/lib/test-import-schema.ts`'s `toOptionInputs`)
  materializes synthetic `"True"`/`"False"` option rows for them. This means grading
  logic never needs to branch on question type — it always grades by comparing a
  `selectedOptionId` against `QuestionOption.isCorrect`.
- `TestAttempt` — one per test submission; stores the computed score.
- `AttemptResponse` — one per question per attempt; records which option was selected
  and whether it was correct.

v1 attempts are submitted atomically (no save-and-resume) — the take-test page holds
answers in client state and a single `POST` creates the attempt + all responses.

### Grading is always server-side

`GET /api/tests/[testId]` (used by the take-test page) strips `isCorrect` from every
option before sending it to the client. Submission (`POST /api/tests/[testId]/attempts`)
sends only `{ questionId, selectedOptionId }` pairs; the server re-fetches the questions'
real options from the database and computes correctness itself
(`src/lib/grading.ts`'s `gradeAttempt`), ignoring any correctness the client might send.
Never change this to trust a client-supplied `isCorrect` value.

### Routes

Pages under `src/app/`: `/` (library), `/tests/upload`, `/tests/[testId]` (detail),
`/tests/[testId]/take`, `/tests/[testId]/attempts` (history),
`/tests/[testId]/attempts/[attemptId]` (graded result).

API routes under `src/app/api/tests/`: `GET/POST /api/tests`,
`GET/DELETE /api/tests/[testId]`, `GET/POST /api/tests/[testId]/attempts`,
`GET /api/tests/[testId]/attempts/[attemptId]`.

Most pages are server components that query Prisma directly (no self-fetching the API).
The API routes exist for client-side interactions: the upload form and the take-test
submit button.

`QuestionCard` (`src/components/QuestionCard.tsx`) always renders an `<input onChange>`,
so it's marked `"use client"` even though it's also used read-only (with `showResult`)
from server-component pages like the attempt-result page. Forgetting this causes a
"Event handlers cannot be passed to Client Component props" runtime error — hit and
fixed once already during initial development.

## Local database

There's no bundled Postgres container for local dev. `npx prisma dev` runs a local
Prisma Postgres server directly (no Docker required) — see
[Prisma's docs](https://www.prisma.io/docs/postgres/database/local-development).

**Named instances beyond the default one are unreliable on this dev machine**: creating
a second named `prisma dev` instance (e.g. `--name test-taking-app`) reproducibly hangs
forever at "starting_up" (near-zero CPU, no port ever opened) — looks like a bug in this
early-access Windows feature. Because of that, local dev reuses the pre-existing shared
`default` instance, which also has leftover tables from an unrelated old project on this
machine.

To make that safe, this app's tables live in their own Postgres schema —
`test_taking_app` — via Prisma's multi-schema support:

```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["test_taking_app"]
}
// every model/enum also has @@schema("test_taking_app")
```

**Why this matters**: without an explicit schema scope, `prisma db push` (and
`migrate dev`) treat the *entire* `public` schema as theirs to manage, and will offer to
`DROP` any table there that isn't in `prisma/schema.prisma` — including another
project's real data. This was caught by a dry-run warning before anything was applied;
don't remove the schema scoping to "simplify" the datasource block.

Local dev uses `npm run db:push`, not `prisma migrate dev` — the latter refuses to run
against a database that isn't fully empty, and the shared `default` instance never is
(other project's tables live in `public`). Formal migration files still exist in
`prisma/migrations/` (generated once via `prisma migrate diff --from-empty`, which
doesn't need a live database connection) for use in production, where the home server's
dedicated database *is* genuinely empty on first deploy.

If a future session ever gets a working isolated named `prisma dev` instance (e.g. after
a Prisma bugfix), it would be safe to switch local dev to `prisma migrate dev` instead,
but the multi-schema scoping should stay regardless — it's cheap insurance.

## Deployment (home server)

Deploys via Docker to the user's home server. Postgres is **not** part of this project's
Docker setup — an existing Postgres server already runs there, and this app gets its own
dedicated database on it. `docker-compose.yml` defines two services: `migrate`, which
runs `prisma migrate deploy` (applies `prisma/migrations/`) and exits, and `app`, which
`depends_on` `migrate` with `condition: service_completed_successfully` so it never
starts against an unmigrated schema. `DATABASE_URL` (supplied via a `.env` file next to
the compose file on the server) points at the existing Postgres host and the new
database.

Both services build from the same `Dockerfile` `runner` stage — it already carries the
Prisma CLI, `prisma/schema.prisma`, and `prisma/migrations/` (copied in for the
`docker compose run --rm app npx prisma migrate deploy` workflow this replaced), so
`migrate` doesn't need to target the `builder` stage.

Deploy (first time and every time after): `docker compose build`, then
`docker compose up -d` — `migrate` runs automatically before `app` (re)starts. No
separate manual migration step. See `README.md` for the full command sequence.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
