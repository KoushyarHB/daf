# Get it working (step by step)

Think of the app like a **toy kitchen**:

| Thing                     | What it is                                                    |
| ------------------------- | ------------------------------------------------------------- |
| **Postgres (Docker)**     | The cupboard where cards are stored                           |
| **`web/` app**            | The kitchen that cooks pages and APIs                         |
| **`vocab.manifest.json`** | A recipe book _outside_ the kitchen — we copy recipes in once |
| **Your browser**          | You, hungry for vocabulary                                    |

You do **not** need to understand Prisma yet. Just follow the steps. When it works, read `teach-me-database.md`.

---

## Before you start

Install these once:

1. **Docker Desktop** — runs the database in a box on your PC  
   https://www.docker.com/products/docker-desktop/

2. **Node.js 20+** — runs the web app  
   https://nodejs.org/

Open **PowerShell** (or the terminal in Cursor).

---

## Step 1 — Open the project

```powershell
cd C:\Users\Koushyar\source\repos\daf
```

(Use your real path if different.)

---

## Step 2 — Start the database cupboard

```powershell
docker compose up -d
```

**What this does:** Starts Postgres on `localhost:5432`. User `daf`, password `daf`, database `daf`.

**Check it worked:**

```powershell
docker compose ps
```

You should see `postgres` **running**.

**If Docker errors:** Open Docker Desktop, wait until it says it’s running, try again.

---

## Step 3 — Go into the web app folder

```powershell
cd web
```

All commands below are from **`web/`**.

---

## Step 4 — Create your secret settings file

```powershell
copy .env.example .env
```

Open `web/.env` in an editor. Change **one line**:

```
AUTH_SECRET="paste-something-random-here"
```

**Easy way to make a random secret (PowerShell):**

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copy the output into `AUTH_SECRET="..."` in `.env`.

Leave the other lines as they are for local dev:

- `DATABASE_URL` → talks to Docker Postgres
- `AUTH_URL` → `http://localhost:3000`

---

## Step 5 — Install app dependencies

**First:** close any running `npm run dev` terminal (Ctrl+C). On Windows, a running dev server locks a Prisma file and `npm install` can fail.

```powershell
npm install
```

**What this does:** Downloads packages + runs `prisma generate` (builds the database helper code).

Takes a minute. Wait until it finishes.

### If Step 5 fails with `EPERM` / `query_engine-windows.dll.node`

Something (usually an old `node` / dev server) is holding Prisma’s engine file. Fix:

```powershell
# Still in web/
taskkill /IM node.exe /F
Start-Sleep -Seconds 2
npx prisma generate
npm install
```

If `taskkill` says “not found”, that’s fine — run `npx prisma generate` anyway.

Then continue with Step 6.

---

## Step 6 — Build empty tables in the database

```powershell
npm run db:migrate
```

**What this does:** Runs SQL files in `prisma/migrations/` — creates `users`, `cards`, etc.

**If it asks for a migration name:** you’re creating a _new_ change; for first-time setup it should just apply existing migrations.

**If migrate complains:** try:

```powershell
npx prisma migrate deploy
```

---

## Step 7 — Fill the cupboard with vocabulary cards

```powershell
npm run db:import-manifest
```

**What this does:** Reads `vocab.manifest.json` from the **repo root** (one folder up) and puts ~176 cards into Postgres.

You should see something like:

```text
Default import user: default-import-user
Imported 176 cards and 1 lessons.
```

**If it fails with “file not found”:** run from `web/` and make sure `..\vocab.manifest.json` exists.

---

## Step 8 — Start the web app

```powershell
npm run dev
```

Wait until you see:

```text
✓ Ready on http://localhost:3000
```

**Leave this terminal open.** The app is running.

---

## Step 9 — Use it in the browser

Open: **http://localhost:3000**

You should see:

- Vocabulary deck with filters
- Cards loading (may say “Loading…” briefly)

### Try the API directly

Open: **http://localhost:3000/api/cards?page=1&pageSize=5**

You should see JSON like:

```json
{
  "page": 1,
  "pageSize": 5,
  "totalItems": 176,
  "totalPages": 36,
  "items": [ ... ]
}
```

If that works, **the database + backend are alive.**

---

## Step 10 — Sign up (so “studied” works)

1. Click **Register** (top nav) or go to http://localhost:3000/register
2. Email + password (at least 8 characters)
3. You land on the home page, signed in

Now click **Studied** on a card. Refresh the page — it should stay studied.

**Without signing in:** you can still _read_ cards. Studied progress needs an account.

---

## Step 11 — Prove everything works (optional but satisfying)

Open a **second** PowerShell window:

```powershell
cd C:\Users\Koushyar\source\repos\daf\web
npm run test:e2e
```

(Keep `npm run dev` running in the first window.)

You want **all PASS**. That checks: home page, register, list cards, create card, studied toggle, delete card, lessons.

---

## Quick checklist

| Step     | Command                                      | Success sign                      |
| -------- | -------------------------------------------- | --------------------------------- |
| Database | `docker compose up -d` (from repo root)      | `docker compose ps` shows running |
| Env      | `copy .env.example .env` + set `AUTH_SECRET` | File `web/.env` exists            |
| Install  | `npm install` (in `web/`)                    | No errors                         |
| Tables   | `npm run db:migrate`                         | Migrations applied                |
| Data     | `npm run db:import-manifest`                 | “Imported 176 cards…”             |
| App      | `npm run dev`                                | Ready on :3000                    |
| Browser  | http://localhost:3000                        | Deck with cards                   |
| Auth     | Register + toggle studied                    | Sticks after refresh              |

---

## When something breaks

### “Can’t reach database” / Prisma connection error

- Is Docker running? `docker compose ps`
- Restart DB: `docker compose restart` (from repo root)

### `prisma generate` / EPERM on Windows

- Stop `npm run dev` (Ctrl+C)
- Run `npx prisma generate`
- Start `npm run dev` again

### `/api/auth` or sign-in returns 500

- Check `AUTH_SECRET` is set in `web/.env`
- Restart `npm run dev` after editing `.env`

### Page loads but 0 cards

- Run `npm run db:import-manifest` again from `web/`

### Port 3000 already in use

- Close other dev servers, or run `npx next dev -p 3001` and open http://localhost:3001

### `npm run db:migrate` wants to reset data

- For local learning, OK to reset. For real data you care about, stop and ask before accepting a reset.

---

## Daily routine (after first setup)

**Start work:**

```powershell
cd C:\Users\Koushyar\source\repos\daf
docker compose up -d
cd web
npm run dev
```

**Stop work:**

- Ctrl+C in the terminal running `npm run dev`
- Optional: `docker compose stop` (from repo root) to free RAM

**After editing `vocab.manifest.json` (repo root):**

```powershell
cd web
npm run db:import-manifest
```

Then refresh the browser.

---

## What to read next (when you’re curious)

1. **`docs/get-it-running.md`** ← you are here (make it work)
2. **`docs/teach-me-database.md`** — what each file does, read/write paths
3. **`docs/backend-changes.md`** — big-picture architecture

---

## One-sentence summary

**Docker holds the data → `.env` tells the app where to look → migrate builds tables → import fills cards → `npm run dev` serves the site → register to save studied.**

That’s the whole monster. 🎉
