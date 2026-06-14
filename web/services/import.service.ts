import { prisma } from "@/lib/db/prisma";
import { getCommunityUserId, publishedCatalogCardWhere } from "@/lib/community";

export type TagImportOption = {
  slug: string;
  label: string;
  level: string;
  cardCount: number;
  imported: boolean;
};

export type ImportStatus = {
  importedTagSlugs: string[];
  availableTags: TagImportOption[];
  hasUserCreatedCard: boolean;
  /** Import panel on home — only before first import or user-created card. */
  showImportOnHome: boolean;
};

export async function getImportedTagSlugs(userId: string): Promise<string[]> {
  const rows = await prisma.userTagImport.findMany({
    where: { userId },
    select: { tag: { select: { slug: true } } },
    orderBy: { tag: { slug: "asc" } },
  });
  return rows.map((r) => r.tag.slug);
}

/** True when the user has added at least one card (not a community fork). */
export async function hasUserCreatedCard(userId: string): Promise<boolean> {
  const count = await prisma.card.count({
    where: { userId, sourceCardId: null },
  });
  return count > 0;
}

/**
 * Importable community decks = decks published by a super admin.
 * Each published deck is one importable bundle, keyed by its publish tag.
 */
export async function getAvailableTagImportOptions(
  userId: string,
): Promise<TagImportOption[]> {
  const [publishedDecks, importedSlugs] = await Promise.all([
    prisma.deck.findMany({
      where: {
        publishedAt: { not: null },
        publishedTagId: { not: null },
        user: { role: "super_admin" },
      },
      select: {
        name: true,
        level: true,
        publishedTag: { select: { slug: true, label: true } },
        _count: { select: { cards: true } },
      },
      orderBy: [{ name: "asc" }],
    }),
    getImportedTagSlugs(userId),
  ]);

  const importedSet = new Set(importedSlugs);

  return publishedDecks
    .filter((d) => d.publishedTag)
    .map((d) => ({
      slug: d.publishedTag!.slug,
      label: d.name,
      level: d.level || "A1",
      cardCount: d._count.cards,
      imported: importedSet.has(d.publishedTag!.slug),
    }));
}

export async function getImportStatus(userId: string): Promise<ImportStatus> {
  const [importedTagSlugs, availableTags, created] = await Promise.all([
    getImportedTagSlugs(userId),
    getAvailableTagImportOptions(userId),
    hasUserCreatedCard(userId),
  ]);
  const hasStartedDeck = importedTagSlugs.length > 0 || created;
  return {
    importedTagSlugs,
    availableTags,
    hasUserCreatedCard: created,
    showImportOnHome: !hasStartedDeck,
  };
}

export async function importCommunityTag(
  userId: string,
  slug: string,
): Promise<"OK" | "NOT_FOUND"> {
  const communityUserId = await getCommunityUserId();
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return "NOT_FOUND";

  const exists = await prisma.card.findFirst({
    where: {
      AND: [
        publishedCatalogCardWhere(communityUserId),
        { tags: { some: { tagId: tag.id } } },
      ],
    },
    select: { id: true },
  });
  if (!exists) return "NOT_FOUND";

  await prisma.userTagImport.upsert({
    where: { userId_tagId: { userId, tagId: tag.id } },
    create: { userId, tagId: tag.id },
    update: {},
  });
  return "OK";
}

export async function deimportCommunityTag(
  userId: string,
  slug: string,
): Promise<"OK" | "NOT_FOUND"> {
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return "NOT_FOUND";

  const existing = await prisma.userTagImport.findUnique({
    where: { userId_tagId: { userId, tagId: tag.id } },
  });
  if (!existing) return "NOT_FOUND";

  const communityUserId = await getCommunityUserId();
  const communityCards = await prisma.card.findMany({
    where: {
      AND: [
        publishedCatalogCardWhere(communityUserId),
        { tags: { some: { tagId: tag.id } } },
      ],
    },
    select: { id: true },
  });
  const communityIds = communityCards.map((c) => c.id);

  if (communityIds.length > 0) {
    const userForks = await prisma.card.findMany({
      where: { userId, sourceCardId: { in: communityIds } },
      select: { id: true, sourceCardId: true },
    });
    const forkIds = userForks.map((f) => f.id);

    if (forkIds.length > 0) {
      await prisma.userCardProgress.deleteMany({
        where: { userId, cardId: { in: forkIds } },
      });
      await prisma.card.deleteMany({
        where: { id: { in: forkIds } },
      });
    }

    await prisma.userCardProgress.deleteMany({
      where: { userId, cardId: { in: communityIds } },
    });
    await prisma.userCardHidden.deleteMany({
      where: { userId, cardId: { in: communityIds } },
    });
  }

  await prisma.userTagImport.delete({
    where: { userId_tagId: { userId, tagId: tag.id } },
  });
  return "OK";
}
