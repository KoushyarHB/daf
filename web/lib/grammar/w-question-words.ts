export type WQuestionExample = {
  german: string;
  english: string;
};

export type WQuestionWord = {
  id: string;
  german: string;
  english: string;
  examples: WQuestionExample[];
};

/** Simplest & most common first; wo → woher → wohin as a trio; welche last (declension). */
export const W_QUESTION_WORDS: readonly WQuestionWord[] = [
  {
    id: "was",
    german: "was",
    english: "what",
    examples: [
      { german: "Was machst du?", english: "What are you doing?" },
      { german: "Was ist das?", english: "What is that?" },
      { german: "Was lernst du?", english: "What are you learning?" },
    ],
  },
  {
    id: "wo",
    german: "wo",
    english: "where (location)",
    examples: [
      { german: "Wo wohnst du?", english: "Where do you live?" },
      { german: "Wo ist das Buch?", english: "Where is the book?" },
      { german: "Wo arbeitest du?", english: "Where do you work?" },
    ],
  },
  {
    id: "wer",
    german: "wer",
    english: "who",
    examples: [
      { german: "Wer bist du?", english: "Who are you?" },
      { german: "Wer ist das?", english: "Who is that?" },
      { german: "Wer kommt morgen?", english: "Who is coming tomorrow?" },
    ],
  },
  {
    id: "wann",
    german: "wann",
    english: "when",
    examples: [
      {
        german: "Wann beginnt der Kurs?",
        english: "When does the course start?",
      },
      { german: "Wann kommst du?", english: "When are you coming?" },
      { german: "Wann hast du Zeit?", english: "When do you have time?" },
    ],
  },
  {
    id: "warum",
    german: "warum",
    english: "why",
    examples: [
      {
        german: "Warum lernst du Deutsch?",
        english: "Why are you learning German?",
      },
      { german: "Warum bist du müde?", english: "Why are you tired?" },
    ],
  },
  {
    id: "woher",
    german: "woher",
    english: "from where (origin)",
    examples: [
      { german: "Woher kommst du?", english: "Where do you come from?" },
      { german: "Woher kommt er?", english: "Where does he come from?" },
      { german: "Woher hast du das?", english: "Where did you get that?" },
    ],
  },
  {
    id: "wohin",
    german: "wohin",
    english: "to where (destination)",
    examples: [
      { german: "Wohin gehst du?", english: "Where are you going?" },
      { german: "Wohin fährt sie?", english: "Where is she going?" },
    ],
  },
  {
    id: "welche",
    german: "welche",
    english: "which",
    examples: [
      {
        german: "Welche Sprachen sprechen Sie?",
        english: "Which languages do you speak?",
      },
      {
        german: "Welche Sprache sprichst du?",
        english: "Which language do you speak?",
      },
    ],
  },
];
