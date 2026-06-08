import { randomUUID } from "crypto";

import type { Prisma } from "@prisma/client";

import type { CardListQuery } from "@/lib/api/schemas";
import { buildPaginatedResponse } from "@/lib/api/types";
import type { PaginatedResponse } from "@/lib/api/types";
import { getCommunityUserId, isCommunityOwner } from "@/lib/community";
import { prisma } from "@/lib/db/prisma";
import { deckNoFromRank, enrichCards } from "@/lib/vocab/card-utils";
import type {
  EnrichedVocabCard,
  GrammarTable,
  VocabCard,
  VocabPos,
} from "@/lib/vocab/types";
import { normalizeVocabPos } from "@/lib/vocab/types";
import type { z } from "zod";
import type { cardUpdateSchema, cardWriteSchema } from "@/lib/api/schemas";

const cardInclude = {
  glosses: { orderBy: { sortOrder: "asc" as const } },
  notes: { orderBy: { sortOrder: "asc" as const } },
  examples: { orderBy: { sortOrder: "asc" as const } },
} as const;

type DbCard = {
  id: string;
  userId: string;
  sourceCardId: string | null;
  head: string;
  ipa: string | null;
  pos: string;
  pluralRule: string | null;
  pluralForm: string | null;
  imagePath: string | null;
  audioPath: string | null;
  lektion: number | null;
  level: string;
  sortOrder: number;
  grammarTable: unknown;
  createdAt: Date;
  updatedAt: Date;
  glosses: { text: string }[];
  notes: { text: string }[];
  examples: {
    german: string;
    english: string | null;
    audioPath: string | null;
  }[];
};

type CardWriteInput = z.infer<typeof cardWriteSchema>;
type CardUpdateInput = z.infer<typeof cardUpdateSchema>;

function prismaPosToVocabPos(pos: string): VocabPos {
  return normalizeVocabPos(pos);
}

function dbCardToVocabCard(row: DbCard): VocabCard {
  return {
    id: row.id,
    head: row.head,
    ipa: row.ipa ?? undefined,
    pos: prismaPosToVocabPos(row.pos),
    pluralRule: row.pluralRule ?? undefined,
    plural: row.pluralForm ?? undefined,
    gloss: row.glosses.map((g) => g.text),
    notes: row.notes.map((n) => n.text),
    examples: row.examples.map((ex) => ({
      german: ex.german,
      english: ex.english,
      audio: ex.audioPath ?? undefined,
    })),
    grammarTable: (row.grammarTable as GrammarTable | null) ?? undefined,
    image: row.imagePath ?? undefined,
    audio: row.audioPath ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lektion: row.lektion,
    level: row.level,
  };
}

function toEnriched(
  row: DbCard,
  communityUserId: string,
  viewerUserId: string | null,
  deckNo: number,
): EnrichedVocabCard {
  const [card] = enrichCards([dbCardToVocabCard(row)], { deckNoForFirst: deckNo });
  const isCustomized = row.sourceCardId != null;
  const isCommunity =
    isCommunityOwner(row.userId, communityUserId) || isCustomized;
  return {
    ...card,
    isCommunity,
    isCustomized,
    isOwned: viewerUserId !== null && row.userId === viewerUserId,
    sourceCardId: row.sourceCardId,
  };
}

async function buildDeckRankMap(
  where: Prisma.CardWhereInput,
): Promise<Map<string, number>> {
  const rows = await prisma.card.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  return new Map(rows.map((row, rank) => [row.id, rank]));
}

function deckNoForRank(rank: number | undefined, totalItems: number): number {
  if (rank === undefined) return 1;
  return deckNoFromRank(rank, totalItems);
}

async function getExcludedCommunityIds(userId: string): Promise<string[]> {
  const [hidden, forks] = await Promise.all([
    prisma.userCardHidden.findMany({
      where: { userId },
      select: { cardId: true },
    }),
    prisma.card.findMany({
      where: { userId, sourceCardId: { not: null } },
      select: { sourceCardId: true },
    }),
  ]);
  const ids = new Set<string>();
  for (const h of hidden) ids.add(h.cardId);
  for (const f of forks) {
    if (f.sourceCardId) ids.add(f.sourceCardId);
  }
  return [...ids];
}

function buildFilterWhere(
  query: CardListQuery,
  userId: string | null,
): Prisma.CardWhereInput {
  const where: Prisma.CardWhereInput = {};

  if (query.lektion && query.lektion !== "all") {
    const lek = Number(query.lektion);
    if (!Number.isNaN(lek)) where.lektion = lek;
  }
  if (query.level && query.level !== "all") {
    where.level = query.level;
  }
  if (query.pos && query.pos !== "all") {
    where.pos = query.pos;
  }

  if (query.studied && query.studied !== "all") {
    if (!userId) {
      throw new Error("STUDIED_FILTER_REQUIRES_AUTH");
    }
    if (query.studied === "true") {
      where.progress = { some: { userId, studied: true } };
    } else {
      where.OR = [
        { progress: { none: { userId } } },
        { progress: { some: { userId, studied: false } } },
      ];
    }
  }

  return where;
}

async function buildVisibleWhere(
  query: CardListQuery,
  userId: string | null,
  communityUserId: string,
): Promise<Prisma.CardWhereInput> {
  const filterWhere = buildFilterWhere(query, userId);

  if (!userId) {
    return { AND: [filterWhere, { userId: communityUserId }] };
  }

  const excludeIds = await getExcludedCommunityIds(userId);
  const communityWhere: Prisma.CardWhereInput = {
    userId: communityUserId,
    ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
  };

  return {
    AND: [
      filterWhere,
      {
        OR: [communityWhere, { userId }],
      },
    ],
  };
}

async function canViewCard(
  row: { id: string; userId: string },
  userId: string | null,
  communityUserId: string,
): Promise<boolean> {
  if (row.userId === communityUserId) {
    if (!userId) return true;
    const excludeIds = await getExcludedCommunityIds(userId);
    return !excludeIds.includes(row.id);
  }
  return userId !== null && row.userId === userId;
}

function buildOrderBy(
  sort: CardListQuery["sort"],
): Prisma.CardOrderByWithRelationInput | Prisma.CardOrderByWithRelationInput[] {
  if (sort === "date-asc") return { createdAt: "asc" };
  if (sort === "date-desc") return { createdAt: "desc" };
  if (sort === "deck-asc") return [{ sortOrder: "desc" }, { id: "desc" }];
  return [{ sortOrder: "asc" }, { id: "asc" }];
}

async function fetchStudiedSet(
  userId: string,
  cardIds: string[],
): Promise<Set<string>> {
  if (cardIds.length === 0) return new Set();
  const rows = await prisma.userCardProgress.findMany({
    where: { userId, cardId: { in: cardIds }, studied: true },
    select: { cardId: true },
  });
  return new Set(rows.map((r) => r.cardId));
}

function attachStudied(
  cards: EnrichedVocabCard[],
  studiedSet: Set<string>,
): EnrichedVocabCard[] {
  return cards.map((card) => ({
    ...card,
    studied: studiedSet.has(card.domId),
  }));
}

export async function listCards(
  query: CardListQuery,
  userId: string | null,
): Promise<PaginatedResponse<EnrichedVocabCard>> {
  const communityUserId = await getCommunityUserId();
  const where = await buildVisibleWhere(query, userId, communityUserId);
  const orderBy = buildOrderBy(query.sort);
  const skip = (query.page - 1) * query.pageSize;

  const [totalItems, rows] = await Promise.all([
    prisma.card.count({ where }),
    prisma.card.findMany({
      where,
      orderBy,
      skip,
      take: query.pageSize,
      include: cardInclude,
    }),
  ]);

  const rankMap = await buildDeckRankMap(where);

  let items = rows.map((row) => {
    const deckNo = deckNoForRank(rankMap.get(row.id), totalItems);
    return toEnriched(row as DbCard, communityUserId, userId, deckNo);
  });
  if (userId) {
    const studiedSet = await fetchStudiedSet(
      userId,
      items.map((c) => c.domId),
    );
    items = attachStudied(items, studiedSet);
  }

  return buildPaginatedResponse(items, query.page, query.pageSize, totalItems);
}

export async function getCardById(
  id: string,
  userId: string | null,
): Promise<EnrichedVocabCard | null> {
  const communityUserId = await getCommunityUserId();
  const row = await prisma.card.findUnique({
    where: { id },
    include: cardInclude,
  });
  if (!row) return null;
  if (!(await canViewCard(row, userId, communityUserId))) return null;

  const visibleWhere = await buildVisibleWhere(
    { page: 1, pageSize: 1, sort: "deck-desc" },
    userId,
    communityUserId,
  );
  const rankMap = await buildDeckRankMap(visibleWhere);
  const deckNo = deckNoForRank(rankMap.get(id), rankMap.size);

  let card = toEnriched(row as DbCard, communityUserId, userId, deckNo);
  if (userId) {
    const studiedSet = await fetchStudiedSet(userId, [id]);
    card = { ...card, studied: studiedSet.has(id) };
  }
  return card;
}

export async function getFilterOptions(userId: string | null): Promise<{
  lektions: number[];
  levels: string[];
  posValues: VocabPos[];
}> {
  const communityUserId = await getCommunityUserId();
  const where = await buildVisibleWhere(
    { page: 1, pageSize: 100, sort: "deck-desc" },
    userId,
    communityUserId,
  );
  const rows = await prisma.card.findMany({
    where,
    select: { lektion: true, level: true, pos: true },
  });
  const lektions = new Set<number>();
  const levels = new Set<string>();
  const posValues = new Set<VocabPos>();
  for (const row of rows) {
    if (row.lektion != null) lektions.add(row.lektion);
    if (row.level) levels.add(row.level);
    posValues.add(prismaPosToVocabPos(row.pos));
  }
  return {
    lektions: [...lektions].sort((a, b) => a - b),
    levels: [...levels].sort(),
    posValues: [...posValues],
  };
}

async function replaceChildRows(
  cardId: string,
  input: CardWriteInput | CardUpdateInput,
): Promise<void> {
  if (input.gloss !== undefined) {
    await prisma.cardGloss.deleteMany({ where: { cardId } });
    const glosses = input.gloss.filter((g) => g.trim());
    if (glosses.length > 0) {
      await prisma.cardGloss.createMany({
        data: glosses.map((text, sortOrder) => ({
          cardId,
          text: text.trim(),
          sortOrder,
        })),
      });
    }
  }

  if (input.notes !== undefined) {
    await prisma.cardNote.deleteMany({ where: { cardId } });
    const notes = input.notes.filter((n) => n.trim());
    if (notes.length > 0) {
      await prisma.cardNote.createMany({
        data: notes.map((text, sortOrder) => ({
          cardId,
          text: text.trim(),
          sortOrder,
        })),
      });
    }
  }

  if (input.examples !== undefined) {
    await prisma.cardExample.deleteMany({ where: { cardId } });
    if (input.examples.length > 0) {
      await prisma.cardExample.createMany({
        data: input.examples.map((ex, sortOrder) => ({
          cardId,
          german: ex.german,
          english: ex.english ?? null,
          audioPath: ex.audio ?? null,
          sortOrder,
        })),
      });
    }
  }
}

async function hideCommunityCardForUser(
  userId: string,
  cardId: string,
): Promise<void> {
  await prisma.userCardHidden.upsert({
    where: { userId_cardId: { userId, cardId } },
    create: { userId, cardId },
    update: {},
  });
}

async function rowToWriteInput(row: DbCard): Promise<CardWriteInput> {
  return {
    head: row.head,
    ipa: row.ipa ?? undefined,
    pos: prismaPosToVocabPos(row.pos),
    gloss: row.glosses.map((g) => g.text),
    notes: row.notes.map((n) => n.text),
    examples: row.examples.map((ex) => ({
      german: ex.german,
      english: ex.english,
      audio: ex.audioPath ?? undefined,
    })),
    pluralRule: row.pluralRule ?? undefined,
    plural: row.pluralForm ?? undefined,
    grammarTable: (row.grammarTable as GrammarTable | null) ?? undefined,
    image: row.imagePath ?? undefined,
    audio: row.audioPath ?? undefined,
    lektion: row.lektion,
    level: row.level,
  };
}

function mergeWriteInput(
  base: CardWriteInput,
  patch: CardUpdateInput,
): CardWriteInput {
  return {
    head: patch.head ?? base.head,
    ipa: patch.ipa !== undefined ? patch.ipa : base.ipa,
    pos: patch.pos ?? base.pos,
    gloss: patch.gloss ?? base.gloss,
    notes: patch.notes ?? base.notes,
    examples: patch.examples ?? base.examples,
    pluralRule: patch.pluralRule !== undefined ? patch.pluralRule : base.pluralRule,
    plural: patch.plural !== undefined ? patch.plural : base.plural,
    grammarTable:
      patch.grammarTable !== undefined ? patch.grammarTable : base.grammarTable,
    image: patch.image !== undefined ? patch.image : base.image,
    audio: patch.audio !== undefined ? patch.audio : base.audio,
    lektion: patch.lektion !== undefined ? patch.lektion : base.lektion,
    level: patch.level ?? base.level,
  };
}

async function forkCommunityCard(
  sourceId: string,
  userId: string,
  input: CardUpdateInput,
): Promise<EnrichedVocabCard | "NOT_FOUND"> {
  const communityUserId = await getCommunityUserId();
  const source = await prisma.card.findUnique({
    where: { id: sourceId },
    include: cardInclude,
  });
  if (!source || !isCommunityOwner(source.userId, communityUserId)) {
    return "NOT_FOUND";
  }

  const existingFork = await prisma.card.findFirst({
    where: { userId, sourceCardId: sourceId },
    select: { id: true },
  });
  if (existingFork) {
    const result = await updateOwnedCard(existingFork.id, userId, input);
    if (result === "NOT_FOUND") return "NOT_FOUND";
    return result;
  }

  const base = await rowToWriteInput(source as DbCard);
  const merged = mergeWriteInput(base, input);
  const now = new Date();
  const forkId = `fork-${randomUUID()}`;

  await prisma.card.create({
    data: {
      id: forkId,
      userId,
      sourceCardId: sourceId,
      head: merged.head,
      ipa: merged.ipa ?? null,
      pos: normalizeVocabPos(merged.pos ?? "other"),
      pluralRule: merged.pluralRule ?? null,
      pluralForm: merged.plural ?? null,
      imagePath: merged.image ?? null,
      audioPath: merged.audio ?? null,
      lektion: merged.lektion ?? null,
      level: merged.level,
      sortOrder: source.sortOrder,
      grammarTable: merged.grammarTable ?? undefined,
      createdAt: source.createdAt,
      updatedAt: now,
    },
  });

  await replaceChildRows(forkId, merged);
  await hideCommunityCardForUser(userId, sourceId);

  const progress = await prisma.userCardProgress.findUnique({
    where: { userId_cardId: { userId, cardId: sourceId } },
  });
  if (progress) {
    await prisma.userCardProgress.upsert({
      where: { userId_cardId: { userId, cardId: forkId } },
      create: {
        userId,
        cardId: forkId,
        studied: progress.studied,
        studiedAt: progress.studiedAt,
      },
      update: {
        studied: progress.studied,
        studiedAt: progress.studiedAt,
      },
    });
  }

  const forked = await getCardById(forkId, userId);
  if (!forked) return "NOT_FOUND";
  return forked;
}

export async function createCard(
  userId: string,
  input: CardWriteInput,
): Promise<EnrichedVocabCard> {
  // Lowest sortOrder → rank 0 → deck # equals total (e.g. #101 when 100 exist).
  const minOrder = await prisma.card.aggregate({ _min: { sortOrder: true } });
  const sortOrder = (minOrder._min.sortOrder ?? 0) - 1;
  const now = new Date();
  const id = input.id?.trim() || `user-${randomUUID()}`;

  await prisma.card.create({
    data: {
      id,
      userId,
      head: input.head,
      ipa: input.ipa ?? null,
      pos: normalizeVocabPos(input.pos ?? "other"),
      pluralRule: input.pluralRule ?? null,
      pluralForm: input.plural ?? null,
      imagePath: input.image ?? null,
      audioPath: input.audio ?? null,
      lektion: input.lektion ?? null,
      level: input.level,
      sortOrder,
      grammarTable: input.grammarTable ?? undefined,
      createdAt: now,
      updatedAt: now,
    },
  });

  await replaceChildRows(id, input);

  const created = await getCardById(id, userId);
  if (!created) throw new Error("CREATE_FAILED");
  return created;
}

async function updateOwnedCard(
  cardId: string,
  userId: string,
  input: CardUpdateInput,
): Promise<EnrichedVocabCard | "NOT_FOUND"> {
  const existing = await prisma.card.findUnique({ where: { id: cardId } });
  if (!existing || existing.userId !== userId) return "NOT_FOUND";

  const now = new Date();
  await prisma.card.update({
    where: { id: cardId },
    data: {
      ...(input.head !== undefined ? { head: input.head } : {}),
      ...(input.ipa !== undefined ? { ipa: input.ipa ?? null } : {}),
      ...(input.pos !== undefined
        ? { pos: normalizeVocabPos(input.pos) }
        : {}),
      ...(input.pluralRule !== undefined
        ? { pluralRule: input.pluralRule ?? null }
        : {}),
      ...(input.plural !== undefined ? { pluralForm: input.plural ?? null } : {}),
      ...(input.image !== undefined ? { imagePath: input.image ?? null } : {}),
      ...(input.audio !== undefined ? { audioPath: input.audio ?? null } : {}),
      ...(input.lektion !== undefined ? { lektion: input.lektion } : {}),
      ...(input.level !== undefined ? { level: input.level } : {}),
      ...(input.grammarTable !== undefined
        ? { grammarTable: input.grammarTable ?? undefined }
        : {}),
      updatedAt: now,
    },
  });

  await replaceChildRows(cardId, input);

  const updated = await getCardById(cardId, userId);
  if (!updated) return "NOT_FOUND";
  return updated;
}

export async function updateCard(
  cardId: string,
  userId: string,
  input: CardUpdateInput,
): Promise<EnrichedVocabCard | "NOT_FOUND" | "FORBIDDEN"> {
  const communityUserId = await getCommunityUserId();
  const existing = await prisma.card.findUnique({ where: { id: cardId } });
  if (!existing) return "NOT_FOUND";

  if (existing.userId === userId) {
    const updated = await updateOwnedCard(cardId, userId, input);
    if (updated === "NOT_FOUND") return "NOT_FOUND";
    return updated;
  }

  if (isCommunityOwner(existing.userId, communityUserId)) {
    const forked = await forkCommunityCard(cardId, userId, input);
    if (forked === "NOT_FOUND") return "NOT_FOUND";
    return forked;
  }

  return "FORBIDDEN";
}

export async function deleteCard(
  cardId: string,
  userId: string,
): Promise<"OK" | "NOT_FOUND" | "FORBIDDEN" | "HIDDEN"> {
  const communityUserId = await getCommunityUserId();
  const existing = await prisma.card.findUnique({ where: { id: cardId } });
  if (!existing) return "NOT_FOUND";

  if (existing.userId === userId) {
    if (existing.sourceCardId) {
      await prisma.userCardHidden.deleteMany({
        where: { userId, cardId: existing.sourceCardId },
      });
    }
    await prisma.card.delete({ where: { id: cardId } });
    return "OK";
  }

  if (isCommunityOwner(existing.userId, communityUserId)) {
    await hideCommunityCardForUser(userId, cardId);
    return "HIDDEN";
  }

  return "FORBIDDEN";
}

export async function setCardStudied(
  userId: string,
  cardId: string,
  studied: boolean,
): Promise<boolean> {
  const communityUserId = await getCommunityUserId();
  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) return false;
  if (!(await canViewCard(card, userId, communityUserId))) return false;

  await prisma.userCardProgress.upsert({
    where: { userId_cardId: { userId, cardId } },
    create: {
      userId,
      cardId,
      studied,
      studiedAt: studied ? new Date() : null,
    },
    update: {
      studied,
      studiedAt: studied ? new Date() : null,
    },
  });
  return true;
}
