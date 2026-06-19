"use client";

import GrammarEx from "@/components/pages/grammar/GrammarEx";
import { Callout } from "@/components/pages/grammar/grammar-ui";
import { W_QUESTION_WORDS } from "@/lib/grammar/w-question-words";

export default function WQuestionWordsSection() {
  return (
    <>
      <div className="grammar-w-grid">
        {W_QUESTION_WORDS.map((word) => (
          <div key={word.id} className="grammar-w-card">
            <h3>{word.german}</h3>
            <p className="grammar-w-card__en">{word.english}</p>
            <ul className="grammar-example-list grammar-example-list--speak">
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
