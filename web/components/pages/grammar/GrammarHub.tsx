import Link from "next/link";

import { GRAMMAR_LESSONS } from "@/lib/grammar/lessons";

import {
  grammarPageClass,
  grammarPageIntroClass,
  grammarPageTitleClass,
} from "@/components/pages/grammar/grammar-ui";

const LESSON_TOP_BAR: Record<number, string> = {
  1: "before:bg-gradient-to-r before:from-grm-der before:to-grm-der-light",
  2: "before:bg-gradient-to-r before:from-grm-das before:to-grm-das-light",
  3: "before:bg-gradient-to-r before:from-grm-die before:to-grm-die-light",
  4: "before:bg-gradient-to-r before:from-grm-pl before:to-grm-pl-light",
};

const LESSON_CARD_BASE =
  "relative flex min-h-32 flex-col gap-[0.4rem] overflow-hidden rounded-[10px] border border-grm-hub-card-border bg-daf-white p-[1.05rem_1.15rem] text-inherit no-underline before:absolute before:top-0 before:right-0 before:left-0 before:h-1 before:content-['']";

export default function GrammarHub() {
  return (
    <div className={grammarPageClass}>
      <header className="mb-6 rounded-xl border border-grm-hub-border bg-grammar-hub p-[1.35rem_1.25rem] shadow-hub">
        <div>
          <p className="m-0 mb-[0.35rem] text-[0.72rem] font-bold tracking-[0.08em] text-grm-hub uppercase">
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
                className={`${LESSON_CARD_BASE} ${LESSON_TOP_BAR[lesson.lektion] ?? ""} transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-grm-hub-card-hover hover:shadow-hub-card`}
              >
                <span className="text-[0.7rem] font-bold tracking-wide text-daf-head uppercase">
                  Lektion {lesson.lektion}
                </span>
                <span className="text-[1.02rem] font-semibold text-grm-slate-title">
                  {lesson.title}
                </span>
                <span className="flex-1 text-[0.82rem] leading-normal text-grm-slate-muted">
                  {lesson.summary}
                </span>
                <span className="text-[0.8rem] font-bold text-daf-head">
                  Open lesson →
                </span>
              </Link>
            ) : (
              <div
                className={`${LESSON_CARD_BASE} opacity-70 before:bg-daf-icon-muted! bg-grm-hub-soon`}
                aria-disabled="true"
              >
                <span className="text-[0.7rem] font-bold tracking-wide text-daf-head uppercase">
                  Lektion {lesson.lektion}
                </span>
                <span className="text-[1.02rem] font-semibold text-grm-slate-title">
                  {lesson.title}
                </span>
                <span className="flex-1 text-[0.82rem] leading-normal text-grm-slate-muted">
                  {lesson.summary}
                </span>
                <span className="text-[0.8rem] font-bold text-daf-disabled">
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
