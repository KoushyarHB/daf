# Deploy to Vercel + Neon

Host the **Next.js app** on [Vercel](https://vercel.com) and **PostgreSQL** on [Neon](https://neon.tech). GitHub Pages stays the static manifest preview only.

**Time (first time):** about 1–2 hours.

---

## What you need

- GitHub repo with this code pushed (`web/` folder)
- Free (or paid) accounts on **Vercel** and **Neon**
- **Do not** commit `web/.env` (secrets stay on Vercel / your PC)

---

## 1. Neon — create the database

1. Sign up at [neon.tech](https://neon.tech) and create a project (e.g. `daf`).
2. Open **Dashboard → Connection details**.
3. Copy two URLs:
   - **Pooled connection** → `DATABASE_URL` (hostname often contains `-pooler`)
   - **Direct connection** → `DIRECT_URL` (for Prisma migrations)

Add `?sslmode=require` if not already in the string.

Example (yours will differ):

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

---

## 2. Vercel — import the project

1. Sign up at [vercel.com](https://vercel.com) and **Add New → Project**.
2. Import your **GitHub** repository.
3. **Root Directory:** set to `web` (important).
4. Framework: **Next.js** (auto-detected).
5. **Do not deploy yet** — add environment variables first.

---

## 3. Vercel — environment variables

In **Project → Settings → Environment Variables**, add for **Production** (and Preview if you want):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon **pooled** URL |
| `DIRECT_URL` | Neon **direct** URL |
| `AUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `AUTH_URL` | `https://YOUR-PROJECT.vercel.app` (no trailing slash) |
| `DEFAULT_IMPORT_USER_EMAIL` | e.g. `system@import.local` |

After the first deploy you get the real URL — update `AUTH_URL` to match, then **Redeploy**.

---

## 4. Deploy

Click **Deploy** (or push to the branch Vercel watches).

The build runs:

```bash
prisma migrate deploy && prisma generate && next build
```

(`vercel-build` in `web/package.json`.)

If the build fails on `migrate deploy`, check `DIRECT_URL` and that Neon allows connections from Vercel (default: yes).

---

## 5. Seed community cards (once)

Manifest JSON lives at the **repo root**, not inside `web/`. Run import **from your PC** against production:

```powershell
cd C:\Users\Koushyar\source\repos\daf\web

$env:DATABASE_URL="postgresql://..."   # Neon DIRECT or pooled URL works for import
$env:DIRECT_URL="postgresql://..."     # same or direct
$env:DEFAULT_IMPORT_USER_EMAIL="system@import.local"

npm run db:import-manifest
```

You should see `Imported 176 cards and 1 lessons.`

Alternatively set `MANIFEST_ROOT` to the repo root if you run from another cwd:

```powershell
$env:MANIFEST_ROOT="C:\Users\Koushyar\source\repos\daf"
```

---

## 6. Verify

1. Open `https://YOUR-PROJECT.vercel.app`
2. Deck shows community cards
3. **Register** → sign in → toggle **Studied**, **Add card**

Optional smoke test against production:

```powershell
npm run test:e2e -- https://YOUR-PROJECT.vercel.app
```

---

## Local `.env` after Neon setup

For local dev you can keep Docker Postgres. Add `DIRECT_URL` (same as `DATABASE_URL` locally):

```env
DATABASE_URL="postgresql://daf:daf@localhost:5432/daf?schema=public"
DIRECT_URL="postgresql://daf:daf@localhost:5432/daf?schema=public"
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
```

---

## Updates (day to day)

| Change | Action |
|--------|--------|
| Push code to GitHub | Vercel auto-redeploys; migrations run on build |
| Edit `vocab.manifest.json` | **GitHub Actions** (if local Neon fails): push to `master` → workflow **Seed production database** runs automatically, or run it manually under Actions. Locally: `npm run db:import-manifest` with production `DATABASE_URL`. |
| New Prisma migration | Commit migration files; next Vercel build applies them |
| Change domain | Update `AUTH_URL` on Vercel + redeploy |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails: `DIRECT_URL` / migrate | Set both Neon URLs on Vercel |
| Sign-in 500 / cookies | `AUTH_URL` must exactly match live `https://…` URL |
| Empty deck | Run `db:import-manifest` with production DB URL |
| Too many DB connections | Use Neon **pooled** URL for `DATABASE_URL` only |
| `prisma generate` EPERM locally | Stop `npm run dev`, then regenerate |

---

## One-line summary

**Neon** = database · **Vercel** = app · **env vars** on Vercel · **import manifest once** from your machine · **GitHub Pages** unchanged for static preview.
