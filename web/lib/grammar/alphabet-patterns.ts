export type AlphabetLetter = {
  id: string;
  display: string;
  ipa?: string;
  farsi?: string;
  speakText: string;
  note?: string;
};

export type PronunciationExample = {
  german: string;
  english: string;
  speakText?: string;
};

export type PronunciationRule = {
  id: string;
  label: string;
  ipa?: string;
  english?: string;
  farsi: string;
  examples: PronunciationExample[];
};

/** Three columns — wider rows for IPA + Farsi + audio. */
export const ALPHABET_COLUMNS: AlphabetLetter[][] = [
  [
    { id: "a", display: "Aa", ipa: "[a:]", speakText: "a" },
    { id: "b", display: "Bb", farsi: "بِ", speakText: "be" },
    { id: "c", display: "Cc", ipa: "[tse:]", speakText: "tse" },
    { id: "d", display: "Dd", farsi: "دِ", speakText: "de" },
    { id: "e", display: "Ee", ipa: "[e:]", farsi: "ای", speakText: "e" },
    { id: "f", display: "Ff", farsi: "اِف", speakText: "ef" },
    { id: "g", display: "Gg", farsi: "گِ", speakText: "ge" },
    { id: "h", display: "Hh", farsi: "ها", speakText: "ha" },
    { id: "i", display: "Ii", ipa: "[i:]", farsi: "ای", speakText: "i" },
    { id: "j", display: "Jj", ipa: "[jɔt]", farsi: "یوت", speakText: "jot" },
  ],
  [
    { id: "k", display: "Kk", farsi: "کا", speakText: "ka" },
    { id: "l", display: "Ll", farsi: "اِل", speakText: "el" },
    { id: "m", display: "Mm", farsi: "اِم", speakText: "em" },
    { id: "n", display: "Nn", farsi: "اِن", speakText: "en" },
    { id: "o", display: "Oo", farsi: "اُ", speakText: "o" },
    { id: "p", display: "Pp", farsi: "پِ", speakText: "pe" },
    { id: "q", display: "Qq", farsi: "کو", speakText: "ku" },
    { id: "r", display: "Rr", farsi: "اِر", speakText: "er" },
    { id: "s", display: "Ss", farsi: "اِس", speakText: "es" },
    { id: "t", display: "Tt", farsi: "تِ", speakText: "te" },
  ],
  [
    { id: "u", display: "Uu", farsi: "او", speakText: "u" },
    { id: "v", display: "Vv", ipa: "[faʊ]", farsi: "فاو", speakText: "fau" },
    { id: "w", display: "Ww", ipa: "[ve:]", farsi: "وِ", speakText: "ve" },
    { id: "x", display: "Xx", farsi: "اِیکس", speakText: "iks" },
    { id: "y", display: "Yy", farsi: "اوپسیلون", speakText: "ypsilon" },
    { id: "z", display: "Zz", ipa: "[tsɛt]", speakText: "tset" },
    {
      id: "eszett",
      display: "ß",
      ipa: "[ɛstsɛt]",
      note: "scharfes S",
      speakText: "eszett",
    },
    { id: "ae", display: "Ää", ipa: "[ɛ:]", farsi: "اِ", speakText: "ä" },
    { id: "oe", display: "Öö", ipa: "[ø:]", farsi: "اُ", speakText: "ö" },
    { id: "ue", display: "Üü", ipa: "[y:]", farsi: "او", speakText: "ü" },
  ],
];

export const ALPHABET_LEGEND = [
  { de: "ä", note: "a-Umlaut" },
  { de: "ö", note: "o-Umlaut" },
  { de: "ü", note: "u-Umlaut" },
  { de: "a / A", note: "kleines a · großes A" },
  { de: "ß", note: "scharfes S · Eszett" },
  { de: "tt", note: "zwei t · Doppel-t" },
] as const;

export const LETTER_COMBINATION_RULES: PronunciationRule[] = [
  {
    id: "ei",
    label: "ei",
    ipa: "/aɪ/",
    farsi: "آی",
    examples: [
      { german: "mein", english: "my" },
      { german: "Zeit", english: "time" },
    ],
  },
  {
    id: "ie",
    label: "ie",
    english: "long “ee”",
    farsi: "ای",
    examples: [
      { german: "lieben", english: "to love" },
      { german: "viel", english: "much" },
    ],
  },
  {
    id: "eu",
    label: "eu",
    ipa: "/ɔʏ/",
    farsi: "اوی",
    examples: [{ german: "neu", english: "new" }],
  },
  {
    id: "aeu",
    label: "äu",
    ipa: "/ɔʏ/",
    farsi: "اوی",
    examples: [{ german: "Häuser", english: "houses" }],
  },
  {
    id: "sch",
    label: "sch",
    english: "“sh”",
    farsi: "ش",
    examples: [{ german: "Schule", english: "school" }],
  },
  {
    id: "tsch",
    label: "tsch",
    english: "“ch” as in church",
    farsi: "چ",
    examples: [{ german: "deutsch", english: "German" }],
  },
  {
    id: "sp-st",
    label: "sp / st",
    english: "“shp / sht” at word start",
    farsi: "ش — اول کلمه",
    examples: [
      { german: "sprechen", english: "to speak" },
      { german: "Stadt", english: "city" },
    ],
  },
  {
    id: "er-end",
    label: "-er",
    english: "soft “ah” at the end",
    farsi: "اَ",
    examples: [{ german: "Lehrer", english: "teacher" }],
  },
  {
    id: "ig-end",
    label: "-ig",
    english: "soft “ich” at the end",
    farsi: "ش خفیف",
    examples: [{ german: "wichtig", english: "important" }],
  },
];

export const CH_AND_MORE_RULES: PronunciationRule[] = [
  {
    id: "ch-back",
    label: "a, o, u + ch",
    english: "back “ach”",
    farsi: "خ",
    examples: [
      { german: "Buch", english: "book" },
      { german: "Fach", english: "subject / compartment" },
      { german: "Sprachen", english: "languages" },
    ],
  },
  {
    id: "ch-front",
    label: "other vowel + ch",
    english: "front “ich”",
    farsi: "ش خفیف",
    examples: [
      { german: "ich", english: "I" },
      { german: "mich", english: "me" },
      { german: "sprechen", english: "to speak" },
    ],
  },
  {
    id: "chs",
    label: "chs",
    english: "“ks”",
    farsi: "زِکس",
    examples: [{ german: "sechs", english: "six" }],
  },
  {
    id: "vowel-h",
    label: "vowel + h",
    english: "long vowel, silent h",
    farsi: "حرف صدادار کشیده می‌شود",
    examples: [{ german: "Rahmen", english: "frame" }],
  },
  {
    id: "s-vowel",
    label: "s before a vowel",
    english: "voiced “z”",
    farsi: "ز",
    examples: [
      { german: "Sohn", english: "son" },
      { german: "lesen", english: "to read" },
    ],
  },
  {
    id: "ee",
    label: "ee",
    english: "long “ee”",
    farsi: "ای کشیده",
    examples: [{ german: "Tee", english: "tea" }],
  },
];
