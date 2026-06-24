export type TravelExample = {
  german: string;
  english: string;
};

export type TravelArticleRow = {
  id: string;
  gender: string;
  genderClass: "grammar-col--der" | "grammar-col--die" | "grammar-col--die-pl";
  akkusativ: string;
  examples: TravelExample[];
};

/** Short phrases — nach + place, no article. */
export const NACH_PHRASES: readonly TravelExample[] = [
  { german: "nach Deutschland", english: "to Germany" },
  { german: "nach Österreich", english: "to Austria" },
  { german: "nach China", english: "to China" },
  { german: "nach Berlin", english: "to Berlin (city)" },
  { german: "nach Europa", english: "to Europe" },
];

export const NACH_SENTENCES: readonly TravelExample[] = [
  {
    german: "Wir reisen nach Deutschland.",
    english: "We are travelling to Germany.",
  },
  {
    german: "Nächstes Jahr fahren wir nach Österreich.",
    english: "Next year we are going to Austria.",
  },
  {
    german: "Ich fahre nach Berlin.",
    english: "I am going to Berlin.",
  },
];

export const IN_AKKUSATIV_ROWS: readonly TravelArticleRow[] = [
  {
    id: "masc",
    gender: "mask",
    genderClass: "grammar-col--der",
    akkusativ: "den",
    examples: [
      { german: "in den Iran", english: "to Iran" },
      { german: "in den Irak", english: "to Iraq" },
    ],
  },
  {
    id: "fem",
    gender: "fem",
    genderClass: "grammar-col--die",
    akkusativ: "die",
    examples: [
      { german: "in die Schweiz", english: "to Switzerland" },
      { german: "in die Türkei", english: "to Turkey" },
      { german: "in die Ukraine", english: "to Ukraine" },
    ],
  },
  {
    id: "pl",
    gender: "plural",
    genderClass: "grammar-col--die-pl",
    akkusativ: "die",
    examples: [
      { german: "in die USA", english: "to the USA" },
      { german: "in die Niederlande", english: "to the Netherlands" },
    ],
  },
];

export const IN_SENTENCES: readonly TravelExample[] = [
  {
    german: "Wir fahren in die Schweiz.",
    english: "We are driving to Switzerland.",
  },
  {
    german: "Ich fahre in die Türkei.",
    english: "I am driving to Turkey.",
  },
  {
    german: "Wir fliegen in die Ukraine.",
    english: "We are flying to Ukraine.",
  },
  {
    german: "Wir fliegen in den Iran.",
    english: "We are flying to Iran.",
  },
  {
    german: "Er fährt in den Irak.",
    english: "He is driving to Iraq.",
  },
  {
    german: "Wir fliegen in die USA.",
    english: "We are flying to the USA.",
  },
  {
    german: "Wir fahren in die Niederlande.",
    english: "We are driving to the Netherlands.",
  },
];

/** Pairs that mirror section 8 (aus) vs section 9 (to). */
export const FROM_TO_PAIRS: readonly {
  from: TravelExample;
  to: TravelExample;
}[] = [
  {
    from: { german: "aus Deutschland", english: "from Germany" },
    to: { german: "nach Deutschland", english: "to Germany" },
  },
  {
    from: { german: "aus der Schweiz", english: "from Switzerland" },
    to: { german: "in die Schweiz", english: "to Switzerland" },
  },
  {
    from: { german: "aus dem Iran", english: "from Iran" },
    to: { german: "in den Iran", english: "to Iran" },
  },
  {
    from: { german: "aus den USA", english: "from the USA" },
    to: { german: "in die USA", english: "to the USA" },
  },
];
