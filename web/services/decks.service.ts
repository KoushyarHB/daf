import type { Prisma } from "@prisma/client";

import type { z } from "zod";
import type { deckListQuerySchema, deckWriteSchema } from "@/lib/api/schemas";
import { buildPaginatedResponse } from "@/lib/api/types";
import type { PaginatedResponse } from "@/lib/api/types";
import { slugifyLabel } from "@/lib/tags/slug";
import { prisma } from "@/lib/db/prisma";
import { normalizeCefrLevel } from "@/lib/vocab/levels";

export type DeckDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  isSystem: boolean;
  cardCount: number;
  publishedAt: string | null;
  publishedTagSlug: string | null;
  publishedTagLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

type DeckWriteInput = z.infer<typeof deckWriteSchema>;
type DeckListQuery = z.infer<typeof deckListQuerySchema>;

const DEFAULT_DECK_NAME = "My deck";
const DEFAULT_DECK_SLUG = "my-deck";

function rowToDto(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  isSystem: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { cards: number };
  publishedTag?: { slug: string; label: string } | null;
}): DeckDto {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    level: row.level,
    isSystem: row.isSystem,
    cardCount: row._count?.cards ?? 0,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    publishedTagSlug: row.publishedTag?.slug ?? null,
    publishedTagLabel: row.publishedTag?.label ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const deckInclude = {
  _count: { select: { cards: true } },
  publishedTag: { select: { slug: true, label: true } },
} as const;

async function uniqueSlugForUser(
  userId: string,
  baseSlug: string,
  excludeDeckId?: string,
): Promise<string> {
  let slug = baseSlug || "deck";
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await prisma.deck.findFirst({
      where: {
        userId,
        slug: candidate,
        ...(excludeDeckId ? { id: { not: excludeDeckId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    n += 1;
  }
}

/** Ensures every user has at least one deck; returns the default deck id. */
export async function ensureDefaultDeck(userId: string): Promise<string> {
  const existing = await prisma.deck.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (existing) return existing.id;

  const deck = await prisma.deck.create({
    data: {
      userId,
      name: DEFAULT_DECK_NAME,
      slug: await uniqueSlugForUser(userId, DEFAULT_DECK_SLUG),
      level: "A1",
    },
  });
  return deck.id;
}

export async function listDecksForUser(
  userId: string,
  query: DeckListQuery,
): Promise<PaginatedResponse<DeckDto>> {
  const where: Prisma.DeckWhereInput = { userId };
  const q = query.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const skip = (query.page - 1) * query.pageSize;
  const [totalItems, rows] = await Promise.all([
    prisma.deck.count({ where }),
    prisma.deck.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip,
      take: query.pageSize,
      include: deckInclude,
    }),
  ]);

  return buildPaginatedResponse(
    rows.map((row) => rowToDto(row)),
    query.page,
    query.pageSize,
    totalItems,
  );
}

export async function getDeckForUser(
  deckId: string,
  userId: string,
): Promise<DeckDto | null> {
  const row = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    include: deckInclude,
  });
  if (!row) return null;
  return rowToDto(row);
}

export async function createDeck(
  userId: string,
  input: DeckWriteInput,
  options?: { isSystem?: boolean },
): Promise<DeckDto> {
  const name = input.name.trim();
  const baseSlug = input.slug?.trim() || slugifyLabel(name) || "deck";
  const slug = await uniqueSlugForUser(userId, baseSlug);

  const row = await prisma.deck.create({
    data: {
      userId,
      name,
      slug,
      description: input.description?.trim() || null,
      level: normalizeCefrLevel(input.level ?? "A1"),
      isSystem: options?.isSystem ?? false,
    },
    include: deckInclude,
  });
  return rowToDto(row);
}

export async function updateDeck(
  deckId: string,
  userId: string,
  input: Partial<DeckWriteInput>,
): Promise<DeckDto | "NOT_FOUND"> {
  const existing = await prisma.deck.findFirst({
    where: { id: deckId, userId },
  });
  if (!existing) return "NOT_FOUND";

  let slug = existing.slug;
  if (input.slug !== undefined || input.name !== undefined) {
    const base =
      input.slug?.trim() ||
      (input.name ? slugifyLabel(input.name) : slugifyLabel(existing.name));
    slug = await uniqueSlugForUser(userId, base || existing.slug, deckId);
  }

  const row = await prisma.deck.update({
    where: { id: deckId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.slug !== undefined || input.name !== undefined ? { slug } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.level !== undefined
        ? { level: normalizeCefrLevel(input.level) }
        : {}),
    },
    include: deckInclude,
  });
  return rowToDto(row);
}

export async function deleteDeck(
  deckId: string,
  userId: string,
): Promise<"OK" | "NOT_FOUND" | "NOT_EMPTY"> {
  const existing = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    include: { _count: { select: { cards: true } } },
  });
  if (!existing) return "NOT_FOUND";
  if (existing._count.cards > 0) return "NOT_EMPTY";

  const deckCount = await prisma.deck.count({ where: { userId } });
  if (deckCount <= 1) return "NOT_EMPTY";

  await prisma.deck.delete({ where: { id: deckId } });
  return "OK";
}

export async function userOwnsDeck(
  deckId: string,
  userId: string,
): Promise<boolean> {
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    select: { id: true },
  });
  return deck !== null;
}
