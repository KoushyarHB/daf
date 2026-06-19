"use client";

import GrammarEx from "@/components/pages/grammar/GrammarEx";
import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import {
  GenderTableColGroup,
  GenderTableHead,
  Callout,
  Lead,
} from "@/components/pages/grammar/grammar-ui";
import {
  MEIN_ROWS,
  POSSESSIVE_EXAMPLES,
  POSSESSIVE_STEMS,
  type PossessiveForm,
} from "@/lib/grammar/possessives";

function PossessiveStemCard({
  german,
  english,
  hint,
}: {
  german: string;
  english: string;
  hint?: string;
}) {
  return (
    <div className="grammar-pronoun-card">
      <div className="grammar-pronoun-card__head">
        <span className="grammar-pronoun-card__de">{german}</span>
        {hint ? (
          <span className="grammar-pronoun-card__hint">{hint}</span>
        ) : null}
        <GrammarSpeakButton german={german} />
      </div>
      <p className="grammar-pronoun-card__gloss">
        <span className="grammar-pronoun-card__en">{english}</span>
      </p>
    </div>
  );
}

function PossessiveFormCell({ stem, suffix }: PossessiveForm) {
  return (
    <td className="grammar-poss-cell">
      <span className="grammar-poss-form">
        <span className="grammar-poss-form__stem">{stem}</span>
        {suffix ? (
          <span className="grammar-poss-form__suffix">{suffix}</span>
        ) : null}
      </span>
    </td>
  );
}

export default function PossessivesSection() {
  return (
    <>
      <Lead>
        Possessives come <strong>before a noun</strong> — <em>mein Vater</em>,{" "}
        <em>deine Schwester</em>. They agree with gender, case, and number.
      </Lead>

      <section
        className="grammar-pronoun-ref grammar-pronoun-ref--poss"
        aria-labelledby="grammar-poss-stems-title"
      >
        <header className="grammar-pronoun-ref__head">
          <h3 id="grammar-poss-stems-title" className="grammar-pronoun-ref__title">
            Eight stems
          </h3>
        </header>
        <div className="grammar-pronoun-ref__grid">
          {POSSESSIVE_STEMS.map((stem) => (
            <PossessiveStemCard
              key={`${stem.german}-${stem.english}`}
              {...stem}
            />
          ))}
        </div>
      </section>

      <p className="grammar-poss-paradigm">
        Paradigm: <em>mein</em>{" "}
        <span className="grammar-poss-paradigm__en">(my)</span>
      </p>

      <div className="grammar-table-wrap">
        <table className="grammar-lesson-table grammar-lesson-table--poss">
          <GenderTableColGroup />
          <thead>
            <GenderTableHead />
          </thead>
          <tbody>
            {MEIN_ROWS.map((row) => (
              <tr key={row.case}>
                <th
                  scope="row"
                  className="grammar-lesson-col-case"
                  title={row.caseTitle}
                >
                  {row.case}
                </th>
                <PossessiveFormCell {...row.mask} />
                <PossessiveFormCell {...row.neut} />
                <PossessiveFormCell {...row.fem} />
                <PossessiveFormCell {...row.plural} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grammar-example-list grammar-example-list--speak">
        {POSSESSIVE_EXAMPLES.map((ex) => (
          <GrammarEx key={ex.german} de={ex.german} en={ex.english} />
        ))}
      </ul>

      <Callout variant="remember" title="Quick memory hook">
        Only <strong>masculine</strong> changes in Akkusativ (<em>mein → meinen</em>
        ). Dativ: <em>meinem / meinem / meiner</em> (masc · neut · fem); plural
        dative <em>meinen</em>.
      </Callout>

      <Callout variant="insight" title="Same pattern as ein / kein">
        The endings on <em>mein, dein, sein …</em> work like{" "}
        <strong>ein</strong> and <strong>kein</strong> — only the stem changes.
      </Callout>
    </>
  );
}
