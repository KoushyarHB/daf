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

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:push` | Push schema without migration files |
| `npm run db:import-manifest` | Import JSON manifests into Postgres |
| `npm run db:seed` | Alias for import-manifest |
| `npm run test:e2e` | Smoke test (auth, CRUD, pagination) |

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| * | `/api/auth/*` | — | NextAuth (sign-in) |
| GET | `/api/cards` | optional | Paginated list (`page`, `pageSize`, filters, `sort`) |
| POST | `/api/cards` | required | Create card |
| GET | `/api/cards/[id]` | — | Single card |
| PATCH | `/api/cards/[id]` | owner | Update card |
| DELETE | `/api/cards/[id]` | owner | Delete card |
| PATCH | `/api/cards/[id]/progress` | required | Toggle studied |
| GET | `/api/cards/filter-options` | — | Filter dropdown values |
| GET | `/api/lessons` | — | Lesson page entries |

List response shape: `{ page, pageSize, totalItems, totalPages, items }`.

## Architecture

- **Routes** (`app/api/`) — thin controllers
- **Services** (`services/`) — Prisma + business logic
- See `docs/backend-changes.md` and `.cursor/rules/daf-web-*.mdc`

## Deployment

Requires Node.js + PostgreSQL (Vercel, Railway, Fly.io, etc.). GitHub Pages cannot host this app.
