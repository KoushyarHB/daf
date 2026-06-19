"use client";

import GrammarEx from "@/components/pages/grammar/GrammarEx";
import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Callout, Lead } from "@/components/pages/grammar/grammar-ui";
import {
  AUS_ADJECTIVE_EXAMPLE,
  AUS_NO_ARTICLE_PHRASES,
  AUS_SENTENCE_EXAMPLES,
  AUS_WITH_ARTICLE_ROWS,
  type AusExample,
} from "@/lib/grammar/aus-countries";

function AusPhraseChip({ german, english }: AusExample) {
  return (
    <span className="grammar-aus-chip">
      <span className="grammar-aus-chip__de">{german}</span>
      <span className="grammar-aus-chip__en">({english})</span>
      <GrammarSpeakButton german={german} />
    </span>
  );
}

export default function AusCountriesSection() {
  return (
    <>
      <Lead>
        <strong>aus</strong> is a dative preposition — <em>no exceptions</em>. Use
        it for where someone or something comes <em>from</em> (answer to{" "}
        <strong>Woher?</strong>).
      </Lead>

      <div className="grammar-aus-formula" aria-label="Pattern: aus + Dative">
        <span className="grammar-aus-formula__prep">aus</span>
        <span className="grammar-aus-formula__plus">+</span>
        <span className="grammar-aus-formula__case">Dativ</span>
        <span className="grammar-aus-formula__en">from · origin</span>
      </div>

      <div className="grammar-aus-stack">
        <section className="grammar-aus-panel grammar-aus-panel--simple">
          <header className="grammar-aus-panel__head">
            <h3 className="grammar-aus-panel__title">No article</h3>
            <p className="grammar-aus-panel__subtitle">
              Most countries, cities, and continents — neuter, no <em>der/die/das</em>
            </p>
          </header>
          <div className="grammar-aus-chip-grid">
            {AUS_NO_ARTICLE_PHRASES.map((phrase) => (
              <AusPhraseChip key={phrase.german} {...phrase} />
            ))}
          </div>
          <ul className="grammar-example-list grammar-example-list--speak">
            {AUS_SENTENCE_EXAMPLES.map((ex) => (
              <GrammarEx key={ex.german} de={ex.german} en={ex.english} />
            ))}
          </ul>
        </section>

        <section className="grammar-aus-panel grammar-aus-panel--article">
          <header className="grammar-aus-panel__head">
            <h3 className="grammar-aus-panel__title">With an article</h3>
            <p className="grammar-aus-panel__subtitle">
              These countries take <em>dem</em>, <em>der</em>, or <em>den</em> — learn
              them with the article
            </p>
          </header>
          <div className="grammar-table-wrap">
            <table className="grammar-lesson-table grammar-aus-table">
              <thead>
                <tr>
                  <th className="grammar-lesson-col-case">Gender</th>
                  <th>Dative</th>
                  <th>Examples</th>
                </tr>
              </thead>
              <tbody>
                {AUS_WITH_ARTICLE_ROWS.map((row) => (
                  <tr key={row.id}>
                    <th
                      scope="row"
                      className={`grammar-aus-table__gender grammar-aus-table__gender--${row.id}`}
                    >
                      {row.gender}
                    </th>
                    <td
                      className={`grammar-aus-table__dative ${row.genderClass}`}
                    >
                      {row.dative}
                    </td>
                    <td className="grammar-aus-table__examples">
                      <div className="grammar-aus-chip-grid grammar-aus-chip-grid--inline">
                        {row.examples.map((ex) => (
                          <AusPhraseChip key={ex.german} {...ex} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Callout variant="tip" title="Adjective in the middle?">
        <p className="grammar-aus-callout-ex">
          If you describe the country, the article appears:{" "}
          <span className="grammar-aus-inline-ex">
            <em>{AUS_ADJECTIVE_EXAMPLE.german}</em>
            <span className="grammar-aus-chip__en">
              ({AUS_ADJECTIVE_EXAMPLE.english})
            </span>
            <GrammarSpeakButton german={AUS_ADJECTIVE_EXAMPLE.german} />
          </span>
        </p>
      </Callout>
    </>
  );
}
