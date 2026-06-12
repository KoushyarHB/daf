# DaF web app

Standalone **full-stack Next.js** app: PostgreSQL, Auth.js sign-in, full card CRUD, paginated API, per-user studied progress.

Repo-root `vocab.manifest.json` is **authoring only** — import via CLI; the app never reads it at runtime.

## Local setup

### 1. Start Postgres

From the repo root:

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cd web
cp .env.example .env
```

Set `AUTH_SECRET` (e.g. `openssl rand -base64 32`).

### 3. Install and migrate

```bash
npm install
npm run db:migrate
```

Or quick dev sync: `npm run db:push` (existing DB with old schema may need `prisma migrate deploy` or reset).

### 4. Import manifest data

```bash
npm run db:import-manifest
```

Reads `vocab.manifest.json` and `lesson-pages.manifest.json` from the repo root. Cards are owned by the default import user (`system@import.local`).

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register or sign in to save studied progress and manage your own cards.

### Optional — AI fill on new cards

The **✨ AI fill** button uses [Google Gemini](https://aistudio.google.com/apikey) (free tier).

1. Create a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Add to `web/.env`:

```env
GEMINI_API_KEY="your-key-here"
```

Optional: `GEMINI_MODEL` (default `gemini-2.0-flash`).

On Vercel, add `GEMINI_API_KEY` under Project → Settings → Environment Variables, then redeploy.

## Scripts

| Script                       | Purpose                             |
| ---------------------------- | ----------------------------------- |
| `npm run db:migrate`         | Apply Prisma migrations             |
| `npm run db:push`            | Push schema without migration files |
| `npm run db:import-manifest` | Import JSON manifests into Postgres |
| `npm run db:seed`            | Alias for import-manifest           |
| `npm run test:e2e`           | Smoke test (auth, CRUD, pagination) |

## API

| Method | Path                        | Auth     | Description                                          |
| ------ | --------------------------- | -------- | ---------------------------------------------------- |
| POST   | `/api/auth/register`        | —        | Create account                                       |
| \*     | `/api/auth/*`               | —        | NextAuth (sign-in)                                   |
| GET    | `/api/cards`                | optional | Paginated list (`page`, `pageSize`, filters, `sort`) |
| POST   | `/api/cards`                | required | Create card                                          |
| POST   | `/api/cards/suggest`        | required | AI-suggest fields from `head` (needs `GEMINI_API_KEY`) |
| GET    | `/api/cards/[id]`           | —        | Single card                                          |
| PATCH  | `/api/cards/[id]`           | owner    | Update card                                          |
| DELETE | `/api/cards/[id]`           | owner    | Delete card                                          |
| PATCH  | `/api/cards/[id]/progress`  | required | Toggle studied                                       |
| GET    | `/api/cards/filter-options` | —        | Filter dropdown values                               |
| GET    | `/api/lessons`              | —        | Lesson page entries                                  |

List response shape: `{ page, pageSize, totalItems, totalPages, items }`.

## Architecture

- **Routes** (`app/api/`) — thin controllers
- **Services** (`services/`) — Prisma + business logic
- See `docs/backend-changes.md` and `.cursor/rules/daf-web-*.mdc`

## Deployment (Vercel + Neon)

**Step-by-step:** [`docs/deploy-vercel-neon.md`](../docs/deploy-vercel-neon.md)

Minimum:

1. **Neon** — Postgres (`DATABASE_URL` pooled + `DIRECT_URL` direct)
2. **Vercel** — import repo, **Root Directory = `web`**, set env vars
3. Deploy (runs `prisma migrate deploy` via `vercel-build`)
4. **Seed community cards into Neon:**
   - **From GitHub** (when your PC cannot reach Neon): push `vocab.manifest.json` to `master` → [Seed production database](../.github/workflows/seed-production-db.yml) runs automatically; or **Actions → Seed production database → Run workflow**. Requires repo secrets `DATABASE_URL`, `DIRECT_URL`, `DEFAULT_IMPORT_USER_EMAIL`.
   - **From your PC:** `npm run db:import-manifest` with production `DATABASE_URL`

GitHub Pages only hosts the static `vocab.manifest.json` preview — not this app.
