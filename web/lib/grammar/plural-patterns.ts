export type PluralPatternExample = {
  singular: string;
  singularEn: string;
  plural: string;
};

export type PluralPatternRule = {
  id: string;
  label: string;
  accuracy: string;
  hint: string;
  examples: PluralPatternExample[];
};

/** Plural patterns by what changes on the stem — not split by gender. */
export const PLURAL_PATTERN_RULES: PluralPatternRule[] = [
  {
    id: "n-en",
    label: "+ -n / -en",
    accuracy: "~40%",
    hint: "Most common overall. Typical for die (−ung, −heit, −schaft, −tion …) and die in −e; also weak masc. (n-declension).",
    examples: [
      {
        singular: "die Blume",
        singularEn: "the flower",
        plural: "die Blumen",
      },
      {
        singular: "die Frau",
        singularEn: "the woman",
        plural: "die Frauen",
      },
      {
        singular: "die Universität",
        singularEn: "the university",
        plural: "die Universitäten",
      },
      {
        singular: "der Nachbar",
        singularEn: "the neighbour",
        plural: "die Nachbarn",
      },
    ],
  },
  {
    id: "e",
    label: "+ -e",
    accuracy: "~20%",
    hint: "Frequent with der (often one syllable) and some das.",
    examples: [
      {
        singular: "der Tisch",
        singularEn: "the table",
        plural: "die Tische",
      },
      {
        singular: "der Kurs",
        singularEn: "the course",
        plural: "die Kurse",
      },
      {
        singular: "das Jahr",
        singularEn: "the year",
        plural: "die Jahre",
      },
    ],
  },
  {
    id: "er",
    label: "+ -er (± umlaut)",
    accuracy: "~15%",
    hint: "Mostly das; short stems often take umlaut (Buch → Bücher).",
    examples: [
      {
        singular: "das Kind",
        singularEn: "the child",
        plural: "die Kinder",
      },
      {
        singular: "das Ei",
        singularEn: "the egg",
        plural: "die Eier",
      },
      {
        singular: "das Buch",
        singularEn: "the book",
        plural: "die Bücher",
      },
      {
        singular: "das Haus",
        singularEn: "the house",
        plural: "die Häuser",
      },
    ],
  },
  {
    id: "none",
    label: "no change",
    accuracy: "~15%",
    hint: "Same word form — only the article becomes die. Jobs in −er, many loanwords, −chen / −lein.",
    examples: [
      {
        singular: "der Lehrer",
        singularEn: "the teacher",
        plural: "die Lehrer",
      },
      {
        singular: "der Computer",
        singularEn: "the computer",
        plural: "die Computer",
      },
      {
        singular: "das Fenster",
        singularEn: "the window",
        plural: "die Fenster",
      },
      {
        singular: "das Mädchen",
        singularEn: "the girl",
        plural: "die Mädchen",
      },
    ],
  },
  {
    id: "nen",
    label: "+ -nen",
    accuracy: "~5%",
    hint: "Female nouns in −in.",
    examples: [
      {
        singular: "die Studentin",
        singularEn: "the student (female)",
        plural: "die Studentinnen",
      },
      {
        singular: "die Lehrerin",
        singularEn: "the teacher (female)",
        plural: "die Lehrerinnen",
      },
    ],
  },
  {
    id: "e-umlaut",
    label: "-e + umlaut",
    accuracy: "~5%",
    hint: "Adds −e and changes the stem vowel — often feminine monosyllables.",
    examples: [
      {
        singular: "die Stadt",
        singularEn: "the city",
        plural: "die Städte",
      },
      {
        singular: "die Hand",
        singularEn: "the hand",
        plural: "die Hände",
      },
    ],
  },
  {
    id: "umlaut-only",
    label: "umlaut only",
    accuracy: "~3%",
    hint: "Vowel change, no extra ending — scattered across der and die.",
    examples: [
      {
        singular: "der Vogel",
        singularEn: "the bird",
        plural: "die Vögel",
      },
      {
        singular: "der Apfel",
        singularEn: "the apple",
        plural: "die Äpfel",
      },
      {
        singular: "die Mutter",
        singularEn: "the mother",
        plural: "die Mütter",
      },
      {
        singular: "die Tochter",
        singularEn: "the daughter",
        plural: "die Töchter",
      },
    ],
  },
  {
    id: "s",
    label: "+ -s",
    accuracy: "~5%",
    hint: "Loanwords and informal forms — any gender.",
    examples: [
      {
        singular: "das Auto",
        singularEn: "the car",
        plural: "die Autos",
      },
      {
        singular: "der Park",
        singularEn: "the park",
        plural: "die Parks",
      },
      {
        singular: "die Party",
        singularEn: "the party",
        plural: "die Partys",
      },
    ],
  },
];
