export type GrammarLessonMeta = {
  slug: string;
  lektion: number;
  title: string;
  available: boolean;
  summary: string;
};

export const GRAMMAR_LESSONS: GrammarLessonMeta[] = [
  {
    slug: "lektion-1",
    lektion: 1,
    title: "DaF A1 — Lektion 1",
    available: true,
    summary:
      "Articles, plurals, alphabet, present tense, questions, cases, prepositions, possessives.",
  },
  {
    slug: "lektion-2",
    lektion: 2,
    title: "DaF A1 — Lektion 2",
    available: false,
    summary: "Coming soon.",
  },
  {
    slug: "lektion-3",
    lektion: 3,
    title: "DaF A1 — Lektion 3",
    available: false,
    summary: "Coming soon.",
  },
  {
    slug: "lektion-4",
    lektion: 4,
    title: "DaF A1 — Lektion 4",
    available: false,
    summary: "Coming soon.",
  },
  {
    slug: "lektion-5",
    lektion: 5,
    title: "DaF A1 — Lektion 5",
    available: false,
    summary: "Coming soon.",
  },
  {
    slug: "lektion-6",
    lektion: 6,
    title: "DaF A1 — Lektion 6",
    available: false,
    summary: "Coming soon.",
  },
  {
    slug: "lektion-7",
    lektion: 7,
    title: "DaF A1 — Lektion 7",
    available: false,
    summary: "Coming soon.",
  },
  {
    slug: "lektion-8",
    lektion: 8,
    title: "DaF A1 — Lektion 8",
    available: false,
    summary: "Coming soon.",
  },
];

export function grammarLessonBySlug(slug: string): GrammarLessonMeta | undefined {
  return GRAMMAR_LESSONS.find((l) => l.slug === slug);
}
