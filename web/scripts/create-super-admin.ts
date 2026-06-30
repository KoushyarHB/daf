/**
 * Create or update a super_admin account (production / Neon bootstrap).
 *
 * Usage:
 *   npm run db:create-super-admin -- <email> <password> [name]
 */
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";
import { ensureDefaultDeck } from "@/services/backend/decks.service";

const BCRYPT_ROUNDS = 12;

async function main() {
  const email =
    process.argv[2]?.trim().toLowerCase() ??
    process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.argv[3] ?? process.env.SUPER_ADMIN_PASSWORD;
  const name =
    process.argv[4]?.trim() ||
    process.env.SUPER_ADMIN_NAME?.trim() ||
    null;

  if (!email || !password) {
    console.error(
      "Usage: npm run db:create-super-admin -- <email> <password> [name]",
    );
    console.error(
      "Or set SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, and optional SUPER_ADMIN_NAME.",
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const user = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        name,
        role: "super_admin",
      },
      select: { id: true, email: true, name: true, role: true },
    });
    await ensureDefaultDeck(user.id);
    console.log(`Updated existing user → ${user.role}: ${user.email}`);
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "super_admin",
      },
      select: { id: true, email: true, name: true, role: true },
    });
    await ensureDefaultDeck(user.id);
    console.log(`Created ${user.role}: ${user.email}`);
  }

  console.log("Sign in at your deployed AUTH_URL with this email and password.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
