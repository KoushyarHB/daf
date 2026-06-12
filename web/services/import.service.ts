import { prisma } from "@/lib/db/prisma";
import { getCommunityUserId } from "@/lib/community";

export type LektionImportOption = {
  lektion: number;
  level: string;
  label: string;
  cardCount: number;
  imported: boolean;
};

export type ImportStatus = {
  importedLektions: number[];
  availableLektions: LektionImportOption[];
  hasUserCreatedCard: boolean;
  showImportOnHome: boolean;
};

export async function getImportedLektionIds(userId: string): Promise<number[]> {
  const rows = await prisma.userLektionImport.findMany({
    where: { userId },
    select: { lektion: true },
    orderBy: { lektion: "asc" },
  });
  return rows.map((r) => r.lektion);
}

/** True when the user has added at least one card (not a community fork). */
export async function hasUserCreatedCard(userId: string): Promise<boolean> {
  const count = await prisma.card.count({
    where: { userId, sourceCardId: null },
  });
  return count > 0;
}

export async function getAvailableLektionOptions(
  userId: string,
): Promise<LektionImportOption[]> {
  const communityUserId = await getCommunityUserId();
  const [groups, imported, lessons] = await Promise.all([
    prisma.card.groupBy({
      by: ["lektion", "level"],
      where: {
        userId: communityUserId,
        lektion: { not: null },
      },
      _count: { _all: true },
      orderBy: [{ lektion: "asc" }, { level: "asc" }],
    }),
    getImportedLektionIds(userId),
    prisma.lesson.findMany({
      select: { lektion: true, title: true },
    }),
  ]);

  const importedSet = new Set(imported);
  const titleByLektion = new Map(lessons.map((l) => [l.lektion, l.title]));

  return groups
    .filter((g) => g.lektion != null)
    .map((g) => {
      const lektion = g.lektion as number;
      const level = g.level || "A1";
      const lessonTitle = titleByLektion.get(lektion);
      const label = lessonTitle
        ? `DAF ${level} — ${lessonTitle}`
        : `DAF ${level} — Lektion ${lektion}`;
      return {
        lektion,
        level,
        label,
        cardCount: g._count._all,
        imported: importedSet.has(lektion),
      };
    });
}

export async function getImportStatus(userId: string): Promise<ImportStatus> {
  const [importedLektions, availableLektions, created] = await Promise.all([
    getImportedLektionIds(userId),
    getAvailableLektionOptions(userId),
    hasUserCreatedCard(userId),
  ]);
  return {
    importedLektions,
    availableLektions,
    hasUserCreatedCard: created,
    showImportOnHome: !created,
  };
}

export async function importCommunityLektion(
  userId: string,
  lektion: number,
): Promise<"OK" | "NOT_FOUND"> {
  const communityUserId = await getCommunityUserId();
  const exists = await prisma.card.findFirst({
    where: {
      userId: communityUserId,
      lektion,
    },
    select: { id: true },
  });
  if (!exists) return "NOT_FOUND";

  await prisma.userLektionImport.upsert({
    where: { userId_lektion: { userId, lektion } },
    create: { userId, lektion },
    update: {},
  });
  return "OK";
}
