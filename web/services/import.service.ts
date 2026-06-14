import { prisma } from "@/lib/db/prisma";
import { getCommunityUserId } from "@/lib/community";
import {
  DAF_LEK_TAG_PREFIX,
  isDafLekTagSlug,
  isPublishedDeckTagSlug,
} from "@/lib/tags/constants";

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

export async function getAvailableTagImportOptions(
  userId: string,
): Promise<TagImportOption[]> {
  const communityUserId = await getCommunityUserId();
  const [communityCards, importedSlugs, lessons] = await Promise.all([
    prisma.card.findMany({
      where: { userId: communityUserId },
      select: {
        level: true,
        tags: { select: { tag: { select: { slug: true, label: true } } } },
      },
    }),
    getImportedTagSlugs(userId),
    prisma.lesson.findMany({
      select: { lektion: true, title: true },
    }),
  ]);

  const importedSet = new Set(importedSlugs);
  const titleByLektion = new Map(lessons.map((l) => [l.lektion, l.title]));

  const bundles = new Map<
    string,
    { label: string; level: string; cardCount: number }
  >();

  for (const card of communityCards) {
    for (const { tag } of card.tags) {
      if (!isDafLekTagSlug(tag.slug) && !isPublishedDeckTagSlug(tag.slug)) {
        continue;
      }
      let label: string;
      const level = card.level || "A1";
      if (isPublishedDeckTagSlug(tag.slug)) {
        label = tag.label;
      } else {
        const lekMatch = tag.slug.slice(DAF_LEK_TAG_PREFIX.length);
        const lektion = Number.parseInt(lekMatch, 10);
        const lessonTitle = Number.isNaN(lektion)
          ? undefined
          : titleByLektion.get(lektion);
        label = lessonTitle
          ? `DAF ${level} — ${lessonTitle}`
          : Number.isNaN(lektion)
            ? tag.label
            : `DAF ${level} — Lektion ${lektion}`;
      }
      const prev = bundles.get(tag.slug);
      if (prev) {
        prev.cardCount += 1;
      } else {
        bundles.set(tag.slug, { label, level, cardCount: 1 });
      }
    }
  }

  return [...bundles.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, meta]) => ({
      slug,
      label: meta.label,
      level: meta.level,
      cardCount: meta.cardCount,
      imported: importedSet.has(slug),
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
      userId: communityUserId,
      tags: { some: { tagId: tag.id } },
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
      userId: communityUserId,
      tags: { some: { tagId: tag.id } },
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
