"use client";

import {
  GENDER_PATTERN_GROUPS,
  GENDER_STARTER_EXAMPLES,
} from "@/lib/grammar/gender-patterns";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Callout, GenderChip } from "@/components/pages/grammar/grammar-ui";

function GenderWord({
  german,
  english,
}: {
  german: string;
  english: string;
}) {
  return (
    <span className="grammar-gender-word">
      <span className="grammar-gender-word__de">{german}</span>
      <span className="grammar-gender-word__en">({english})</span>
      <GrammarSpeakButton german={german} />
    </span>
  );
}

export default function GenderPatternsSection() {
  return (
    <>
      <div className="grammar-gender-chip-row">
        <GenderChip article="der" label="Maskulinum" gender="m" />
        <GenderChip article="das" label="Neutrum" gender="n" />
        <GenderChip article="die" label="Femininum" gender="f" />
        <GenderChip article="die" label="Plural (all genders)" gender="pl" />
      </div>

      <div className="grammar-starter-examples">
        {GENDER_STARTER_EXAMPLES.map((ex) => (
          <GenderWord key={ex.german} german={ex.german} english={ex.english} />
        ))}
      </div>

      <div className="grammar-gender-stack">
        {GENDER_PATTERN_GROUPS.map((group) => (
          <section
            key={group.gender}
            className={`grammar-gender-panel grammar-gender-panel--${group.gender}`}
          >
            <header className="grammar-gender-panel__head">
              <h3 className="grammar-gender-panel__title">{group.title}</h3>
              <span className="grammar-gender-panel__article">{group.subtitle}</span>
            </header>

            <ul className="grammar-gender-panel__rules">
              {group.rules.map((rule) => (
                <li key={rule.id} className="grammar-gender-rule">
                  <div className="grammar-gender-rule__row">
                    <span
                      className="grammar-gender-rule__label"
                      title={rule.hint}
                    >
                      {rule.label}
                      <span className="grammar-gender-rule__accuracy">
                        {rule.accuracy}
                      </span>
                    </span>
                    <div className="grammar-gender-rule__examples">
                    {rule.examples.map((ex) => (
                      <GenderWord
                        key={ex.german}
                        german={ex.german}
                        english={ex.english}
                      />
                    ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Callout variant="remember" title="Side note">
        Percentages are rough guides — always exceptions. Below ~80%, treat as a
        hint only. Learn each noun <strong>with its article</strong>.
      </Callout>
    </>
  );
}
