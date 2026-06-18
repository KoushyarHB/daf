"use client";

import {
  ALPHABET_COLUMNS,
  ALPHABET_LEGEND,
  CH_AND_MORE_RULES,
  LETTER_COMBINATION_RULES,
  type AlphabetLetter,
  type PronunciationRule,
} from "@/lib/grammar/alphabet-patterns";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Lead } from "@/components/pages/grammar/grammar-ui";

function AlphabetLetterRow({ letter }: { letter: AlphabetLetter }) {
  return (
    <div className="grammar-alphabet-letter">
      <span className="grammar-alphabet-letter__glyph">{letter.display}</span>
      <span className="grammar-alphabet-letter__meta">
        {letter.ipa ? (
          <span className="grammar-alphabet-letter__ipa">{letter.ipa}</span>
        ) : null}
        {letter.note ? (
          <span className="grammar-alphabet-letter__note">({letter.note})</span>
        ) : null}
        {letter.farsi ? (
          <span className="grammar-farsi" dir="rtl" lang="fa">
            {letter.farsi}
          </span>
        ) : null}
      </span>
      <GrammarSpeakButton
        german={letter.display}
        speakText={letter.speakText}
      />
    </div>
  );
}

function PronunciationRuleRow({ rule }: { rule: PronunciationRule }) {
  return (
    <div className="grammar-alphabet-rule">
      <div className="grammar-alphabet-rule__head">
        <span className="grammar-alphabet-rule__label">{rule.label}</span>
        <span className="grammar-alphabet-rule__guide">
          {rule.ipa ? (
            <span className="grammar-alphabet-rule__ipa">{rule.ipa}</span>
          ) : null}
          {rule.english ? (
            <span className="grammar-alphabet-rule__en">{rule.english}</span>
          ) : null}
          <span className="grammar-farsi" dir="rtl" lang="fa">
            {rule.farsi}
          </span>
        </span>
      </div>
      <div className="grammar-alphabet-rule__examples">
        {rule.examples.map((ex) => (
          <span key={ex.german} className="grammar-gender-word">
            <span className="grammar-gender-word__de">{ex.german}</span>
            <span className="grammar-gender-word__en">({ex.english})</span>
            <GrammarSpeakButton
              german={ex.german}
              speakText={ex.speakText}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AlphabetPronunciationSection() {
  return (
    <>
      <Lead>
        German uses the Latin alphabet plus <strong>ä</strong>, <strong>ö</strong>,{" "}
        <strong>ü</strong>, and <strong>ß</strong>. Layout and Farsi notes follow
        your notebook — tap ▶ to hear each letter name or example.
      </Lead>

      <div className="grammar-alphabet-layout">
        <aside className="grammar-alphabet-legend" aria-label="Alphabet legend">
          <p className="grammar-alphabet-legend__title">Alphabet</p>
          <ul className="grammar-alphabet-legend__list">
            {ALPHABET_LEGEND.map((item) => (
              <li key={item.de}>
                <strong>{item.de}</strong>
                <span>{item.note}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="grammar-alphabet-notebook">
          <div className="grammar-alphabet-grid">
            {ALPHABET_COLUMNS.map((column, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className="grammar-alphabet-col"
                aria-label={`Column ${colIndex + 1}`}
              >
                {column.map((letter) => (
                  <AlphabetLetterRow key={letter.id} letter={letter} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="grammar-section__subtitle">Letter combinations</h3>
      <div className="grammar-alphabet-rules">
        {LETTER_COMBINATION_RULES.map((rule) => (
          <PronunciationRuleRow key={rule.id} rule={rule} />
        ))}
      </div>

      <h3 className="grammar-section__subtitle">
        The “ch” sounds &amp; more
      </h3>
      <div className="grammar-alphabet-rules">
        {CH_AND_MORE_RULES.map((rule) => (
          <PronunciationRuleRow key={rule.id} rule={rule} />
        ))}
      </div>
    </>
  );
}
