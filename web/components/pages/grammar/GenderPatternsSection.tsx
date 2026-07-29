"use client";

import {
  GENDER_PATTERN_GROUPS,
  GENDER_STARTER_EXAMPLES,
} from "@/lib/grammar/gender-patterns";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Callout, GenderChip } from "@/components/pages/grammar/grammar-ui";

const GENDER_PANEL: Record<string, string> = {
  m: "border-grm-der-border bg-grm-der-bg text-grm-der [&_h3]:text-inherit [&_.rule-label]:text-grm-der-text-dark",
  n: "border-grm-das-border bg-grm-das-bg text-grm-das [&_h3]:text-inherit [&_.rule-label]:text-grm-das-text",
  f: "border-grm-die-border bg-grm-die-bg text-grm-die [&_h3]:text-inherit [&_.rule-label]:text-grm-die-text",
};

function GenderWord({
  german,
  english,
}: {
  german: string;
  english: string;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-[0.2rem] rounded-[5px] border border-daf-border-row bg-daf-white/72 px-[0.28rem] py-[0.12rem] text-[0.74rem] leading-tight">
      <span className="font-semibold whitespace-nowrap italic">{german}</span>
      <span className="text-[0.68rem] whitespace-nowrap italic text-daf-gray-en">
        ({english})
      </span>
      <GrammarSpeakButton german={german} />
    </span>
  );
}

export default function GenderPatternsSection() {
  return (
    <>
      <div className="my-2 flex flex-wrap items-start gap-2">
        <GenderChip article="der" label="Maskulinum" gender="m" />
        <GenderChip article="das" label="Neutrum" gender="n" />
        <GenderChip article="die" label="Femininum" gender="f" />
        <GenderChip article="die" label="Plural (all genders)" gender="pl" />
      </div>

      <div className="mb-[0.45rem] flex flex-wrap gap-[0.25rem_0.35rem]">
        {GENDER_STARTER_EXAMPLES.map((ex) => (
          <GenderWord key={ex.german} german={ex.german} english={ex.english} />
        ))}
      </div>

      <div className="my-[0.4rem] mb-[0.6rem] flex flex-col gap-2">
        {GENDER_PATTERN_GROUPS.map((group) => (
          <section
            key={group.gender}
            className={`overflow-hidden rounded-lg border ${GENDER_PANEL[group.gender]}`}
          >
            <header className="flex items-baseline justify-between gap-2 border-b border-daf-border-row px-[0.55rem] py-[0.35rem]">
              <h3 className="m-0 text-[0.78rem] font-extrabold tracking-wide uppercase">
                {group.title}
              </h3>
              <span className="text-[0.9rem] font-extrabold">{group.subtitle}</span>
            </header>

            <ul className="m-0 list-none px-[0.45rem] py-[0.2rem] pb-[0.35rem]">
              {group.rules.map((rule) => (
                <li key={rule.id} className="border-b border-daf-border-row py-[0.28rem] last:border-b-0 last:pb-[0.1rem]">
                  <div className="flex flex-col gap-[0.15rem] min-[36rem]:flex-row min-[36rem]:items-start min-[36rem]:gap-2">
                    <span
                      className="rule-label max-w-full shrink-0 text-[0.72rem] leading-tight font-bold min-[36rem]:w-[9.5rem]"
                      title={rule.hint}
                    >
                      {rule.label}
                      <span className="ml-1 inline-block rounded-full border border-daf-border bg-daf-white/65 px-[0.3rem] py-px align-baseline text-[0.62rem] font-bold whitespace-nowrap text-grm-slate-chip">
                        {rule.accuracy}
                      </span>
                    </span>
                    <div className="flex min-w-0 flex-1 flex-wrap gap-[0.2rem_0.3rem]">
                      {rule.examples.map((ex) => (
                        <GenderWord
                          key={ex.german}
                          german={ex.german}
                          english={ex.english}
                        />
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Callout variant="remember" title="Side note">
        Percentages are rough guides — always exceptions. Below ~80%, treat as a
        hint only. Learn each noun <strong>with its article</strong>.
      </Callout>
    </>
  );
}
