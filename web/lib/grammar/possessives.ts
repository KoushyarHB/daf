export type PossessiveStem = {
  german: string;
  english: string;
  hint?: string;
};

export type PossessiveForm = {
  stem: string;
  suffix: string;
};

export type PossessiveRow = {
  case: string;
  caseTitle: string;
  mask: PossessiveForm;
  neut: PossessiveForm;
  fem: PossessiveForm;
  plural: PossessiveForm;
};

export type PossessiveExample = {
  german: string;
  english: string;
};

const MEIN_STEM = "mein";

function meinForm(suffix: string): PossessiveForm {
  return { stem: MEIN_STEM, suffix };
}

export const POSSESSIVE_STEMS: readonly PossessiveStem[] = [
  { german: "mein", english: "my" },
  { german: "dein", english: "your" },
  { german: "sein", english: "his / its" },
  { german: "ihr", english: "her" },
  { german: "unser", english: "our" },
  { german: "euer", english: "your" },
  { german: "ihr", english: "their" },
  { german: "Ihr", english: "your (Sie)", hint: "formal" },
];

export const MEIN_ROWS: readonly PossessiveRow[] = [
  {
    case: "Nom.",
    caseTitle: "Nominativ",
    mask: meinForm(""),
    neut: meinForm(""),
    fem: meinForm("e"),
    plural: meinForm("e"),
  },
  {
    case: "Akk.",
    caseTitle: "Akkusativ",
    mask: meinForm("en"),
    neut: meinForm(""),
    fem: meinForm("e"),
    plural: meinForm("e"),
  },
  {
    case: "Dat.",
    caseTitle: "Dativ",
    mask: meinForm("em"),
    neut: meinForm("em"),
    fem: meinForm("er"),
    plural: meinForm("en"),
  },
];

export const POSSESSIVE_EXAMPLES: readonly PossessiveExample[] = [
  {
    german: "Mein Vater arbeitet.",
    english: "My father works. (Nom.)",
  },
  {
    german: "Meine Mutter kocht.",
    english: "My mother cooks. (Nom. fem.)",
  },
  {
    german: "Ich sehe meinen Vater.",
    english: "I see my father. (Akk.)",
  },
  {
    german: "Ich spreche mit meinem Vater.",
    english: "I speak with my father. (Dat.)",
  },
];
