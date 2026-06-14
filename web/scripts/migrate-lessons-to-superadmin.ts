/**
 * Migrate seeded lesson bundles (daf-lek-*) owned by the community/import user
 * into real decks owned by a super admin, marked as published to the community.
 *
 * - Reassigns each lesson's original cards to a new super-admin-owned deck
 *   (no duplication; card ids are preserved so existing forks/imports stay valid).
 * - Marks each new deck published, using the existing daf-lek-* tag as its
 *   publish tag (so already-imported users keep seeing the cards).
 *
 * Idempotent: a tag already used by a published deck is skipped.
 *
 * Usage:
 *   npx tsx scripts/migrate-lessons-to-superadmin.ts [superAdminEmail]
 *   (defaults to env SUPER_ADMIN_EMAIL or koushyar.heidari@gmail.com)
 */
import { prisma } from "@/lib/db/prisma";
import { getCommunityUserId } from "@/lib/community";
import { createDeck } from "@/services/decks.service";
import { isDafLekTagSlug, DAF_LEK_TAG_PREFIX } from "@/lib/tags/constants";
import { normalizeCefrLevel } from "@/lib/vocab/levels";

async function main() {
  const email =
    process.argv[2]?.trim().toLowerCase() ||
    process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() ||
    "koushyar.heidari@gmail.com";

  const admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    console.error(`No user found for ${email}.`);
    process.exit(1);
  }
  if (admin.role !== "super_admin") {
    console.error(`User ${email} is not a super_admin (role=${admin.role}).`);
    process.exit(1);
  }

  const communityUserId = await getCommunityUserId();
  const lessons = await prisma.lesson.findMany({
    select: { lektion: true, title: true },
  });
  const titleByLektion = new Map(lessons.map((l) => [l.lektion, l.title]));

  // All daf-lek-* tags that currently have community-owned original cards.
  const tags = await prisma.tag.findMany({
    where: { slug: { startsWith: DAF_LEK_TAG_PREFIX } },
    select: { id: true, slug: true, label: true },
    orderBy: { slug: "asc" },
  });

  for (const tag of tags) {
    if (!isDafLekTagSlug(tag.slug)) continue;

    const alreadyPublished = await prisma.deck.findFirst({
      where: { publishedTagId: tag.id },
      select: { id: true },
    });
    if (alreadyPublished) {
      console.log(`SKIP ${tag.slug} — already a published deck.`);
      continue;
    }

    const cards = await prisma.card.findMany({
      where: {
        userId: communityUserId,
        sourceCardId: null,
        tags: { some: { tagId: tag.id } },
      },
      select: { id: true, level: true },
    });
    if (cards.length === 0) {
      console.log(`SKIP ${tag.slug} — no community cards.`);
      continue;
    }

    const lektion = Number.parseInt(tag.slug.slice(DAF_LEK_TAG_PREFIX.length), 10);
    const level = normalizeCefrLevel(cards[0].level || "A1");
    const lessonTitle = Number.isNaN(lektion)
      ? undefined
      : titleByLektion.get(lektion);
    const name = lessonTitle
      ? `DAF ${level} — ${lessonTitle}`
      : Number.isNaN(lektion)
        ? tag.label
        : `DAF ${level} — Lektion ${lektion}`;

    const deck = await createDeck(
      admin.id,
      { name, level, slug: Number.isNaN(lektion) ? undefined : `lektion-${lektion}` },
      { isSystem: true },
    );

    const cardIds = cards.map((c) => c.id);
    await prisma.card.updateMany({
      where: { id: { in: cardIds } },
      data: { userId: admin.id, deckId: deck.id },
    });

    await prisma.deck.update({
      where: { id: deck.id },
      data: { publishedAt: new Date(), publishedTagId: tag.id },
    });

    await prisma.deckPublish.create({
      data: {
        sourceDeckId: deck.id,
        publishedById: admin.id,
        tagId: tag.id,
        cardCount: cardIds.length,
      },
    });

    console.log(
      `OK   ${tag.slug} → deck "${name}" (${cardIds.length} cards) owned by ${email}, published.`,
    );
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
