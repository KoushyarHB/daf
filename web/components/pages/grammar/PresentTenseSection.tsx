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
    <div className="rounded-md border border-[#e8eef5] bg-[#f8fafc] p-[0.28rem_0.38rem]">
      <div className="flex flex-wrap items-center gap-[0.2rem]">
        <span className="text-[0.8rem] leading-tight font-extrabold text-[#2f3d4d]">
          {german}
        </span>
        {hint ? (
          <span className="rounded-full bg-[#eef2f7] px-[0.28rem] py-px text-[0.56rem] font-bold tracking-wide text-[#7a8794] uppercase">
            {hint}
          </span>
        ) : null}
        <GrammarSpeakButton german={german} />
      </div>
      <p className="mt-[0.1rem] mb-0 text-[0.64rem] leading-snug text-[#5a6573]">
        <span>{english}</span>
        <span className="ms-[0.2em] font-normal text-[#9aa3ad] opacity-88" lang="fa">
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
          <span className="font-extrabold italic text-[#b8860b]">{suffix}</span>
        </span>
        <span
          className="font-normal text-[0.68rem] text-[#9aa3ad] not-italic opacity-92"
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
          className="font-normal text-[0.68rem] text-[#9aa3ad] not-italic opacity-92"
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
  "w-full min-w-[17.5rem] border-collapse text-[0.8rem] [&_td]:border-b [&_td]:border-[#e8eef5] [&_td]:p-2 [&_td]:text-left [&_td]:align-middle [&_th]:border-b [&_th]:border-[#e8eef5] [&_th]:p-2 [&_th]:text-left [&_th]:align-middle [&_thead_th]:border-b-2 [&_thead_th]:border-[#d8e4f0] [&_thead_th]:bg-[#f4f8fc] [&_thead_th]:text-[0.68rem] [&_thead_th]:font-extrabold [&_thead_th]:tracking-wide [&_thead_th]:text-[#5a6573] [&_thead_th]:uppercase [&_thead_th]:whitespace-nowrap [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:last-child_th]:border-b-0 [&_tbody_tr:nth-child(even)_td:not(.ending-cell)]:bg-[#fafbfd] [&_tbody_tr:nth-child(even)_th.person-cell]:bg-[#fafbfd]";

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
        className="my-[0.45rem] mb-[0.7rem] rounded-lg border border-[#d8e4f0] bg-white p-[0.5rem_0.6rem] shadow-[0_1px_2px_rgba(30,58,95,0.04)]"
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
        <p className="mt-[0.4rem] mb-0 text-[0.68rem] leading-snug text-[#5a6573]">
          <strong>sie</strong> can mean <em>she</em> or <em>they</em> (same
          spelling). <strong>Sie</strong> (capital S) is always formal{" "}
          <em>you</em>.
        </p>
      </section>

      <div className="my-2 mt-2 mb-3 flex flex-col gap-[0.85rem]">
        <div className="overflow-hidden rounded-[10px] border border-[#d8e4f0] border-t-[3px] border-t-grm-der bg-white shadow-[0_1px_3px_rgba(30,58,95,0.06)]">
          <header className="border-b border-[#e8eef5] bg-gradient-to-b from-grm-der-bg to-white px-3 py-[0.55rem]">
            <h3 className="m-0 text-[0.88rem] font-extrabold text-daf-head">
              Regular verbs
            </h3>
            <p className="mt-[0.15rem] mb-0 text-[0.76rem] text-[#5a6573]">
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
                      className="person-cell w-px! bg-[#f8fafc]! pr-[0.35rem]! pl-[0.45rem]! text-[0.76rem] font-semibold text-[#2f3d4d]"
                    >
                      <PersonCell labels={row.person} />
                    </th>
                    <td className="ending-cell w-px! px-[0.25rem]! text-center! whitespace-nowrap">
                      <span className="text-[0.72rem] font-bold text-[#6b4f12]">
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

        <div className="overflow-hidden rounded-[10px] border border-[#d8e4f0] border-t-[3px] border-t-grm-gold bg-white shadow-[0_1px_3px_rgba(30,58,95,0.06)]">
          <header className="border-b border-[#e8eef5] bg-gradient-to-b from-grm-gold-bg to-white px-3 py-[0.55rem]">
            <h3 className="m-0 text-[0.88rem] font-extrabold text-grm-gold">
              Irregular verbs
            </h3>
            <p className="mt-[0.15rem] mb-0 text-[0.76rem] text-[#5a6573]">
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
                      className="person-cell w-px! bg-[#f8fafc]! pr-[0.35rem]! pl-[0.45rem]! text-[0.76rem] font-semibold text-[#2f3d4d]"
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
