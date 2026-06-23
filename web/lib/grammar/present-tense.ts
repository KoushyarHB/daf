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

export type IrregularVerbColumn = {
  id: string;
  infinitive: string;
  english: string;
};

export type IrregularVerbForm = {
  form: string;
  farsi: string;
};

export type IrregularVerbRow = {
  person: readonly string[];
  forms: Record<string, IrregularVerbForm>;
};

export const IRREGULAR_VERB_COLUMNS: readonly IrregularVerbColumn[] = [
  { id: "sein", infinitive: "sein", english: "to be" },
  { id: "heissen", infinitive: "heißen", english: "to be called" },
];

export const IRREGULAR_VERB_ROWS: IrregularVerbRow[] = [
  {
    person: ["ich"],
    forms: {
      sein: { form: "bin", farsi: "هستم" },
      heissen: { form: "heiße", farsi: "نام دارم" },
    },
  },
  {
    person: ["du"],
    forms: {
      sein: { form: "bist", farsi: "هستی" },
      heissen: { form: "heißt", farsi: "نام داری" },
    },
  },
  {
    person: ["er", "sie", "es"],
    forms: {
      sein: { form: "ist", farsi: "است" },
      heissen: { form: "heißt", farsi: "نام دارد" },
    },
  },
  {
    person: ["wir"],
    forms: {
      sein: { form: "sind", farsi: "هستیم" },
      heissen: { form: "heißen", farsi: "نام داریم" },
    },
  },
  {
    person: ["ihr"],
    forms: {
      sein: { form: "seid", farsi: "هستید" },
      heissen: { form: "heißt", farsi: "نام دارید" },
    },
  },
  {
    person: ["sie", "Sie"],
    forms: {
      sein: { form: "sind", farsi: "هستند / هستید" },
      heissen: { form: "heißen", farsi: "نام دارند / دارید" },
    },
  },
];

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
