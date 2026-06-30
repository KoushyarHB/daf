"use client";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import {
  grammarExampleClass,
  grammarExampleDeClass,
  grammarExampleEnClass,
  grammarExampleMarkerClass,
} from "@/components/pages/grammar/grammar-ui";
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
    <li className={`${grammarExampleClass} items-center`}>
      <span className={grammarExampleMarkerClass} aria-hidden="true">
        ›
      </span>
      <span className="min-w-0 flex-1">
        <span className={grammarExampleDeClass}>{de}</span>
        {en ? <span className={grammarExampleEnClass}>({en})</span> : null}
      </span>
      <GrammarSpeakButton
        german={de}
        speakText={speakText ?? defaultSpeakText(de)}
      />
    </li>
  );
}
