import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";

const DEFAULT_IMPORT_EMAIL = "system@import.local";
const BCRYPT_ROUNDS = 12;

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
}

export async function registerUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const email = input.email.toLowerCase().trim();
  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: "EMAIL_TAKEN" as const };
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name?.trim() || null,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return { user };
}

/** Ensures the manifest-import owner exists; returns user id. */
export async function ensureDefaultImportUser(): Promise<string> {
  const envId = process.env.DEFAULT_IMPORT_USER_ID?.trim();
  if (envId) {
    const byId = await prisma.user.findUnique({ where: { id: envId } });
    if (byId) return byId.id;
  }

  const fixedId = "default-import-user";
  const byFixedId = await prisma.user.findUnique({ where: { id: fixedId } });
  if (byFixedId) return byFixedId.id;

  const email = process.env.DEFAULT_IMPORT_USER_EMAIL?.trim() || DEFAULT_IMPORT_EMAIL;
  const existing = await findUserByEmail(email);
  if (existing) return existing.id;

  const passwordHash = await bcrypt.hash(
    process.env.DEFAULT_IMPORT_USER_PASSWORD ?? "import-only-not-for-login",
    BCRYPT_ROUNDS,
  );
  const user = await prisma.user.create({
    data: {
      id: fixedId,
      email,
      passwordHash,
      name: "Manifest import",
    },
  });
  return user.id;
}
