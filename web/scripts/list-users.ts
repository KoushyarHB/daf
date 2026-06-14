import { prisma } from "@/lib/db/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  if (users.length === 0) {
    console.log("No users in database. Register at /register first.");
    return;
  }
  for (const u of users) {
    console.log(`${u.email}\t${u.role}\t${u.name ?? ""}`);
  }
}

main()
  .finally(() => prisma.$disconnect());
