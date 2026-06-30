"use client";

import {
  ALPHABET_COLUMNS,
  ALPHABET_LEGEND,
  CH_AND_MORE_RULES,
  LETTER_COMBINATION_RULES,
  type AlphabetLetter,
  type PronunciationRule,
} from "@/lib/grammar/alphabet-patterns";

import GrammarSpeakButton from "@/components/pages/grammar/GrammarSpeakButton";
import { Lead, grammarSectionSubtitleClass } from "@/components/pages/grammar/grammar-ui";

function AlphabetLetterRow({ letter }: { letter: AlphabetLetter }) {
  return (
    <div className="flex min-h-[1.4rem] items-center gap-2 px-[0.2rem] py-[0.12rem] text-[0.8rem] leading-snug">
      <span className="w-[2.85rem] shrink-0 text-[0.9rem] font-extrabold text-[#1e3a5f]">
        {letter.display}
      </span>
      <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-[0.2rem_0.45rem]">
        {letter.ipa ? (
          <span className="text-[0.72rem] italic text-[#5a6573]">{letter.ipa}</span>
        ) : null}
        {letter.note ? (
          <span className="text-[0.68rem] italic text-[#6a5a40]">({letter.note})</span>
        ) : null}
        {letter.farsi ? (
          <span
            className="text-[0.82em] leading-snug text-[#4a3d32]"
            dir="rtl"
            lang="fa"
          >
            {letter.farsi}
          </span>
        ) : null}
      </span>
      <GrammarSpeakButton
        german={letter.speakText}
        speakText={letter.speakText}
        audioSrc={letter.audioSrc}
      />
    </div>
  );
}

function PronunciationRuleRow({ rule }: { rule: PronunciationRule }) {
  return (
    <div className="rounded-lg border border-[#e8ecf0] bg-[#fafbfd] p-[0.4rem_0.5rem]">
      <div className="mb-[0.3rem] flex flex-wrap items-baseline gap-[0.35rem_0.55rem]">
        <span className="min-w-[4.5rem] text-[0.82rem] font-extrabold text-grm-der">
          {rule.label}
        </span>
        <span className="flex flex-wrap items-baseline gap-[0.25rem_0.45rem] text-[0.76rem] text-[#3d4a57]">
          {rule.ipa ? (
            <span className="italic text-[#5a6573]">{rule.ipa}</span>
          ) : null}
          {rule.english ? (
            <span className="italic text-daf-gray-en">{rule.english}</span>
          ) : null}
          <span className="text-[0.82em] leading-snug text-[#4a3d32]" dir="rtl" lang="fa">
            {rule.farsi}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap gap-[0.25rem_0.35rem]">
        {rule.examples.map((ex) => (
          <span
            key={ex.german}
            className="inline-flex max-w-full items-center gap-[0.2rem] rounded-[5px] border border-black/6 bg-white/72 px-[0.28rem] py-[0.12rem] text-[0.74rem] leading-tight"
          >
            <span className="font-semibold whitespace-nowrap italic">{ex.german}</span>
            <span className="text-[0.68rem] whitespace-nowrap italic text-daf-gray-en">
              ({ex.english})
            </span>
            <GrammarSpeakButton german={ex.german} speakText={ex.speakText} />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AlphabetPronunciationSection() {
  return (
    <>
      <Lead>
        German uses the Latin alphabet plus <strong>ä</strong>, <strong>ö</strong>,{" "}
        <strong>ü</strong>, and <strong>ß</strong>. Layout and Farsi notes follow
        your notebook — tap ▶ to hear each letter name or example.
      </Lead>

      <div className="my-2 mb-[0.85rem] flex flex-col gap-2 min-[40rem]:flex-row min-[40rem]:items-start min-[40rem]:gap-[0.65rem]">
        <aside
          className="m-0 shrink-0 rounded-lg border-l-4 border-l-[#e8c84a] bg-[rgba(255,248,230,0.85)] p-[0.45rem_0.55rem] text-[0.72rem] leading-snug min-[40rem]:mt-[0.15rem] min-[40rem]:w-[7.25rem]"
          aria-label="Alphabet legend"
        >
          <p className="m-0 mb-[0.35rem] text-[0.75rem] font-extrabold tracking-wide text-grm-der uppercase">
            Alphabet
          </p>
          <ul className="m-0 list-none p-0">
            {ALPHABET_LEGEND.map((item) => (
              <li
                key={item.de}
                className="flex flex-wrap gap-[0.2rem_0.35rem] border-b border-black/5 py-[0.18rem] last:border-b-0"
              >
                <strong>{item.de}</strong>
                <span>{item.note}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div
          className="min-w-0 flex-1 rounded-[10px] border border-[#d8dce2] bg-[#fffef9] p-[0.65rem_0.75rem]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent, transparent 1.35rem, rgba(47, 111, 184, 0.07) 1.35rem, rgba(47, 111, 184, 0.07) calc(1.35rem + 1px))",
          }}
        >
          <div className="grid grid-cols-1 gap-x-3 gap-y-[0.4rem] min-[32rem]:grid-cols-3 min-[32rem]:gap-x-[1.15rem] min-[32rem]:gap-y-[0.45rem]">
            {ALPHABET_COLUMNS.map((column, colIndex) => (
              <div
                key={`col-${colIndex}`}
                className="flex min-w-0 flex-col gap-[0.2rem]"
                aria-label={`Column ${colIndex + 1}`}
              >
                {column.map((letter) => (
                  <AlphabetLetterRow key={letter.id} letter={letter} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className={grammarSectionSubtitleClass}>Letter combinations</h3>
      <div className="my-[0.35rem] mb-3 flex flex-col gap-[0.35rem]">
        {LETTER_COMBINATION_RULES.map((rule) => (
          <PronunciationRuleRow key={rule.id} rule={rule} />
        ))}
      </div>

      <h3 className={grammarSectionSubtitleClass}>
        The “ch” sounds &amp; more
      </h3>
      <div className="my-[0.35rem] mb-3 flex flex-col gap-[0.35rem]">
        {CH_AND_MORE_RULES.map((rule) => (
          <PronunciationRuleRow key={rule.id} rule={rule} />
        ))}
      </div>
    </>
  );
}
