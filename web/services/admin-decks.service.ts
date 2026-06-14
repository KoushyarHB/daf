import type { Prisma } from "@prisma/client";

import type { z } from "zod";
import type { adminDeckListQuerySchema, cardUpdateSchema } from "@/lib/api/schemas";
import { buildPaginatedResponse } from "@/lib/api/types";
import type { PaginatedResponse } from "@/lib/api/types";
import { slugifyLabel } from "@/lib/tags/slug";
import { prisma } from "@/lib/db/prisma";
import type { TagDto } from "@/services/tags.service";
import { ensureTag } from "@/services/tags.service";
import { getCardById, updateOwnedCardForUser } from "@/services/cards.service";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import { updateDeck, type DeckDto } from "@/services/decks.service";

type AdminDeckListQuery = z.infer<typeof adminDeckListQuerySchema>;
type CardUpdateInput = z.infer<typeof cardUpdateSchema>;

export type AdminDeckDto = DeckDto & {
  ownerEmail: string;
  ownerName: string | null;
};

const deckInclude = {
  _count: { select: { cards: true } },
  publishedTag: { select: { slug: true, label: true } },
  user: { select: { email: true, name: true } },
} as const;

function rowToAdminDto(row: {
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
  user: { email: string; name: string | null };
}): AdminDeckDto {
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
    ownerEmail: row.user.email,
    ownerName: row.user.name,
  };
}

function publishTagSlug(deck: { slug: string; userId: string }): string {
  const userPart = deck.userId.replace(/[^a-z0-9]/gi, "").slice(-8).toLowerCase();
  const deckPart = slugifyLabel(deck.slug) || "deck";
  return `deck-${userPart}-${deckPart}`;
}

export async function listDecksAdmin(
  query: AdminDeckListQuery,
): Promise<PaginatedResponse<AdminDeckDto>> {
  const where: Prisma.DeckWhereInput = {};
  const q = query.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (query.userId) {
    where.userId = query.userId;
  }

  const skip = (query.page - 1) * query.pageSize;
  const [totalItems, rows] = await Promise.all([
    prisma.deck.count({ where }),
    prisma.deck.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip,
      take: query.pageSize,
      include: deckInclude,
    }),
  ]);

  return buildPaginatedResponse(
    rows.map((row) => rowToAdminDto(row)),
    query.page,
    query.pageSize,
    totalItems,
  );
}

export async function getDeckAdmin(deckId: string): Promise<AdminDeckDto | null> {
  const row = await prisma.deck.findUnique({
    where: { id: deckId },
    include: deckInclude,
  });
  if (!row) return null;
  return rowToAdminDto(row);
}

export async function publishDeckToCommunity(
  deckId: string,
  adminUserId: string,
  options?: { tagSlug?: string; tagLabel?: string },
): Promise<
  | { tag: TagDto; cardCount: number; republished: boolean }
  | "NOT_FOUND"
  | "EMPTY"
> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      user: { select: { email: true } },
      publishedTag: { select: { id: true, slug: true, label: true } },
    },
  });
  if (!deck) return "NOT_FOUND";

  const cards = await prisma.card.findMany({
    where: {
      deckId,
      userId: deck.userId,
      sourceCardId: null,
    },
    select: { id: true },
  });
  if (cards.length === 0) return "EMPTY";

  const tagSlug =
    options?.tagSlug?.trim() ||
    deck.publishedTag?.slug ||
    publishTagSlug(deck);
  const tagLabel =
    options?.tagLabel?.trim() || deck.publishedTag?.label || deck.name;

  const tag = await ensureTag(tagSlug, tagLabel, { isSystem: true });
  const republished = deck.publishedAt !== null;

  // Tag the deck's own cards with the published tag (additive — keeps existing tags).
  await prisma.cardTag.createMany({
    data: cards.map((c) => ({ cardId: c.id, tagId: tag.id })),
    skipDuplicates: true,
  });

  // If the deck previously published under a different tag, drop that stale tag.
  if (deck.publishedTag && deck.publishedTag.id !== tag.id) {
    await prisma.cardTag.deleteMany({
      where: { tagId: deck.publishedTag.id, cardId: { in: cards.map((c) => c.id) } },
    });
  }

  await prisma.deck.update({
    where: { id: deckId },
    data: {
      publishedAt: new Date(),
      publishedTagId: tag.id,
    },
  });

  await prisma.deckPublish.create({
    data: {
      sourceDeckId: deckId,
      publishedById: adminUserId,
      tagId: tag.id,
      cardCount: cards.length,
    },
  });

  return { tag, cardCount: cards.length, republished };
}

export async function unpublishDeckFromCommunity(
  deckId: string,
): Promise<
  { removedCardCount: number } | "NOT_FOUND" | "NOT_PUBLISHED"
> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: {
      userId: true,
      publishedAt: true,
      publishedTagId: true,
    },
  });
  if (!deck) return "NOT_FOUND";
  if (!deck.publishedAt || !deck.publishedTagId) return "NOT_PUBLISHED";

  const deckCards = await prisma.card.findMany({
    where: { deckId, userId: deck.userId },
    select: { id: true },
  });
  const cardIds = deckCards.map((c) => c.id);

  // Remove the public tag from the deck's cards so they leave the catalog.
  const removed = await prisma.cardTag.deleteMany({
    where: { tagId: deck.publishedTagId, cardId: { in: cardIds } },
  });

  // Stop offering it for new imports (existing importers' personal forks are untouched).
  await prisma.userTagImport.deleteMany({
    where: { tagId: deck.publishedTagId },
  });

  await prisma.deck.update({
    where: { id: deckId },
    data: {
      publishedAt: null,
      publishedTagId: null,
    },
  });

  return { removedCardCount: removed.count };
}

export async function listDeckCardsAdmin(
  deckId: string,
): Promise<EnrichedVocabCard[] | "NOT_FOUND"> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { userId: true },
  });
  if (!deck) return "NOT_FOUND";

  const rows = await prisma.card.findMany({
    where: {
      deckId,
      userId: deck.userId,
      sourceCardId: null,
    },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  const cards = await Promise.all(
    rows.map((row) => getCardById(row.id, deck.userId)),
  );
  return cards.filter((c): c is EnrichedVocabCard => c !== null);
}

export async function updateDeckAdmin(
  deckId: string,
  input: { name?: string },
): Promise<AdminDeckDto | "NOT_FOUND"> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { userId: true },
  });
  if (!deck) return "NOT_FOUND";

  if (input.name !== undefined) {
    const result = await updateDeck(deckId, deck.userId, { name: input.name });
    if (result === "NOT_FOUND") return "NOT_FOUND";
  }

  const updated = await getDeckAdmin(deckId);
  return updated ?? "NOT_FOUND";
}

export async function updateDeckCardAdmin(
  deckId: string,
  cardId: string,
  input: CardUpdateInput,
): Promise<EnrichedVocabCard | "NOT_FOUND" | "INVALID_DECK"> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    select: { userId: true },
  });
  if (!deck) return "NOT_FOUND";

  const owned = await prisma.card.findFirst({
    where: {
      id: cardId,
      deckId,
      userId: deck.userId,
      sourceCardId: null,
    },
    select: { id: true },
  });
  if (!owned) return "NOT_FOUND";

  return updateOwnedCardForUser(cardId, deck.userId, input);
}
