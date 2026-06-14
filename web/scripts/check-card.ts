import { prisma } from "../lib/db/prisma";

const id = process.argv[2] ?? "v-termine";

async function main() {
  const card = await prisma.card.findUnique({
    where: { id },
    include: {
      glosses: true,
      examples: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!card) {
    console.log(`NOT FOUND: ${id}`);
    process.exit(1);
  }
  console.log(`OK: ${card.head}`);
  console.log(`  audioPath=${card.audioPath ?? "(null)"}`);
  for (const ex of card.examples) {
    console.log(`  ex audio=${ex.audioPath ?? "(null)"} | ${ex.german.slice(0, 50)}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
