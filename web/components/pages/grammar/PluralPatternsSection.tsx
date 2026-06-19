"use client";

import { PLURAL_PATTERN_RULES } from "@/lib/grammar/plural-patterns";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Callout, GenderChip } from "@/components/pages/grammar/grammar-ui";

function PluralPair({
  singular,
  singularEn,
  plural,
}: {
  singular: string;
  singularEn: string;
  plural: string;
}) {
  return (
    <span className="grammar-plural-pair">
      <span className="grammar-plural-pair__forms">
        <span className="grammar-plural-pair__sg">{singular}</span>
        <span className="grammar-plural-pair__arrow" aria-hidden="true">
          →
        </span>
        <span className="grammar-plural-pair__pl">{plural}</span>
      </span>
      <span className="grammar-plural-pair__en">({singularEn})</span>
      <span className="grammar-plural-pair__audio">
        <GrammarSpeakButton german={singular} />
        <GrammarSpeakButton german={plural} />
      </span>
    </span>
  );
}

export default function PluralPatternsSection() {
  return (
    <>
      <div className="grammar-gender-chip-row">
        <GenderChip article="die" label="Plural — all genders" gender="pl" />
      </div>

      <section className="grammar-gender-panel grammar-gender-panel--pl grammar-plural-panel">
        <header className="grammar-gender-panel__head">
          <h3 className="grammar-gender-panel__title">How the plural is built</h3>
          <span className="grammar-gender-panel__article">der / das / die → die</span>
        </header>

        <ul className="grammar-gender-panel__rules">
          {PLURAL_PATTERN_RULES.map((rule) => (
            <li key={rule.id} className="grammar-gender-rule">
              <div className="grammar-gender-rule__row grammar-plural-rule__row">
                <span className="grammar-gender-rule__label" title={rule.hint}>
                  {rule.label}
                  <span className="grammar-gender-rule__accuracy">
                    {rule.accuracy}
                  </span>
                </span>
                <div className="grammar-gender-rule__examples">
                  {rule.examples.map((ex) => (
                    <PluralPair
                      key={`${ex.singular}-${ex.plural}`}
                      singular={ex.singular}
                      singularEn={ex.singularEn}
                      plural={ex.plural}
                    />
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Callout variant="remember" title="Side note">
        Classify by <strong>what changes</strong> on the word, not by gender — the
        same ending can appear with der, das, or die. Learn{" "}
        <strong>singular + plural together</strong>; hover a pattern for which
        genders it usually fits.
      </Callout>
    </>
  );
}
