export type AusExample = {
  german: string;
  english: string;
  speakText?: string;
};

export type AusArticleRow = {
  id: string;
  gender: string;
  genderClass: "grammar-col--der" | "grammar-col--die" | "grammar-col--die-pl";
  dative: string;
  examples: AusExample[];
};

/** Short phrases — no article after aus. */
export const AUS_NO_ARTICLE_PHRASES: readonly AusExample[] = [
  { german: "aus Deutschland", english: "from Germany" },
  { german: "aus China", english: "from China" },
  { german: "aus Österreich", english: "from Austria" },
  { german: "aus Russland", english: "from Russia" },
  { german: "aus Berlin", english: "from Berlin (city)" },
  { german: "aus Europa", english: "from Europe" },
];

export const AUS_SENTENCE_EXAMPLES: readonly AusExample[] = [
  {
    german: "Ich komme aus Deutschland.",
    english: "I come from Germany.",
  },
  {
    german: "Woher kommst du?",
    english: "Where do you come from?",
  },
  {
    german: "Sie kommt aus der Schweiz.",
    english: "She comes from Switzerland.",
  },
];

export const AUS_WITH_ARTICLE_ROWS: readonly AusArticleRow[] = [
  {
    id: "masc",
    gender: "mask",
    genderClass: "grammar-col--der",
    dative: "dem",
    examples: [
      { german: "aus dem Iran", english: "from Iran" },
      { german: "aus dem Irak", english: "from Iraq" },
    ],
  },
  {
    id: "fem",
    gender: "fem",
    genderClass: "grammar-col--die",
    dative: "der",
    examples: [
      { german: "aus der Schweiz", english: "from Switzerland" },
      { german: "aus der Türkei", english: "from Turkey" },
      { german: "aus der Ukraine", english: "from Ukraine" },
    ],
  },
  {
    id: "pl",
    gender: "plural",
    genderClass: "grammar-col--die-pl",
    dative: "den",
    examples: [
      { german: "aus den USA", english: "from the USA" },
      { german: "aus den Niederlanden", english: "from the Netherlands" },
    ],
  },
];

export const AUS_ADJECTIVE_EXAMPLE: AusExample = {
  german: "aus dem schönen Deutschland",
  english: "from beautiful Germany (adjective → article appears)",
};
