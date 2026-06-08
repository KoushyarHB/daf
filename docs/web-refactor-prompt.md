# Execution prompt: refactor `web/` into an isolated full-stack Next app

Use this document as the **master task brief** when implementing the backend/frontend overhaul. Rules in `.cursor/rules/daf-web-*.mdc` are authoritative constraints.

---

## Context

The current `web/` app is a **partial migration**: it reads Postgres for lists and only **PATCH**es studied progress. Runtime still optionally reads JSON manifests. That is **not** the target architecture.

**Target:** `web/` is a **standalone full-stack Next.js app** with users, auth, full card CRUD, paginated/filterable APIs, and per-user progress. The repo root (`vocab.manifest.json`, `daf_vocab`, Python preview) is **authoring only**. The **only** bridge is `import-manifest` → `cards` table with a **default owner user**.

---

## Phase 0 — Answer the architecture question (user ↔ card)

Implement **two distinct relationships**:

1. **Ownership (content):** `cards.userId` → `users.id`
   - Every card has an owner.
   - Manifest import sets `userId` to a seeded **system/default user** (`DEFAULT_IMPORT_USER_ID` in `.env`).
   - Authenticated CRUD creates/updates cards with `userId = session.user.id`.

2. **Progress (learning):** `user_card_progress(userId, cardId, studied, studiedAt)`
   - Replaces anonymous `sessionId` in `user_card_progress`.
   - Drop `daf_session` cookie progress path once auth works.
   - Unique `(userId, cardId)`.

Do **not** put `studied` on `cards`.

**Auth choice (simplest):** Auth.js (NextAuth v5) with **Credentials provider** (email + password), Prisma adapter, bcrypt password hashes. Alternative: Lucia — only if Credentials proves painful.

---

## Phase 1 — Schema & auth

1. Add `User` model to `web/prisma/schema.prisma` (id, email unique, passwordHash, name optional, createdAt).
2. Add `userId` to `Card` (required FK → User).
3. Change `UserCardProgress.sessionId` → `userId` (FK → User); migrate data or truncate in dev.
4. Seed script: create default import user; document id in `.env.example`.
5. Implement sign-up (`POST /api/auth/register` or NextAuth sign-up flow) and sign-in.
6. Update `middleware.ts` to protect `/api/cards` mutations and progress routes; use session from Auth.js.

**Delete / retire:** `web/lib/session.ts` anonymous cookie flow (after auth works).

---

## Phase 2 — Service layer

1. Create `web/services/`:
   - `cards.service.ts` — list (paginated, filter, sort), getById, create, update, delete, setStudied
   - `lessons.service.ts` — lesson hub reads
   - `users.service.ts` — register, findByEmail (if not fully in auth lib)
2. Move all Prisma logic from `web/lib/db/cards.ts` and `lessons.ts` into services.
3. Keep only `web/lib/db/prisma.ts`.
4. Route handlers become thin controllers (validate → auth → service → JSON).

---

## Phase 3 — API overhaul

### `GET /api/cards`

Query params (Zod): `page`, `pageSize`, `lektion`, `level`, `pos`, `studied`, `sort`.

Response:

```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 176,
  "totalPages": 9,
  "items": [ /* card DTOs */ ]
}
```

### `GET /api/cards/[id]`

Single card DTO + `studied` boolean for current user (if authenticated).

### `POST /api/cards`

Body: card fields + nested glosses/notes/examples. Auth required. `userId` from session.

### `PATCH /api/cards/[id]` and `DELETE /api/cards/[id]`

Owner-only (403 if not owner).

### `PATCH /api/cards/[id]/progress`

Body: `{ "studied": true | false }`. Auth required. Upsert `user_card_progress`.

### Remove

- `USE_JSON_MANIFEST` branches in API routes and pages.
- `web/lib/vocab/data-source.ts` (pages call services or fetch API).
- Runtime use of `load-manifest.ts` (keep file only if needed for import script helpers — prefer import script to own parsing).

---

## Phase 4 — Import script

Update `web/scripts/import-manifest.ts`:

1. Resolve default user id from env / DB seed.
2. Upsert cards with `userId = defaultUserId`.
3. Do not touch `user_card_progress` on import.
4. Document in `web/README.md`: `npm run db:import-manifest` after manifest edits.

---

## Phase 5 — Frontend

1. Auth UI: minimal sign-up / sign-in pages under `web/app/(auth)/`.
2. `VocabularyDeck`: fetch paginated `/api/cards?...` with query params matching `DeckControls` filters.
3. Studied toggle: `PATCH /api/cards/[id]/progress` with session cookie from Auth.js.
4. Remove `progressEnabled` / `initialStudiedIds` props that exist only for SSR+anonymous session hack once client fetches paginated API.

---

## Phase 6 — Docs & tests

1. Rewrite `docs/backend-changes.md` → reflect new architecture (read path + **write path** + auth).
2. Update `web/scripts/e2e-smoke.ts`: register/login, CRUD smoke, pagination shape, studied toggle.
3. Add `web/lib/api/types.ts` with `PaginatedResponse<T>`.

---

## Definition of done

- [ ] No runtime manifest reads outside `web/scripts/`.
- [ ] `web/services/` holds all Prisma access; routes are thin.
- [ ] Users can register, login, CRUD own cards, toggle studied.
- [ ] `GET /api/cards` returns paginated envelope with filter/sort query params.
- [ ] Import assigns cards to default user.
- [ ] Anonymous session cookie progress removed.
- [ ] `docs/backend-changes.md` updated with explicit read/write/auth diagrams.

---

## Suggested implementation order for one agent session

```
schema + seed → auth → services (cards list paginated) → GET /api/cards
→ POST/PATCH/DELETE cards → progress PATCH → remove JSON mode
→ import script userId → frontend auth + deck pagination → e2e
```

When starting, read: `web/prisma/schema.prisma`, `.cursor/rules/daf-web-*.mdc`, this file.
