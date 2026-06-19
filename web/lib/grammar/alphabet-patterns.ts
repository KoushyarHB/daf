import { audioSrcForLetter, speakTextForLetter } from "@/lib/grammar/alphabet-speak";

export type AlphabetLetter = {
  id: string;
  display: string;
  ipa?: string;
  farsi?: string;
  speakText: string;
  audioSrc: string;
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

function letter(
  id: string,
  display: string,
  extra?: Omit<AlphabetLetter, "id" | "display" | "speakText" | "audioSrc">,
): AlphabetLetter {
  return {
    id,
    display,
    speakText: speakTextForLetter(id),
    audioSrc: audioSrcForLetter(id),
    ...extra,
  };
}

/** Three columns — wider rows for IPA + Farsi + audio. */
export const ALPHABET_COLUMNS: AlphabetLetter[][] = [
  [
    letter("a", "Aa", { ipa: "[a:]" }),
    letter("b", "Bb", { farsi: "بِ" }),
    letter("c", "Cc", { ipa: "[tse:]" }),
    letter("d", "Dd", { farsi: "دِ" }),
    letter("e", "Ee", { ipa: "[e:]", farsi: "ای" }),
    letter("f", "Ff", { farsi: "اِف" }),
    letter("g", "Gg", { farsi: "گِ" }),
    letter("h", "Hh", { farsi: "ها" }),
    letter("i", "Ii", { ipa: "[i:]", farsi: "ای" }),
    letter("j", "Jj", { ipa: "[jɔt]", farsi: "یوت" }),
  ],
  [
    letter("k", "Kk", { farsi: "کا" }),
    letter("l", "Ll", { farsi: "اِل" }),
    letter("m", "Mm", { farsi: "اِم" }),
    letter("n", "Nn", { farsi: "اِن" }),
    letter("o", "Oo", { farsi: "اُ" }),
    letter("p", "Pp", { farsi: "پِ" }),
    letter("q", "Qq", { farsi: "کو" }),
    letter("r", "Rr", { farsi: "اِر" }),
    letter("s", "Ss", { farsi: "اِس" }),
    letter("t", "Tt", { farsi: "تِ" }),
  ],
  [
    letter("u", "Uu", { farsi: "او" }),
    letter("v", "Vv", { ipa: "[faʊ]", farsi: "فاو" }),
    letter("w", "Ww", { ipa: "[ve:]", farsi: "وِ" }),
    letter("x", "Xx", { farsi: "اِیکس" }),
    letter("y", "Yy", { farsi: "اوپسیلون" }),
    letter("z", "Zz", { ipa: "[tsɛt]" }),
    letter("eszett", "ß", { ipa: "[ɛstsɛt]", note: "scharfes S" }),
    letter("ae", "Ää", { ipa: "[ɛ:]", farsi: "اِ" }),
    letter("oe", "Öö", { ipa: "[ø:]", farsi: "اُ" }),
    letter("ue", "Üü", { ipa: "[y:]", farsi: "او" }),
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
