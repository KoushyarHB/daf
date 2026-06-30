import Link from "next/link";

import { GRAMMAR_LESSONS } from "@/lib/grammar/lessons";

import {
  grammarPageClass,
  grammarPageIntroClass,
  grammarPageTitleClass,
} from "@/components/pages/grammar/grammar-ui";

const LESSON_TOP_BAR: Record<number, string> = {
  1: "before:bg-gradient-to-r before:from-grm-der before:to-[#5c9fd4]",
  2: "before:bg-gradient-to-r before:from-grm-das before:to-[#5cb88a]",
  3: "before:bg-gradient-to-r before:from-grm-die before:to-[#d47aa0]",
  4: "before:bg-gradient-to-r before:from-grm-pl before:to-[#8a7ac4]",
};

const LESSON_CARD_BASE =
  "relative flex min-h-32 flex-col gap-[0.4rem] overflow-hidden rounded-[10px] border border-[#dce4ee] bg-white p-[1.05rem_1.15rem] text-inherit no-underline before:absolute before:top-0 before:right-0 before:left-0 before:h-1 before:content-['']";

export default function GrammarHub() {
  return (
    <div className={grammarPageClass}>
      <header className="mb-6 rounded-xl border border-[#d4e4f4] bg-gradient-to-br from-grm-der-bg via-[#f3e8fc] to-grm-das-bg p-[1.35rem_1.25rem] shadow-[0_4px_18px_rgba(47,111,184,0.08)]">
        <div>
          <p className="m-0 mb-[0.35rem] text-[0.72rem] font-bold tracking-[0.08em] text-[#5a7a9e] uppercase">
            DaF A1 course notes
          </p>
          <h1 className={grammarPageTitleClass}>Grammar</h1>
          <p className={grammarPageIntroClass}>
            Lesson-by-lesson grammar — colour-coded tables, examples, and study
            tips from your notebook, ready to use alongside vocabulary cards.
          </p>
        </div>
      </header>

      <ul className="m-0 grid list-none gap-[0.9rem] p-0 md:grid-cols-2">
        {GRAMMAR_LESSONS.map((lesson) => (
          <li key={lesson.slug}>
            {lesson.available ? (
              <Link
                href={`/grammar/${lesson.slug}`}
                className={`${LESSON_CARD_BASE} ${LESSON_TOP_BAR[lesson.lektion] ?? ""} transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#a8c4e8] hover:shadow-[0_8px_22px_rgba(47,111,184,0.14)]`}
              >
                <span className="text-[0.7rem] font-bold tracking-wide text-daf-head uppercase">
                  Lektion {lesson.lektion}
                </span>
                <span className="text-[1.02rem] font-semibold text-[#1a2332]">
                  {lesson.title}
                </span>
                <span className="flex-1 text-[0.82rem] leading-normal text-[#5a6573]">
                  {lesson.summary}
                </span>
                <span className="text-[0.8rem] font-bold text-daf-head">
                  Open lesson →
                </span>
              </Link>
            ) : (
              <div
                className={`${LESSON_CARD_BASE} opacity-70 before:bg-gray-300! bg-[#f9fafb]`}
                aria-disabled="true"
              >
                <span className="text-[0.7rem] font-bold tracking-wide text-daf-head uppercase">
                  Lektion {lesson.lektion}
                </span>
                <span className="text-[1.02rem] font-semibold text-[#1a2332]">
                  {lesson.title}
                </span>
                <span className="flex-1 text-[0.82rem] leading-normal text-[#5a6573]">
                  {lesson.summary}
                </span>
                <span className="text-[0.8rem] font-bold text-gray-400">
                  Coming soon
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
