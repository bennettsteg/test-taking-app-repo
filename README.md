# Practice Tests

A personal app for turning your notes into practice tests. You write notes, ask an AI
(Claude, ChatGPT, whatever) to convert them into the JSON format below, upload the JSON
here, and then take the test and review your score.

This app does **not** call any AI itself — generating the test JSON is something you do
in a separate chat with your AI of choice, using the format below.

## JSON format for uploading a test

Upload a `.json` file shaped like this:

```json
{
  "title": "Cell Biology Midterm",
  "description": "Chapters 3-5 review",
  "questions": [
    {
      "type": "multiple_choice",
      "prompt": "Which organelle is the site of ATP production?",
      "options": ["Nucleus", "Mitochondria", "Golgi apparatus", "Ribosome"],
      "correctAnswer": "Mitochondria",
      "explanation": "Mitochondria produce ATP via oxidative phosphorylation."
    },
    {
      "type": "true_false",
      "prompt": "The cell membrane is composed of a phospholipid bilayer.",
      "correctAnswer": true
    }
  ]
}
```

### Top level

| Field         | Type   | Required | Notes                |
|---------------|--------|----------|----------------------|
| `title`       | string | yes      | Non-empty.           |
| `description` | string | no       |                      |
| `questions`   | array  | yes      | At least 1 question. |

### `multiple_choice` question

| Field           | Type                | Required | Notes                                                                  |
|-----------------|---------------------|----------|------------------------------------------------------------------------|
| `type`          | `"multiple_choice"` | yes      |                                                                        |
| `prompt`        | string              | yes      | The question text.                                                     |
| `options`       | string\[\]          | yes      | 2 to 4 options, all unique.                                             |
| `correctAnswer` | string              | yes      | Must exactly match (after trimming whitespace) one entry in `options`. |
| `explanation`   | string              | no       | Shown on the results page.                                             |

### `true_false` question

| Field           | Type           | Required | Notes                                                  |
|-----------------|----------------|----------|--------------------------------------------------------|
| `type`          | `"true_false"` | yes      |                                                        |
| `prompt`        | string         | yes      | The question text.                                     |
| `correctAnswer` | boolean        | yes      | `true` or `false`, not the strings `"true"`/`"false"`. |
| `explanation`   | string         | no       | Shown on the results page.                             |

No other question types are supported yet. A machine-readable version of this schema
(generated from the same validator the app uses, so it can never drift) lives at
[`schema/test-import.schema.json`](schema/test-import.schema.json) — regenerate it with
`npm run schema:generate` after changing `src/lib/test-import-schema.ts`.

If an uploaded file doesn't match this format, the upload is rejected with a
per-question error message (e.g. "Question 2: correctAnswer does not match any option")
instead of being silently accepted.

### Prompt template for generating a test

Paste your notes after a prompt like this into Claude/ChatGPT/etc.:

> Convert the following notes into a JSON test file matching this exact format: [paste
> the JSON format section above]. Only use `multiple_choice` and `true_false` question
> types. `multiple_choice` questions must have between 2 and 4 options. Output only the
> JSON, no other text.
>
> Notes:
> [your notes here]

## Local development

Requires Node.js 20+ and the [Prisma CLI](https://www.prisma.io/docs/orm/tools/prisma-cli) (installed as a dev dependency).

```bash
npm install
npx prisma dev          # starts a local Postgres server (no Docker needed)
npm run db:push         # apply the schema to it
npm run dev             # http://localhost:3000
```

Other useful commands:

```bash
npm test                # run the Vitest suite (grading logic, JSON schema validation)
npm run lint            # ESLint
npm run build            # production build sanity check
npm run schema:generate  # regenerate schema/test-import.schema.json from the Zod schema
```

## Deployment (home server)

This app is deployed via Docker to a home server. Postgres is **not** bundled — it
connects to an existing Postgres server already running there, using its own dedicated
database.

1. On the existing Postgres server, create a new database (and credentials) for this app.
2. On the home server, create a `.env` file next to `docker-compose.yml` with:

   ```
   DATABASE_URL=postgresql://user:password@your-postgres-host:5432/your_new_db
   ```
3. Build and run:

   ```bash
   docker compose build
   docker compose run --rm app npx prisma migrate deploy
   docker compose up -d
   ```
4. After any future schema change, re-run `docker compose run --rm app npx prisma migrate deploy`.

See `CLAUDE.md` for the full architecture and schema details.