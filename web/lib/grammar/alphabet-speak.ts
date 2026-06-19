export const GERMAN_LETTER_SPEAK: Record<string, string> = {
  a: "a",
  b: "Be",
  c: "Tse",
  d: "De",
  e: "E",
  f: "Ef",
  g: "Ge",
  h: "Ha",
  i: "I",
  j: "Jot",
  k: "Ka",
  l: "El",
  m: "Em",
  n: "En",
  o: "O",
  p: "Pe",
  q: "Ku",
  r: "Er",
  s: "Es",
  t: "Te",
  u: "U",
  v: "Fau",
  w: "We",
  x: "Iks",
  y: "Ypsilon",
  z: "Tset",
  eszett: "Eszett",
  ae: "Ä",
  oe: "Ö",
  ue: "Ü",
};

const ALPHABET_AUDIO_BASE = "/audio/grammar/alphabet";

export function audioSrcForLetter(id: string): string {
  return `${ALPHABET_AUDIO_BASE}/${id}.mp3`;
}

export function speakTextForLetter(id: string): string {
  return GERMAN_LETTER_SPEAK[id] ?? id;
}
