export type ConjugatedForm = {
  form: string;
  stem: string;
  suffix: string;
  farsi: string;
};

export type PersonalPronoun = {
  id: string;
  german: string;
  english: string;
  farsi: string;
  /** Disambiguate homographs like sie (she) vs sie (they). */
  hint?: string;
};

/** Subject pronouns used in the conjugation table below. */
export const PERSONAL_PRONOUNS: readonly PersonalPronoun[] = [
  { id: "ich", german: "ich", english: "I", farsi: "من" },
  {
    id: "du",
    german: "du",
    english: "you (informal, one person)",
    farsi: "تو",
  },
  { id: "er", german: "er", english: "he", farsi: "او" },
  {
    id: "sie-she",
    german: "sie",
    english: "she",
    farsi: "او",
    hint: "she",
  },
  { id: "es", german: "es", english: "it", farsi: "آن" },
  { id: "wir", german: "wir", english: "we", farsi: "ما" },
  {
    id: "ihr",
    german: "ihr",
    english: "you (informal, plural)",
    farsi: "شما",
  },
  {
    id: "sie-they",
    german: "sie",
    english: "they",
    farsi: "آن‌ها",
    hint: "they",
  },
  {
    id: "Sie-formal",
    german: "Sie",
    english: "you (formal)",
    farsi: "شما",
    hint: "formal",
  },
];

export type ConjugationRow = {
  person: readonly string[];
  ending: string;
  kommen: ConjugatedForm;
  arbeiten: ConjugatedForm;
};

export type SeinRow = {
  person: readonly string[];
  form: string;
  farsi: string;
};

export const REGULAR_CONJUGATION_ROWS: ConjugationRow[] = [
  {
    person: ["ich"],
    ending: "-e",
    kommen: { form: "komme", stem: "komm", suffix: "e", farsi: "می‌آیم" },
    arbeiten: { form: "arbeite", stem: "arbeit", suffix: "e", farsi: "کار می‌کنم" },
  },
  {
    person: ["du"],
    ending: "-st",
    kommen: { form: "kommst", stem: "komm", suffix: "st", farsi: "می‌آیی" },
    arbeiten: {
      form: "arbeitest",
      stem: "arbeit",
      suffix: "est",
      farsi: "کار می‌کنی",
    },
  },
  {
    person: ["er", "sie", "es"],
    ending: "-t",
    kommen: { form: "kommt", stem: "komm", suffix: "t", farsi: "می‌آید" },
    arbeiten: {
      form: "arbeitet",
      stem: "arbeit",
      suffix: "et",
      farsi: "کار می‌کند",
    },
  },
  {
    person: ["wir"],
    ending: "-en",
    kommen: { form: "kommen", stem: "komm", suffix: "en", farsi: "می‌آییم" },
    arbeiten: {
      form: "arbeiten",
      stem: "arbeit",
      suffix: "en",
      farsi: "کار می‌کنیم",
    },
  },
  {
    person: ["ihr"],
    ending: "-t",
    kommen: { form: "kommt", stem: "komm", suffix: "t", farsi: "می‌آیید" },
    arbeiten: {
      form: "arbeitet",
      stem: "arbeit",
      suffix: "et",
      farsi: "کار می‌کنید",
    },
  },
  {
    person: ["sie", "Sie"],
    ending: "-en",
    kommen: { form: "kommen", stem: "komm", suffix: "en", farsi: "می‌آیند / می‌آیید" },
    arbeiten: {
      form: "arbeiten",
      stem: "arbeit",
      suffix: "en",
      farsi: "کار می‌کنند / کار می‌کنید",
    },
  },
];

export const SEIN_ROWS: SeinRow[] = [
  { person: ["ich"], form: "bin", farsi: "هستم" },
  { person: ["du"], form: "bist", farsi: "هستی" },
  { person: ["er", "sie", "es"], form: "ist", farsi: "است" },
  { person: ["wir"], form: "sind", farsi: "هستیم" },
  { person: ["ihr"], form: "seid", farsi: "هستید" },
  { person: ["sie", "Sie"], form: "sind", farsi: "هستند / هستید" },
];
