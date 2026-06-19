"use client";

import GrammarEx from "@/components/pages/grammar/GrammarEx";
import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Callout, Lead } from "@/components/pages/grammar/grammar-ui";
import {
  FROM_TO_PAIRS,
  IN_AKKUSATIV_ROWS,
  IN_SENTENCES,
  NACH_PHRASES,
  NACH_SENTENCES,
  type TravelExample,
} from "@/lib/grammar/travel-countries";

function TravelPhraseChip({ german, english }: TravelExample) {
  return (
    <span className="grammar-travel-chip">
      <span className="grammar-travel-chip__de">{german}</span>
      <span className="grammar-travel-chip__en">({english})</span>
      <GrammarSpeakButton german={german} />
    </span>
  );
}

export default function TravelCountriesSection() {
  return (
    <>
      <Lead>
        Section 8 was <strong>from</strong> a place (<em>aus</em> + Dativ,{" "}
        <strong>Woher?</strong>). Here: <strong>to</strong> a place — answer to{" "}
        <strong>Wohin?</strong> Use <strong>nach</strong> or{" "}
        <strong>in + Akkusativ</strong>, depending on the country.
      </Lead>

      <div className="grammar-travel-compare" aria-label="From vs to">
        <div className="grammar-travel-compare__head">
          <span className="grammar-travel-compare__col">From (§8)</span>
          <span className="grammar-travel-compare__col">To (here)</span>
        </div>
        <ul className="grammar-travel-compare__list">
          {FROM_TO_PAIRS.map((pair) => (
            <li key={pair.from.german} className="grammar-travel-compare__row">
              <TravelPhraseChip {...pair.from} />
              <span className="grammar-travel-compare__arrow" aria-hidden="true">
                →
              </span>
              <TravelPhraseChip {...pair.to} />
            </li>
          ))}
        </ul>
      </div>

      <div className="grammar-travel-stack">
        <section className="grammar-travel-panel grammar-travel-panel--nach">
          <header className="grammar-travel-panel__head">
            <h3 className="grammar-travel-panel__title">
              <em>nach</em> — no article
            </h3>
            <p className="grammar-travel-panel__subtitle">
              Same countries as <em>aus Deutschland</em>: no <em>der/die/das</em>{" "}
              — just <em>nach</em> + name. Cities and continents too.
            </p>
          </header>
          <div className="grammar-travel-formula">
            <span className="grammar-travel-formula__prep">nach</span>
            <span className="grammar-travel-formula__rest">+ place name</span>
            <span className="grammar-travel-formula__en">to · destination</span>
          </div>
          <div className="grammar-travel-chip-grid">
            {NACH_PHRASES.map((phrase) => (
              <TravelPhraseChip key={phrase.german} {...phrase} />
            ))}
          </div>
          <ul className="grammar-example-list grammar-example-list--speak">
            {NACH_SENTENCES.map((ex) => (
              <GrammarEx key={ex.german} de={ex.german} en={ex.english} />
            ))}
          </ul>
        </section>

        <section className="grammar-travel-panel grammar-travel-panel--in">
          <header className="grammar-travel-panel__head">
            <h3 className="grammar-travel-panel__title">
              <em>in</em> + Akkusativ — with article
            </h3>
            <p className="grammar-travel-panel__subtitle">
              Same countries as <em>aus der Schweiz</em>: they need an article —
              use <em>in</em> + <strong>Akk.</strong> (movement = accusative).
            </p>
          </header>
          <div className="grammar-travel-formula">
            <span className="grammar-travel-formula__prep">in</span>
            <span className="grammar-travel-formula__plus">+</span>
            <span className="grammar-travel-formula__case">Akk.</span>
            <span className="grammar-travel-formula__en">to · with article</span>
          </div>
          <div className="grammar-table-wrap">
            <table className="grammar-lesson-table grammar-travel-table">
              <thead>
                <tr>
                  <th className="grammar-lesson-col-case">Gender</th>
                  <th>Akk.</th>
                  <th>Examples</th>
                </tr>
              </thead>
              <tbody>
                {IN_AKKUSATIV_ROWS.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="grammar-travel-table__gender">
                      {row.gender}
                    </th>
                    <td
                      className={`grammar-travel-table__case ${row.genderClass}`}
                    >
                      {row.akkusativ}
                    </td>
                    <td className="grammar-travel-table__examples">
                      <div className="grammar-travel-chip-grid grammar-travel-chip-grid--inline">
                        {row.examples.map((ex) => (
                          <TravelPhraseChip key={ex.german} {...ex} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grammar-example-list grammar-example-list--speak">
            {IN_SENTENCES.map((ex) => (
              <GrammarEx key={ex.german} de={ex.german} en={ex.english} />
            ))}
          </ul>
        </section>
      </div>

      <Callout variant="insight" title="One rule to remember">
        <p>
          If the country takes an article with <em>aus</em> (§8), it takes{" "}
          <em>in + Akkusativ</em> when you travel <em>to</em> it. If it has no
          article with <em>aus</em>, use <em>nach</em>.
        </p>
      </Callout>

      <p className="grammar-travel-classroom">
        <em>Wie heißt Ihr Land in Ihrer Sprache?</em>
        <span className="grammar-travel-chip__en">
          (What is your country called in your language?)
        </span>
        <GrammarSpeakButton german="Wie heißt Ihr Land in Ihrer Sprache?" />
      </p>
    </>
  );
}
