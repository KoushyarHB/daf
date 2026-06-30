"use client";

import { PLURAL_PATTERN_RULES } from "@/lib/grammar/plural-patterns";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Callout, GenderChip } from "@/components/pages/grammar/grammar-ui";

function PluralPair({
  singular,
  singularEn,
  plural,
}: {
  singular: string;
  singularEn: string;
  plural: string;
}) {
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-[0.2rem_0.3rem] rounded-[5px] border border-black/6 bg-white/72 px-[0.28rem] py-[0.12rem] text-[0.74rem] leading-tight">
      <span className="inline-flex flex-wrap items-center gap-[0.2rem]">
        <span className="font-semibold whitespace-nowrap italic">{singular}</span>
        <span className="text-[0.68rem] font-bold not-italic opacity-55" aria-hidden="true">
          →
        </span>
        <span className="font-semibold whitespace-nowrap italic text-grm-pl">{plural}</span>
      </span>
      <span className="text-[0.68rem] whitespace-nowrap italic text-daf-gray-en">
        ({singularEn})
      </span>
      <span className="inline-flex items-center gap-[0.12rem]">
        <GrammarSpeakButton german={singular} />
        <GrammarSpeakButton german={plural} />
      </span>
    </span>
  );
}

export default function PluralPatternsSection() {
  return (
    <>
      <div className="my-2 flex flex-wrap gap-[0.35rem]">
        <GenderChip article="die" label="Plural — all genders" gender="pl" />
      </div>

      <section className="my-[0.4rem] mb-[0.6rem] overflow-hidden rounded-lg border border-grm-pl-border bg-grm-pl-bg text-grm-pl">
        <header className="flex items-baseline justify-between gap-2 border-b border-black/6 px-[0.55rem] py-[0.35rem]">
          <h3 className="m-0 text-[0.78rem] font-extrabold tracking-wide uppercase">
            How the plural is built
          </h3>
          <span className="text-[0.9rem] font-extrabold">der / das / die → die</span>
        </header>

        <ul className="m-0 list-none px-[0.45rem] py-[0.2rem] pb-[0.35rem]">
          {PLURAL_PATTERN_RULES.map((rule) => (
            <li key={rule.id} className="border-b border-black/5 py-[0.28rem] last:border-b-0 last:pb-[0.1rem]">
              <div className="flex flex-col gap-[0.15rem] min-[36rem]:flex-row min-[36rem]:items-start min-[36rem]:gap-2">
                <span
                  className="max-w-full shrink-0 text-[0.72rem] leading-tight font-bold text-[#3d3268] min-[36rem]:w-[10.5rem]"
                  title={rule.hint}
                >
                  {rule.label}
                  <span className="ml-1 inline-block rounded-full border border-black/8 bg-white/65 px-[0.3rem] py-px align-baseline text-[0.62rem] font-bold whitespace-nowrap text-[#4a5564]">
                    {rule.accuracy}
                  </span>
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-[0.2rem_0.3rem]">
                  {rule.examples.map((ex) => (
                    <PluralPair
                      key={`${ex.singular}-${ex.plural}`}
                      singular={ex.singular}
                      singularEn={ex.singularEn}
                      plural={ex.plural}
                    />
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Callout variant="remember" title="Side note">
        Classify by <strong>what changes</strong> on the word, not by gender — the
        same ending can appear with der, das, or die. Learn{" "}
        <strong>singular + plural together</strong>; hover a pattern for which
        genders it usually fits.
      </Callout>
    </>
  );
}
