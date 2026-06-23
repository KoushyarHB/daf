export type GenderPatternExample = {
  german: string;
  english: string;
};

export type GenderPatternRule = {
  id: string;
  label: string;
  accuracy: string;
  hint?: string;
  examples: GenderPatternExample[];
};

export type GenderPatternGroup = {
  gender: "m" | "n" | "f";
  title: string;
  subtitle: string;
  rules: GenderPatternRule[];
};

export const GENDER_PATTERN_GROUPS: GenderPatternGroup[] = [
  {
    gender: "m",
    title: "Maskulinum",
    subtitle: "der",
    rules: [
      {
        id: "m-jobs-people",
        label: "Jobs & male people",
        accuracy: "~90%",
        examples: [
          { german: "der Mann", english: "the man" },
          { german: "der Arzt", english: "the doctor (male)" },
          { german: "der Lehrer", english: "the teacher (male)" },
          { german: "der Student", english: "the student (male)" },
        ],
      },
      {
        id: "m-time",
        label: "Days, months, seasons",
        accuracy: "~99%",
        examples: [
          { german: "der Montag", english: "Monday" },
          { german: "der Juli", english: "July" },
          { german: "der Winter", english: "winter" },
          { german: "der Sommer", english: "summer" },
        ],
      },
      {
        id: "m-weather-drinks",
        label: "Weather & many alcoholic drinks",
        accuracy: "~85%",
        examples: [
          { german: "der Regen", english: "the rain" },
          { german: "der Wind", english: "the wind" },
          { german: "der Wein", english: "the wine" },
        ],
      },
      {
        id: "m-er",
        label: "-er",
        accuracy: "~75%",
        hint: "Many jobs and agents; not reliable alone.",
        examples: [
          { german: "der Computer", english: "the computer" },
          { german: "der Fahrer", english: "the driver" },
          { german: "der Bäcker", english: "the baker" },
        ],
      },
      {
        id: "m-en",
        label: "-en",
        accuracy: "~65%",
        hint: "Weak hint — always learn with the article.",
        examples: [
          { german: "der Garten", english: "the garden" },
          { german: "der Boden", english: "the ground / floor" },
          { german: "der Norden", english: "the north" },
        ],
      },
      {
        id: "m-el",
        label: "-el",
        accuracy: "~70%",
        examples: [
          { german: "der Apfel", english: "the apple" },
          { german: "der Vogel", english: "the bird" },
          { german: "der Spiegel", english: "the mirror" },
        ],
      },
      {
        id: "m-ling",
        label: "-ling",
        accuracy: "~95%",
        examples: [
          { german: "der Schmetterling", english: "the butterfly" },
          { german: "der Lehrling", english: "the apprentice" },
        ],
      },
      {
        id: "m-ismus",
        label: "-ismus",
        accuracy: "~99%",
        examples: [
          { german: "der Optimismus", english: "optimism" },
          { german: "der Tourismus", english: "tourism" },
        ],
      },
    ],
  },
  {
    gender: "n",
    title: "Neutrum",
    subtitle: "das",
    rules: [
      {
        id: "n-young",
        label: "Young beings",
        accuracy: "~85%",
        examples: [
          { german: "das Kind", english: "the child" },
          { german: "das Baby", english: "the baby" },
        ],
      },
      {
        id: "n-chen-lein",
        label: "-chen / -lein (diminutives)",
        accuracy: "~100%",
        hint: "Always neuter — one of the safest patterns.",
        examples: [
          { german: "das Mädchen", english: "the girl" },
          { german: "das Häuschen", english: "the little house" },
          { german: "das Brötchen", english: "the bread roll" },
        ],
      },
      {
        id: "n-ment",
        label: "-ment",
        accuracy: "~99%",
        examples: [
          { german: "das Instrument", english: "the instrument" },
          { german: "das Dokument", english: "the document" },
          { german: "das Experiment", english: "the experiment" },
        ],
      },
      {
        id: "n-um",
        label: "-um",
        accuracy: "~99%",
        examples: [
          { german: "das Zentrum", english: "the centre" },
          { german: "das Museum", english: "the museum" },
          { german: "das Datum", english: "the date" },
        ],
      },
      {
        id: "n-infinitive-nouns",
        label: "Verbs used as nouns (infinitive)",
        accuracy: "~95%",
        examples: [
          { german: "das Lesen", english: "reading" },
          { german: "das Schwimmen", english: "swimming" },
          { german: "das Lernen", english: "learning" },
        ],
      },
      {
        id: "n-metals-colors",
        label: "Metals & colours as nouns",
        accuracy: "~90%",
        examples: [
          { german: "das Gold", english: "gold" },
          { german: "das Silber", english: "silver" },
          { german: "das Rot", english: "the colour red" },
        ],
      },
      {
        id: "n-tum",
        label: "-tum",
        accuracy: "~95%",
        examples: [
          { german: "das Eigentum", english: "property" },
          { german: "das Christentum", english: "Christianity" },
        ],
      },
    ],
  },
  {
    gender: "f",
    title: "Femininum",
    subtitle: "die",
    rules: [
      {
        id: "f-e",
        label: "-e",
        accuracy: "~90%",
        hint: "Very common — but exceptions exist (der Name, das Ende).",
        examples: [
          { german: "die Blume", english: "the flower" },
          { german: "die Straße", english: "the street" },
          { german: "die Lampe", english: "the lamp" },
          { german: "die Tasse", english: "the cup" },
        ],
      },
      {
        id: "f-ung",
        label: "-ung",
        accuracy: "~99%",
        examples: [
          { german: "die Wohnung", english: "the apartment" },
          { german: "die Zeitung", english: "the newspaper" },
          { german: "die Bedeutung", english: "the meaning" },
        ],
      },
      {
        id: "f-heit-keit",
        label: "-heit / -keit",
        accuracy: "~99%",
        examples: [
          { german: "die Freiheit", english: "freedom" },
          { german: "die Möglichkeit", english: "the possibility" },
          { german: "die Freundlichkeit", english: "friendliness" },
        ],
      },
      {
        id: "f-schaft",
        label: "-schaft",
        accuracy: "~99%",
        examples: [
          { german: "die Freundschaft", english: "friendship" },
          { german: "die Mannschaft", english: "the team" },
          { german: "die Landschaft", english: "the landscape" },
        ],
      },
      {
        id: "f-tion",
        label: "-tion",
        accuracy: "~99%",
        examples: [
          { german: "die Nation", english: "the nation" },
          { german: "die Information", english: "the information" },
          { german: "die Diskussion", english: "the discussion" },
        ],
      },
      {
        id: "f-tat",
        label: "-tät",
        accuracy: "~99%",
        examples: [
          { german: "die Universität", english: "the university" },
          { german: "die Qualität", english: "quality" },
          { german: "die Aktivität", english: "the activity" },
        ],
      },
      {
        id: "f-ik",
        label: "-ik",
        accuracy: "~99%",
        examples: [
          { german: "die Musik", english: "music" },
          { german: "die Politik", english: "politics" },
          { german: "die Mathematik", english: "mathematics" },
        ],
      },
      {
        id: "f-ei-anz-enz",
        label: "-ei, -anz, -enz",
        accuracy: "~95%",
        examples: [
          { german: "die Bäckerei", english: "the bakery" },
          { german: "die Toleranz", english: "tolerance" },
          { german: "die Konferenz", english: "the conference" },
        ],
      },
      {
        id: "f-people-animals",
        label: "Female people & many female animals",
        accuracy: "~85%",
        examples: [
          { german: "die Frau", english: "the woman" },
          { german: "die Studentin", english: "the student (female)" },
          { german: "die Katze", english: "the cat" },
        ],
      },
    ],
  },
];

export const GENDER_STARTER_EXAMPLES: GenderPatternExample[] = [
  { german: "der Tisch", english: "the table" },
  { german: "die Tür", english: "the door" },
  { german: "das Buch", english: "the book" },
  { german: "das Wasser", english: "water" },
];
