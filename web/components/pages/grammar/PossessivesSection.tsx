"use client";

import GrammarEx from "@/components/pages/grammar/GrammarEx";
import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import {
  GenderTableColGroup,
  GenderTableHead,
  Callout,
  Lead,
  grammarExampleListSpeakClass,
  grammarLessonColCaseClass,
  grammarLessonTableClass,
  grammarTableWrapClass,
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
    <div className="rounded-md border border-grm-panel-border-row bg-daf-panel-soft p-[0.28rem_0.38rem]">
      <div className="flex flex-wrap items-center gap-[0.2rem]">
        <span className="text-[0.8rem] leading-tight font-extrabold text-grm-slate-body">
          {german}
        </span>
        {hint ? (
          <span className="rounded-full bg-grm-panel-row px-[0.28rem] py-px text-[0.56rem] font-bold tracking-wide text-grm-slate-label uppercase">
            {hint}
          </span>
        ) : null}
        <GrammarSpeakButton german={german} />
      </div>
      <p className="mt-[0.1rem] mb-0 text-[0.64rem] leading-snug text-grm-slate-muted">
        <span>{english}</span>
      </p>
    </div>
  );
}

function PossessiveFormCell({ stem, suffix }: PossessiveForm) {
  return (
    <td className="p-[0.45rem_0.4rem] text-center align-middle even:bg-grm-panel">
      <span className="font-semibold whitespace-nowrap italic">
        <span className="text-grm-slate-body">{stem}</span>
        {suffix ? (
          <span className="font-extrabold text-grm-panel-gold">{suffix}</span>
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
        className="mt-[0.45rem] mb-[0.7rem] rounded-lg border border-grm-panel-border bg-white p-[0.5rem_0.6rem] shadow-grammar-card"
        aria-labelledby="grammar-poss-stems-title"
      >
        <header className="mb-[0.4rem]">
          <h3
            id="grammar-poss-stems-title"
            className="m-0 text-[0.82rem] font-extrabold text-daf-head"
          >
            Eight stems
          </h3>
        </header>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-[0.28rem]">
          {POSSESSIVE_STEMS.map((stem) => (
            <PossessiveStemCard
              key={`${stem.german}-${stem.english}`}
              {...stem}
            />
          ))}
        </div>
      </section>

      <p className="my-[0.35rem] mb-[0.45rem] text-[0.82rem] font-semibold text-grm-slate-body">
        Paradigm: <em className="font-extrabold text-daf-head">mein</em>{" "}
        <span className="text-[0.76rem] font-normal italic text-daf-gray-en">
          (my)
        </span>
      </p>

      <div className={grammarTableWrapClass}>
        <table className={grammarLessonTableClass}>
          <GenderTableColGroup />
          <thead>
            <GenderTableHead />
          </thead>
          <tbody>
            {MEIN_ROWS.map((row) => (
              <tr key={row.case} className="even:[&_th]:bg-grm-panel">
                <th
                  scope="row"
                  className={`${grammarLessonColCaseClass} even:bg-grm-panel!`}
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

      <ul className={grammarExampleListSpeakClass}>
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
