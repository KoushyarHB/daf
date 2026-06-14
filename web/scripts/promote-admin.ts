/**
 * Promote an existing user to admin or super_admin.
 *
 * Usage:
 *   npm run db:promote-admin -- <email> [role]
 *   npm run db:promote-admin -- --list
 *
 * Roles: user | admin | super_admin (default: super_admin)
 */
import { prisma } from "@/lib/db/prisma";

const VALID_ROLES = ["user", "admin", "super_admin"] as const;

async function listUsers(): Promise<void> {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  if (users.length === 0) {
    console.log("No users found. Register at /register first.");
    return;
  }
  console.log("email\trole\tname");
  for (const u of users) {
    console.log(`${u.email}\t${u.role}\t${u.name ?? ""}`);
  }
}

async function main() {
  const arg = process.argv[2]?.trim();
  if (!arg || arg === "--list" || arg === "-l") {
    if (arg === "--list" || arg === "-l") {
      await listUsers();
      return;
    }
    console.error("Usage: npm run db:promote-admin -- <email> [role]");
    console.error("       npm run db:promote-admin -- --list");
    process.exit(1);
  }

  const email = arg.toLowerCase();
  const role = (process.argv[3] ?? "super_admin").trim() as (typeof VALID_ROLES)[number];

  if (!VALID_ROLES.includes(role)) {
    console.error(`Role must be one of: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { email: true, role: true },
  });
  if (!existing) {
    console.error(`No user with email "${email}".`);
    console.error("");
    console.error("Registered users in this database:");
    await listUsers();
    console.error("");
    console.error(
      "DEFAULT_IMPORT_USER_EMAIL in .env is for manifest imports only — it is not your login account unless you registered with that address.",
    );
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role },
    select: { email: true, role: true },
  });
  console.log(`Updated ${user.email} → ${user.role}`);
  console.log("Sign out and sign back in for the new role to apply in the app.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
