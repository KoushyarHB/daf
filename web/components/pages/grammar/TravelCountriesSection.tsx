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
  FROM_TO_PAIRS,
  IN_AKKUSATIV_ROWS,
  IN_SENTENCES,
  NACH_PHRASES,
  NACH_SENTENCES,
  type TravelExample,
} from "@/lib/grammar/travel-countries";

const GENDER_CELL: Record<string, string> = {
  "grammar-col--der": "bg-grm-der-bg font-extrabold text-grm-der",
  "grammar-col--die": "bg-grm-die-bg font-extrabold text-grm-die",
  "grammar-col--die-pl": "bg-grm-pl-bg font-extrabold text-grm-pl",
};

function TravelPhraseChip({ german, english }: TravelExample) {
  return (
    <span className="inline-flex w-full flex-wrap items-center justify-start gap-1 rounded-lg border border-daf-border-table bg-daf-panel-soft px-[0.45rem] py-[0.28rem] text-[0.74rem] leading-snug max-[32rem]:last:justify-end">
      <span className="font-bold italic text-daf-blue">{german}</span>
      <span className="text-[0.68rem] italic text-daf-gray-en">({english})</span>
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

      <div
        className="my-2 mb-[0.85rem] rounded-[10px] border border-grm-panel-border bg-grm-panel p-[0.55rem_0.65rem]"
        aria-label="From vs to"
      >
        <div className="mb-[0.45rem] grid grid-cols-[1fr_auto_1fr] gap-[0.35rem] text-[0.68rem] font-extrabold tracking-wide text-grm-slate-meta uppercase max-[32rem]:hidden">
          <span className="text-left">From (§8)</span>
          <span aria-hidden="true" />
          <span className="text-right">To (here)</span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-[0.4rem] p-0">
          {FROM_TO_PAIRS.map((pair) => (
            <li
              key={pair.from.german}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-[0.35rem] max-[32rem]:grid-cols-1"
            >
              <TravelPhraseChip {...pair.from} />
              <span
                className="px-[0.15rem] text-[0.82rem] font-bold text-grm-slate-arrow max-[32rem]:hidden"
                aria-hidden="true"
              >
                →
              </span>
              <TravelPhraseChip {...pair.to} />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <section className="overflow-hidden rounded-[10px] border border-grm-panel-border border-t-[3px] border-t-grm-das bg-white shadow-grammar">
          <header className="border-b border-grm-panel-border-row bg-grammar-travel-nach px-3 py-[0.55rem]">
            <h3 className="m-0 text-[0.88rem] font-extrabold text-grm-das">
              <em>nach</em> — no article
            </h3>
            <p className="mt-[0.15rem] mb-0 text-[0.72rem] leading-snug text-grm-slate-muted">
              Same countries as <em>aus Deutschland</em>: no <em>der/die/das</em>{" "}
              — just <em>nach</em> + name. Cities and continents too.
            </p>
          </header>
          <div className="mx-3 my-[0.55rem] mb-[0.45rem] flex flex-wrap items-center gap-[0.3rem_0.45rem] rounded-lg border border-grm-panel-border-row border-l-[3px] border-l-grm-das bg-daf-panel-soft p-[0.45rem_0.6rem]">
            <span className="text-[0.95rem] font-extrabold italic text-grm-das">nach</span>
            <span className="text-[0.72rem] italic text-grm-slate-meta">+ place name</span>
            <span className="text-[0.72rem] italic text-grm-slate-meta">to · destination</span>
          </div>
          <div className="flex flex-wrap gap-[0.35rem] px-3 pb-[0.45rem]">
            {NACH_PHRASES.map((phrase) => (
              <TravelPhraseChip key={phrase.german} {...phrase} />
            ))}
          </div>
          <ul className={`${grammarExampleListSpeakClass} m-0 px-3 pb-[0.65rem]`}>
            {NACH_SENTENCES.map((ex) => (
              <GrammarEx key={ex.german} de={ex.german} en={ex.english} />
            ))}
          </ul>
        </section>

        <section className="overflow-hidden rounded-[10px] border border-grm-panel-border border-t-[3px] border-t-grm-der bg-white shadow-grammar">
          <header className="border-b border-grm-panel-border-row bg-grammar-travel-in px-3 py-[0.55rem]">
            <h3 className="m-0 text-[0.88rem] font-extrabold text-grm-der">
              <em>in</em> + Akkusativ — with article
            </h3>
            <p className="mt-[0.15rem] mb-0 text-[0.72rem] leading-snug text-grm-slate-muted">
              Same countries as <em>aus der Schweiz</em>: they need an article —
              use <em>in</em> + <strong>Akk.</strong> (movement = accusative).
            </p>
          </header>
          <div className="mx-3 my-[0.55rem] mb-[0.45rem] flex flex-wrap items-center gap-[0.3rem_0.45rem] rounded-lg border border-grm-panel-border-row border-l-[3px] border-l-grm-der bg-daf-panel-soft p-[0.45rem_0.6rem]">
            <span className="text-[0.95rem] font-extrabold italic text-grm-der">in</span>
            <span className="text-[0.8rem] font-semibold text-grm-slate-plus">+</span>
            <span className="text-[0.86rem] font-extrabold text-grm-slate-case">Akk.</span>
            <span className="text-[0.72rem] italic text-grm-slate-meta">to · with article</span>
          </div>
          <div className="mb-[0.45rem] overflow-x-auto">
            <table className={`${grammarLessonTableClass} text-[0.8rem] [&_thead_th]:bg-grm-panel-table [&_thead_th]:text-[0.7rem] [&_thead_th]:tracking-wide [&_thead_th]:text-grm-slate-meta [&_thead_th]:uppercase`}>
              <thead>
                <tr>
                  <th className={grammarLessonColCaseClass}>Gender</th>
                  <th>Akk.</th>
                  <th>Examples</th>
                </tr>
              </thead>
              <tbody>
                {IN_AKKUSATIV_ROWS.map((row) => (
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
                      {row.akkusativ}
                    </td>
                    <td className="align-middle">
                      <div className="flex flex-wrap gap-[0.35rem]">
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
          <ul className={`${grammarExampleListSpeakClass} m-0 px-3 pb-[0.65rem]`}>
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

      <p className="mt-3 mb-0 flex flex-wrap items-center gap-[0.3rem_0.45rem] rounded-lg border border-grm-panel-border-row bg-daf-panel-soft p-[0.5rem_0.65rem] text-[0.8rem] text-grm-slate-body italic">
        <em className="font-semibold text-daf-blue not-italic">
          Wie heißt Ihr Land in Ihrer Sprache?
        </em>
        <span className="text-[0.68rem] text-daf-gray-en">
          (What is your country called in your language?)
        </span>
        <GrammarSpeakButton german="Wie heißt Ihr Land in Ihrer Sprache?" />
      </p>
    </>
  );
}
