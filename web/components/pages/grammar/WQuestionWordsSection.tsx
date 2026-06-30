"use client";

import GrammarEx from "@/components/pages/grammar/GrammarEx";
import { Callout, grammarExampleListSpeakClass } from "@/components/pages/grammar/grammar-ui";
import { W_QUESTION_WORDS } from "@/lib/grammar/w-question-words";

const W_CARD_BORDER = [
  "border-l-grm-der",
  "border-l-grm-das",
  "border-l-grm-die",
  "border-l-grm-pl",
] as const;

export default function WQuestionWordsSection() {
  return (
    <>
      <div className="mt-2 flex flex-col gap-[0.7rem]">
        {W_QUESTION_WORDS.map((word, index) => (
          <div
            key={word.id}
            className={`rounded-[10px] border border-daf-border-table border-l-4 bg-white p-[0.8rem_0.9rem] shadow-grammar-card ${W_CARD_BORDER[index % 4]}`}
          >
            <h3 className="m-0 text-[1.05rem] font-extrabold text-daf-head lowercase">
              {word.german}
            </h3>
            <p className="mt-[0.1rem] mb-[0.4rem] text-[0.76rem] italic text-daf-gray-en">
              {word.english}
            </p>
            <ul className={`${grammarExampleListSpeakClass} mt-0 [&_li]:border-0 [&_li]:bg-transparent [&_li]:p-[0.25rem_0]`}>
              {word.examples.map((ex) => (
                <GrammarEx
                  key={ex.german}
                  de={ex.german}
                  en={ex.english}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Callout variant="insight" title="wo · woher · wohin">
        <strong>Wo</strong> asks where something <em>is</em>.{" "}
        <strong>Woher</strong> asks where something <em>comes from</em>.{" "}
        <strong>Wohin</strong> asks where something <em>is going</em>.
      </Callout>
    </>
  );
}
