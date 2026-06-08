import { prisma } from "@/lib/db/prisma";
import { ensureDefaultImportUser } from "@/services/users.service";

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
