"use client";

import {
  IRREGULAR_VERB_COLUMNS,
  IRREGULAR_VERB_ROWS,
  PERSONAL_PRONOUNS,
  REGULAR_CONJUGATION_ROWS,
  type ConjugatedForm,
} from "@/lib/grammar/present-tense";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Callout, Lead } from "@/components/pages/grammar/grammar-ui";

function PronounRefCard({
  german,
  english,
  farsi,
  hint,
}: {
  german: string;
  english: string;
  farsi: string;
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
        <span className="ms-[0.2em] font-normal text-grm-slate-arrow opacity-88" lang="fa">
          (<bdi dir="rtl">{farsi}</bdi>)
        </span>
      </p>
    </div>
  );
}

function PersonCell({ labels }: { labels: readonly string[] }) {
  return (
    <span className="flex flex-col gap-px leading-[1.15]">
      {labels.map((label) => (
        <span key={label} className="block">
          {label}
        </span>
      ))}
    </span>
  );
}

function RegularConjForm({ stem, suffix, form, farsi }: ConjugatedForm) {
  return (
    <span className="flex items-start gap-[0.3rem]">
      <span className="flex min-w-0 flex-col items-start gap-[0.12rem]">
        <span className="whitespace-nowrap">
          <span className="font-semibold italic text-daf-blue">{stem}</span>
          <span className="font-extrabold italic text-grm-panel-gold">{suffix}</span>
        </span>
        <span
          className="font-normal text-[0.68rem] text-grm-slate-arrow not-italic opacity-92"
          dir="rtl"
          lang="fa"
        >
          ({farsi})
        </span>
      </span>
      <GrammarSpeakButton german={form} speakText={form} />
    </span>
  );
}

function IrregularConjForm({ form, farsi }: { form: string; farsi: string }) {
  return (
    <span className="flex items-start gap-[0.3rem]">
      <span className="flex min-w-0 flex-col items-start gap-[0.12rem]">
        <span className="font-semibold italic text-daf-blue">{form}</span>
        <span
          className="font-normal text-[0.68rem] text-grm-slate-arrow not-italic opacity-92"
          dir="rtl"
          lang="fa"
        >
          ({farsi})
        </span>
      </span>
      <GrammarSpeakButton german={form} speakText={form} />
    </span>
  );
}

const CONJ_TABLE =
  "w-full min-w-[17.5rem] border-collapse text-[0.8rem] [&_td]:border-b [&_td]:border-grm-panel-border-row [&_td]:p-2 [&_td]:text-left [&_td]:align-middle [&_th]:border-b [&_th]:border-grm-panel-border-row [&_th]:p-2 [&_th]:text-left [&_th]:align-middle [&_thead_th]:border-b-2 [&_thead_th]:border-grm-panel-border [&_thead_th]:bg-grm-panel-table [&_thead_th]:text-[0.68rem] [&_thead_th]:font-extrabold [&_thead_th]:tracking-wide [&_thead_th]:text-grm-slate-muted [&_thead_th]:uppercase [&_thead_th]:whitespace-nowrap [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:last-child_th]:border-b-0 [&_tbody_tr:nth-child(even)_td:not(.ending-cell)]:bg-grm-panel [&_tbody_tr:nth-child(even)_th.person-cell]:bg-grm-panel";

export default function PresentTenseSection() {
  return (
    <>
      <Lead>
        <strong>Regelmäßige Verben im Präsens</strong> — drop{" "}
        <em>-en</em> from the infinitive to get the stem, then add endings.{" "}
        <em>kommen</em> → <em>komm-</em>. <strong>Irregular</strong> verbs like{" "}
        <em>sein</em> and <em>heißen</em> do not follow that pattern — learn
        their forms separately.
      </Lead>

      <section
        className="my-[0.45rem] mb-[0.7rem] rounded-lg border border-grm-panel-border bg-white p-[0.5rem_0.6rem] shadow-grammar-card"
        aria-labelledby="grammar-pronoun-ref-title"
      >
        <header className="mb-[0.4rem]">
          <h3
            id="grammar-pronoun-ref-title"
            className="m-0 text-[0.82rem] font-extrabold text-daf-head"
          >
            Personal pronouns
          </h3>
        </header>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-[0.28rem]">
          {PERSONAL_PRONOUNS.map((pronoun) => (
            <PronounRefCard key={pronoun.id} {...pronoun} />
          ))}
        </div>
        <p className="mt-[0.4rem] mb-0 text-[0.68rem] leading-snug text-grm-slate-muted">
          <strong>sie</strong> can mean <em>she</em> or <em>they</em> (same
          spelling). <strong>Sie</strong> (capital S) is always formal{" "}
          <em>you</em>.
        </p>
      </section>

      <div className="my-2 mt-2 mb-3 flex flex-col gap-[0.85rem]">
        <div className="overflow-hidden rounded-[10px] border border-grm-panel-border border-t-[3px] border-t-grm-der bg-white shadow-grammar">
          <header className="border-b border-grm-panel-border-row bg-grammar-travel-in px-3 py-[0.55rem]">
            <h3 className="m-0 text-[0.88rem] font-extrabold text-daf-head">
              Regular verbs
            </h3>
            <p className="mt-[0.15rem] mb-0 text-[0.76rem] text-grm-slate-muted">
              <em>kommen</em> · <em>arbeiten</em>
            </p>
          </header>
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className={CONJ_TABLE}>
              <thead>
                <tr>
                  <th scope="col" className="w-px! pl-[0.45rem]! pr-[0.3rem]!">
                    Pers.
                  </th>
                  <th
                    scope="col"
                    className="ending-cell w-px! px-[0.25rem]! text-center!"
                    title="Ending"
                  >
                    End.
                  </th>
                  <th scope="col" className="min-w-[5.5rem] pl-[0.55rem]">
                    <em>kommen</em>
                  </th>
                  <th scope="col" className="min-w-[5.5rem] pl-[0.55rem]">
                    <em>arbeiten</em>
                  </th>
                </tr>
              </thead>
              <tbody>
                {REGULAR_CONJUGATION_ROWS.map((row) => (
                  <tr key={row.person.join("-")}>
                    <th
                      scope="row"
                      className="person-cell w-px! bg-daf-panel-soft! pr-[0.35rem]! pl-[0.45rem]! text-[0.76rem] font-semibold text-grm-slate-body"
                    >
                      <PersonCell labels={row.person} />
                    </th>
                    <td className="ending-cell w-px! px-[0.25rem]! text-center! whitespace-nowrap">
                      <span className="text-[0.72rem] font-bold text-grm-panel-gold-text">
                        {row.ending}
                      </span>
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

        <div className="overflow-hidden rounded-[10px] border border-grm-panel-border border-t-[3px] border-t-grm-gold bg-white shadow-grammar">
          <header className="border-b border-grm-panel-border-row bg-gradient-to-b from-grm-gold-bg to-daf-white px-3 py-[0.55rem]">
            <h3 className="m-0 text-[0.88rem] font-extrabold text-grm-gold">
              Irregular verbs
            </h3>
            <p className="mt-[0.15rem] mb-0 text-[0.76rem] text-grm-slate-muted">
              <em>sein</em> · <em>heißen</em>
            </p>
          </header>
          <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className={`${CONJ_TABLE} [&_td:not(.person-cell):not(.ending-cell)]:min-w-[5.5rem]`}>
              <thead>
                <tr>
                  <th scope="col" className="w-px! pl-[0.45rem]! pr-[0.3rem]!">
                    Pers.
                  </th>
                  {IRREGULAR_VERB_COLUMNS.map((verb) => (
                    <th
                      key={verb.id}
                      scope="col"
                      className="min-w-[5.5rem] pl-[0.55rem]"
                      title={verb.english}
                    >
                      <em>{verb.infinitive}</em>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {IRREGULAR_VERB_ROWS.map((row) => (
                  <tr key={row.person.join("-")}>
                    <th
                      scope="row"
                      className="person-cell w-px! bg-daf-panel-soft! pr-[0.35rem]! pl-[0.45rem]! text-[0.76rem] font-semibold text-grm-slate-body"
                    >
                      <PersonCell labels={row.person} />
                    </th>
                    {IRREGULAR_VERB_COLUMNS.map((verb) => {
                      const { form, farsi } = row.forms[verb.id];
                      return (
                        <td key={verb.id}>
                          <IrregularConjForm form={form} farsi={farsi} />
                        </td>
                      );
                    })}
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
