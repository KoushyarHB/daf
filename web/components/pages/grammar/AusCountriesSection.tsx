"use client";

import GrammarEx from "@/components/pages/grammar/GrammarEx";
import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import {
  Callout,
  Lead,
  grammarExampleListSpeakClass,
  grammarLessonColCaseClass,
  grammarLessonTableClass,
} from "@/components/pages/grammar/grammar-ui";
import {
  AUS_ADJECTIVE_EXAMPLE,
  AUS_NO_ARTICLE_PHRASES,
  AUS_SENTENCE_EXAMPLES,
  AUS_WITH_ARTICLE_ROWS,
  type AusExample,
} from "@/lib/grammar/aus-countries";

const GENDER_CELL: Record<string, string> = {
  "grammar-col--der": "bg-grm-der-bg font-extrabold text-grm-der",
  "grammar-col--die": "bg-grm-die-bg font-extrabold text-grm-die",
  "grammar-col--die-pl": "bg-grm-pl-bg font-extrabold text-grm-pl",
};

function AusPhraseChip({ german, english }: AusExample) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-daf-border-table bg-daf-panel-soft px-[0.45rem] py-[0.28rem] text-[0.74rem] leading-snug">
      <span className="font-bold italic text-daf-blue">{german}</span>
      <span className="text-[0.68rem] italic text-daf-gray-en">({english})</span>
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

      <div
        className="my-2 mb-[0.85rem] flex flex-wrap items-center gap-[0.3rem_0.45rem] rounded-[10px] border border-grm-teal-border border-l-[3px] border-l-grm-teal bg-grammar-aus p-[0.55rem_0.75rem]"
        aria-label="Pattern: aus + Dative"
      >
        <span className="text-base font-extrabold italic text-grm-teal">aus</span>
        <span className="text-[0.82rem] font-semibold text-grm-slate-plus">+</span>
        <span className="text-[0.88rem] font-extrabold text-grm-slate-case">Dativ</span>
        <span className="ms-[0.15rem] text-[0.72rem] italic text-grm-slate-meta">
          from · origin
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <section className="overflow-hidden rounded-[10px] border border-grm-panel-border border-t-[3px] border-t-grm-das bg-white shadow-grammar">
          <header className="border-b border-grm-panel-border-row bg-grammar-travel-nach px-3 py-[0.55rem]">
            <h3 className="m-0 text-[0.88rem] font-extrabold text-grm-das">
              No article
            </h3>
            <p className="mt-[0.15rem] mb-0 text-[0.72rem] leading-snug text-grm-slate-muted">
              Most countries, cities, and continents — neuter, no <em>der/die/das</em>
            </p>
          </header>
          <div className="flex flex-wrap gap-[0.35rem] p-[0.55rem_0.75rem] pb-[0.45rem]">
            {AUS_NO_ARTICLE_PHRASES.map((phrase) => (
              <AusPhraseChip key={phrase.german} {...phrase} />
            ))}
          </div>
          <ul className={`${grammarExampleListSpeakClass} m-0 px-3 pb-[0.65rem]`}>
            {AUS_SENTENCE_EXAMPLES.map((ex) => (
              <GrammarEx key={ex.german} de={ex.german} en={ex.english} />
            ))}
          </ul>
        </section>

        <section className="overflow-hidden rounded-[10px] border border-grm-panel-border border-t-[3px] border-t-grm-der bg-white shadow-grammar">
          <header className="border-b border-grm-panel-border-row bg-grammar-travel-in px-3 py-[0.55rem]">
            <h3 className="m-0 text-[0.88rem] font-extrabold text-grm-der">
              With an article
            </h3>
            <p className="mt-[0.15rem] mb-0 text-[0.72rem] leading-snug text-grm-slate-muted">
              These countries take <em>dem</em>, <em>der</em>, or <em>den</em> — learn
              them with the article
            </p>
          </header>
          <div className="overflow-x-auto">
            <table className={`${grammarLessonTableClass} text-[0.8rem] [&_thead_th]:bg-grm-panel-table [&_thead_th]:text-[0.7rem] [&_thead_th]:tracking-wide [&_thead_th]:text-grm-slate-meta [&_thead_th]:uppercase`}>
              <thead>
                <tr>
                  <th className={grammarLessonColCaseClass}>Gender</th>
                  <th>Dative</th>
                  <th>Examples</th>
                </tr>
              </thead>
              <tbody>
                {AUS_WITH_ARTICLE_ROWS.map((row) => (
                  <tr key={row.id}>
                    <th
                      scope="row"
                      className="bg-daf-panel-soft! text-[0.72rem] font-bold lowercase whitespace-nowrap text-grm-slate-muted"
                    >
                      {row.gender}
                    </th>
                    <td
                      className={`w-12 text-center font-extrabold whitespace-nowrap ${GENDER_CELL[row.genderClass] ?? ""}`}
                    >
                      {row.dative}
                    </td>
                    <td className="align-middle">
                      <div className="flex flex-wrap gap-[0.35rem]">
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
        <p className="m-0 leading-normal">
          If you describe the country, the article appears:{" "}
          <span className="mt-[0.15rem] inline-flex flex-wrap items-center gap-1">
            <em className="font-semibold text-daf-blue">{AUS_ADJECTIVE_EXAMPLE.german}</em>
            <span className="text-[0.68rem] italic text-daf-gray-en">
              ({AUS_ADJECTIVE_EXAMPLE.english})
            </span>
            <GrammarSpeakButton german={AUS_ADJECTIVE_EXAMPLE.german} />
          </span>
        </p>
      </Callout>
    </>
  );
}
