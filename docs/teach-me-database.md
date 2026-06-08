# Teach me: database design, Prisma, and how data moves in `web/`

You expected to **design the database yourself**. You did — but Prisma splits that job across a few files, and some of them are **generated**. This doc separates **what you own** from **what Prisma builds for you**, then walks through every important file and a full read/write example.

---

## 1. The mental model (read this first)

```
YOU design          Prisma generates        PostgreSQL stores
──────────          ────────────────        ─────────────────
schema.prisma  →    @prisma/client     →    real tables & rows
     ↓              (TypeScript API)
migration.sql
(actual CREATE TABLE)
```

| Piece | Who writes it? | What it is |
|-------|----------------|------------|
| **`prisma/schema.prisma`** | **You** (humans) | Your **design document**: tables, columns, types, relations. This is the source of truth for shape. |
| **`prisma/migrations/*/migration.sql`** | **You** (or Prisma CLI on your behalf) | **Real SQL** that creates/alters tables in Postgres. This is what actually runs against the database. |
| **`node_modules/@prisma/client`** | **Prisma** (`prisma generate`) | **Generated TypeScript library** — `prisma.card.findMany()`, types like `User`, `Card`. Never edit by hand. |
| **`node_modules/.prisma/client/`** | **Prisma** | Query engine binary + generated types. Also never edit. |
| **`lib/db/prisma.ts`** | **You** | One shared `PrismaClient` instance for the app. |
| **`services/*.service.ts`** | **You** | Business logic: build queries, map rows → API shapes. |
| **`app/api/**/route.ts`** | **You** | HTTP layer: parse request, call service, return JSON. |

**Important:** Prisma did **not** invent your `User`, `Card`, or `user_card_progress` tables. Those models were **designed in `schema.prisma`** to match product rules (owners, per-user studied state, normalized glosses/examples). Prisma only **compiled** that design into (a) SQL migrations and (b) a TypeScript client.

If you open `node_modules/@prisma/client` and see hundreds of types — that can feel like “Prisma built the schema.” It didn’t. It **reflected** `schema.prisma`.

---

## 2. Your design: `prisma/schema.prisma`

This file is **the database blueprint in Prisma’s language**. Each `model` becomes a SQL table (name from `@@map("…")`).

### Top section

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
```

- **generator** — “after I change the schema, run `prisma generate` and give me a TS client.”
- **datasource** — “talk to Postgres using `DATABASE_URL` from `.env`.”

### Enums

`VocabPos`, `LessonPageKind` → Postgres `ENUM` types (see migration SQL).

### Models (your tables)

| Model | SQL table | Purpose |
|-------|-----------|---------|
| `User` | `users` | Accounts (email, password hash). |
| `Card` | `cards` | One vocabulary card; **`userId`** = who owns it. |
| `CardGloss` | `card_glosses` | One row per gloss line (`sort_order`). |
| `CardNote` | `card_notes` | One row per note line. |
| `CardExample` | `card_examples` | One row per `›` example. |
| `Lesson` | `lessons` | Lesson hub metadata. |
| `LessonPage` | `lesson_pages` | Word/grammar page image per lesson. |
| `UserCardProgress` | `user_card_progress` | **`userId` + `cardId`** → studied flag (not on `cards`). |

### Relation lines (foreign keys)

Example from `Card`:

```prisma
user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
```

Means: `cards.user_id` → `users.id`; deleting a user deletes their cards.

The `CardGloss[]` side is the reverse: one card has many gloss rows.

### Field attributes you’ll see

| Attribute | Meaning |
|-----------|---------|
| `@id` | Primary key |
| `@default(cuid())` | Auto-generate id string |
| `@map("password_hash")` | TS name `passwordHash` ↔ SQL column `password_hash` |
| `@unique` | Unique constraint |
| `@@index([lektion])` | Index for faster filters |
| `@@map("cards")` | Model `Card` ↔ table `cards` |

**To change the design:** edit `schema.prisma`, then create/apply a migration (section 7).

---

## 3. Migrations: SQL that Postgres actually runs

**Folder:** `web/prisma/migrations/`

Each subfolder is one versioned step:

| Migration | What it did |
|-----------|-------------|
| `20250607000000_init` | Created `cards`, glosses, notes, examples, lessons, first `user_card_progress` (session-based). |
| `20250608120000_add_users` | Added `users`, `cards.user_id`, replaced session progress with `user_id` progress. |

**File:** `migration.sql` inside each folder — plain PostgreSQL:

```sql
CREATE TABLE "cards" ( ... );
ALTER TABLE "cards" ADD COLUMN "user_id" TEXT;
```

You **can** write this SQL yourself (as in this repo) or let Prisma draft it:

```bash
npx prisma migrate dev --name add_something
```

That compares `schema.prisma` to the DB, writes a new `migration.sql`, and applies it.

**`npm run db:push`** skips migration history and pushes schema directly — fine for solo dev, not ideal for production.

---

## 4. Generated code (do not edit)

After `prisma generate` (runs on `npm install` / `postinstall`):

```
web/node_modules/@prisma/client/
web/node_modules/.prisma/client/
```

You get:

```typescript
prisma.user.findUnique({ where: { email: "…" } })
prisma.card.create({ data: { … } })
```

Types like `Prisma.CardWhereInput` for complex filters.

If `schema.prisma` changes but generate didn’t run, you’ll see errors like `prisma.user is undefined`. Fix: stop dev server → `npx prisma generate` → restart.

---

## 5. App files: who talks to the database?

Only **services** and **scripts** should call `prisma.*` directly (plus auth’s `authorize` callback).

### `lib/db/prisma.ts`

Creates a **singleton** `PrismaClient` so Next.js hot reload doesn’t open hundreds of DB connections.

### `services/cards.service.ts` (example)

- **Reads:** `prisma.card.findMany`, `findUnique`, `count` with `include: { glosses, notes, examples }`.
- **Writes:** `create`, `update`, `delete`, `upsert` on `card` and child tables.
- **Maps** DB rows → `EnrichedVocabCard` (what the UI/API use).

### `services/users.service.ts`

- `registerUser` → `prisma.user.create`
- `ensureDefaultImportUser` → find or create import owner

### `services/lessons.service.ts`

- `prisma.lesson.findMany({ include: { pages: true } })`

### `app/api/**/route.ts`

**Does not import Prisma.** Pattern:

1. Parse query/body (Zod in `lib/api/schemas.ts`)
2. Auth (`lib/auth/require-auth.ts`)
3. Call service
4. `NextResponse.json(…)`

### `scripts/import-manifest.ts`

**Only bridge from repo JSON → DB.** Uses `prisma` directly to `upsert` cards with `userId = default-import-user`. Not used at HTTP request time.

---

## 6. Read path (example: list cards)

```
Browser  GET /api/cards?page=1&pageSize=25
    ↓
app/api/cards/route.ts
    → cardListQuerySchema.parse(query)
    → getAuthUserId() (optional, for studied flags)
    → cardsService.listCards(query, userId)
        ↓
    prisma.card.count({ where })
    prisma.card.findMany({ where, orderBy, skip, take, include: glosses… })
        ↓
    PostgreSQL executes SELECT … JOIN …
        ↓
    dbCardToVocabCard() → enrichCards()
        ↓
    { page, pageSize, totalItems, totalPages, items }
```

**Studied flag on read:** separate query to `user_card_progress` for the logged-in user’s `cardId`s, merged into each item.

---

## 7. Write paths

### A. Runtime API (user actions)

| Action | Route | Service | Prisma calls |
|--------|-------|---------|--------------|
| Register | `POST /api/auth/register` | `users.service` | `user.create` |
| Sign in | NextAuth | `auth.ts` | `user.findUnique` + bcrypt |
| Create card | `POST /api/cards` | `cards.service` | `card.create` + `cardGloss.createMany` … |
| Update card | `PATCH /api/cards/[id]` | `cards.service` | `card.update` + replace children |
| Delete card | `DELETE /api/cards/[id]` | `cards.service` | `card.delete` (cascades children) |
| Toggle studied | `PATCH …/progress` | `cards.service` | `userCardProgress.upsert` |

**Ownership:** `createCard` sets `userId` from session. `updateCard` / `deleteCard` check `existing.userId === userId` or return 403.

### B. Offline import (manifest → DB)

```
vocab.manifest.json
    ↓
scripts/import-manifest.ts
    → ensureDefaultImportUser()
    → for each card: prisma.card.upsert({ userId: default, … })
    → deleteMany + createMany on glosses/notes/examples
```

Does **not** touch `user_card_progress`.

---

## 8. How JSON card shape maps to tables

One manifest card:

```json
{
  "head": "das Gespräch /ɡəˈʃpʁɛːç/",
  "gloss": ["conversation"],
  "examples": [{ "german": "…", "english": "…" }]
}
```

Becomes:

| Table | Rows |
|-------|------|
| `cards` | 1 row (`head`, `ipa`, `pos`, `lektion`, `sort_order`, `user_id`, …) |
| `card_glosses` | 1 row per gloss string |
| `card_examples` | 1 row per example |

`studied` is **never** on `cards` — only in `user_card_progress` per user.

---

## 9. How to design or change the schema yourself

1. **Edit** `web/prisma/schema.prisma` (add field, model, relation).
2. **Create migration:**
   ```bash
   cd web
   npx prisma migrate dev --name describe_your_change
   ```
   Prisma writes `prisma/migrations/<timestamp>_describe_your_change/migration.sql` and applies it.
3. **Regenerate client** (migrate dev usually does this):
   ```bash
   npx prisma generate
   ```
4. **Update services** — new fields need mapping in `cards.service.ts` (or relevant service).
5. **Update API schemas** — `lib/api/schemas.ts` if the field is exposed over HTTP.
6. **Re-import or migrate data** if needed.

### Design-first without Prisma DSL?

You can:

1. Write raw SQL migrations by hand (like `20250608120000_add_users`).
2. Keep `schema.prisma` in sync manually so the client matches.

Or use **SQL-first** tools (Flyway, plain SQL folders) and treat Prisma only as a query builder — but then you lose `migrate dev` auto-drafting. This project uses **schema-first Prisma**: design in `.prisma`, SQL migrations as the audit trail.

---

## 10. File checklist (quick reference)

| File | You edit? | Role |
|------|-----------|------|
| `prisma/schema.prisma` | **Yes** | Your table/relation design |
| `prisma/migrations/**/migration.sql` | **Yes** (or via CLI) | DDL applied to Postgres |
| `lib/db/prisma.ts` | Rarely | DB connection singleton |
| `services/*.service.ts` | **Yes** | Queries + business rules |
| `lib/api/schemas.ts` | **Yes** | HTTP input validation (Zod) |
| `app/api/**/route.ts` | **Yes** | HTTP controllers |
| `scripts/import-manifest.ts` | **Yes** | JSON → DB bulk upsert |
| `node_modules/@prisma/client` | **Never** | Generated query API |
| `.env` | **Yes** | `DATABASE_URL`, `AUTH_SECRET` |

---

## 11. Common confusion

**“Prisma built schemas we didn’t design”**  
→ The **design** is `schema.prisma`. Prisma **generated the TypeScript client** from it. Open `schema.prisma` — that’s your ERD in code form.

**“Where is the real database?”**  
→ Postgres (Docker `docker-compose.yml`). Prisma is a **translator**, not the database.

**“Who owns card content vs studied state?”**  
→ `cards.user_id` = content owner. `user_card_progress` = learner’s studied flag. Two different relations to `users`.

**“Why `DbCard` type in the service if Prisma has types?”**  
→ Practical choice so the service documents the exact `include` shape and avoids IDE issues before `prisma generate` runs. Optional once client is always up to date.

---

## 12. Try it yourself

```bash
cd web
docker compose -f ../docker-compose.yml up -d   # from repo root
npx prisma studio                                  # GUI to browse/edit rows
```

`prisma studio` reads the same `schema.prisma` and shows tables — useful to verify that your **design** matches what you expect in Postgres.

---

*Related: `docs/backend-changes.md` (architecture), `web/README.md` (commands), `.cursor/rules/daf-web-architecture.mdc` (layering rules).*
