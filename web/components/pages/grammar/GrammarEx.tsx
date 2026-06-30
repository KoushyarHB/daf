"use client";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { defaultSpeakText } from "@/utils/defaultSpeakText";

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
