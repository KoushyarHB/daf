import type { LessonPageEntry } from "@/lib/vocab/types";

import { prisma } from "@/lib/db/prisma";

type DbLessonPage = {
  kind: "word" | "grammar";
  label: string;
  imagePath: string;
};

type DbLessonWithPages = {
  lektion: number;
  title: string;
  pages: DbLessonPage[];
};

export async function fetchLessons(): Promise<LessonPageEntry[]> {
  const rows: DbLessonWithPages[] = await prisma.lesson.findMany({
    include: { pages: true },
    orderBy: { lektion: "asc" },
  });

  const out: LessonPageEntry[] = [];
  for (const lesson of rows) {
    const word = lesson.pages.find((p) => p.kind === "word");
    const grammar = lesson.pages.find((p) => p.kind === "grammar");
    if (!word || !grammar) continue;
    out.push({
      lektion: lesson.lektion,
      title: lesson.title,
      wordPage: { label: word.label, image: word.imagePath },
      grammarPage: { label: grammar.label, image: grammar.imagePath },
    });
  }
  return out;
}
