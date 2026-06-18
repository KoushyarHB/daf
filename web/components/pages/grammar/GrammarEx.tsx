"use client";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";

function defaultSpeakText(de: string): string {
  return de
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export default function GrammarEx({
  de,
  en,
  speakText,
}: {
  de: string;
  en?: string;
  speakText?: string;
}) {
  return (
    <li className="grammar-example grammar-example--speak">
      <span className="grammar-example__marker" aria-hidden="true">
        ›
      </span>
      <span className="grammar-example__text">
        <span className="grammar-example__de">{de}</span>
        {en ? <span className="grammar-example__en">({en})</span> : null}
      </span>
      <GrammarSpeakButton
        german={de}
        speakText={speakText ?? defaultSpeakText(de)}
      />
    </li>
  );
}
