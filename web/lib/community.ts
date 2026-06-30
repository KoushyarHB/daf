import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ensureDefaultImportUser } from "@/services/backend/users.service";

const DEFAULT_IMPORT_EMAIL = "system@import.local";

let cachedCommunityUserId: string | null = null;

/** User id that owns manifest-imported community cards. */
export async function getCommunityUserId(): Promise<string> {
  if (cachedCommunityUserId) return cachedCommunityUserId;

  const envId = process.env.DEFAULT_IMPORT_USER_ID?.trim();
  if (envId) {
    const byId = await prisma.user.findUnique({ where: { id: envId } });
    if (byId) {
      cachedCommunityUserId = byId.id;
      return byId.id;
    }
  }

  const email =
    process.env.DEFAULT_IMPORT_USER_EMAIL?.trim() || DEFAULT_IMPORT_EMAIL;
  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    cachedCommunityUserId = byEmail.id;
    return byEmail.id;
  }

  cachedCommunityUserId = await ensureDefaultImportUser();
  return cachedCommunityUserId;
}

export function isCommunityOwner(
  cardUserId: string,
  communityUserId: string,
): boolean {
  return cardUserId === communityUserId;
}

/**
 * Prisma filter matching cards in the public catalog (importable by users):
 * original cards (not personal forks) that are either owned by the legacy
 * community/import user, or part of any published deck.
 */
export function publishedCatalogCardWhere(
  communityUserId: string,
): Prisma.CardWhereInput {
  return {
    sourceCardId: null,
    OR: [
      { userId: communityUserId },
      { deck: { is: { publishedAt: { not: null } } } },
    ],
  };
}

/** True when a card is part of the public catalog (published-deck original or legacy community card). */
export async function isCatalogCard(
  card: { userId: string; deckId: string | null; sourceCardId: string | null },
  communityUserId: string,
): Promise<boolean> {
  if (card.sourceCardId) return false;
  if (card.userId === communityUserId) return true;
  if (!card.deckId) return false;
  const deck = await prisma.deck.findUnique({
    where: { id: card.deckId },
    select: { publishedAt: true },
  });
  return deck?.publishedAt != null;
}
