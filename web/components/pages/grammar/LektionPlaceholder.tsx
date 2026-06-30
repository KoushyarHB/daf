import Link from "next/link";

import type { GrammarLessonMeta } from "@/lib/grammar/lessons";

import {
  grammarBackLinkClass,
  grammarBreadcrumbClass,
  grammarPageClass,
  grammarPageIntroClass,
  grammarPageTitleClass,
} from "@/components/pages/grammar/grammar-ui";

type LektionPlaceholderProps = {
  lesson: GrammarLessonMeta;
};

export default function LektionPlaceholder({ lesson }: LektionPlaceholderProps) {
  return (
    <div className={grammarPageClass}>
      <nav className={grammarBreadcrumbClass} aria-label="Breadcrumb">
        <Link href="/grammar">Grammar</Link>
        <span aria-hidden="true">/</span>
        <span>Lektion {lesson.lektion}</span>
      </nav>
      <header>
        <h1 className={grammarPageTitleClass}>{lesson.title}</h1>
        <p className={grammarPageIntroClass}>
          This lesson is not ready yet. Lektion 1 is available now — more grammar
          notes will be added here as the course continues.
        </p>
        <Link href="/grammar/lektion-1" className={grammarBackLinkClass}>
          ← Open Lektion 1
        </Link>
      </header>
    </div>
  );
}
