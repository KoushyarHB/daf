"use client";

import {
  REGULAR_CONJUGATION_ROWS,
  SEIN_ROWS,
  type ConjugatedForm,
} from "@/lib/grammar/present-tense";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Callout, Lead } from "@/components/pages/grammar/grammar-ui";

function RegularConjForm({ stem, suffix, form, farsi }: ConjugatedForm) {
  return (
    <span className="grammar-conj-form">
      <span className="grammar-conj-form__word">
        <span className="grammar-conj-form__stem">{stem}</span>
        <span className="grammar-conj-form__suffix">{suffix}</span>
        <span className="grammar-conj-form__farsi" dir="rtl" lang="fa">
          ({farsi})
        </span>
      </span>
      <GrammarSpeakButton german={form} speakText={form} />
    </span>
  );
}

function SeinConjForm({ form, farsi }: { form: string; farsi: string }) {
  return (
    <span className="grammar-conj-form">
      <span className="grammar-conj-form__word">
        <span className="grammar-conj-form__stem">{form}</span>
        <span className="grammar-conj-form__farsi" dir="rtl" lang="fa">
          ({farsi})
        </span>
      </span>
      <GrammarSpeakButton german={form} speakText={form} />
    </span>
  );
}

export default function PresentTenseSection() {
  return (
    <>
      <Lead>
        <strong>Regelmäßige Verben im Präsens</strong> — drop{" "}
        <em>-en</em> from the infinitive to get the stem, then add endings.{" "}
        <em>kommen</em> → <em>komm-</em>.
      </Lead>

      <div className="grammar-present-grid">
        <div className="grammar-present-panel grammar-present-panel--regular">
          <header className="grammar-present-panel__head">
            <h3 className="grammar-present-panel__title">Regular verbs</h3>
            <p className="grammar-present-panel__subtitle">
              <em>kommen</em> · <em>arbeiten</em>
            </p>
          </header>
          <div className="grammar-table-wrap grammar-table-wrap--conj">
            <table className="grammar-conj-table">
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Ending</th>
                  <th scope="col">
                    <em>kommen</em>
                  </th>
                  <th scope="col">
                    <em>arbeiten</em>
                  </th>
                </tr>
              </thead>
              <tbody>
                {REGULAR_CONJUGATION_ROWS.map((row) => (
                  <tr key={row.person}>
                    <th scope="row" className="grammar-conj-table__person">
                      {row.person}
                    </th>
                    <td className="grammar-conj-table__ending">
                      <span className="grammar-ending-chip">{row.ending}</span>
                    </td>
                    <td>
                      <RegularConjForm {...row.kommen} />
                    </td>
                    <td>
                      <RegularConjForm {...row.arbeiten} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grammar-present-panel grammar-present-panel--sein">
          <header className="grammar-present-panel__head">
            <h3 className="grammar-present-panel__title">sein</h3>
            <p className="grammar-present-panel__subtitle">to be — irregular</p>
          </header>
          <div className="grammar-table-wrap grammar-table-wrap--conj">
            <table className="grammar-conj-table grammar-conj-table--sein">
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Form</th>
                </tr>
              </thead>
              <tbody>
                {SEIN_ROWS.map((row) => (
                  <tr key={row.person}>
                    <th scope="row" className="grammar-conj-table__person">
                      {row.person}
                    </th>
                    <td>
                      <SeinConjForm form={row.form} farsi={row.farsi} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Callout variant="tip" title="Verbs ending in -t, -d, -m, -n">
        If the stem ends in <strong>-t</strong> or <strong>-d</strong>, add an
        extra <strong>e</strong> before <strong>-st</strong> and{" "}
        <strong>-t</strong> so you can pronounce them:{" "}
        <em>arbeitest</em>, <em>arbeitet</em> (not <s>arbeitst</s>). Same idea
        for stems like <em>atmen</em> → <em>atmest</em>, <em>atmet</em>.
      </Callout>
    </>
  );
}
