import Link from "next/link";

import type { GrammarLessonMeta } from "@/lib/grammar/lessons";

type LektionPlaceholderProps = {
  lesson: GrammarLessonMeta;
};

export default function LektionPlaceholder({ lesson }: LektionPlaceholderProps) {
  return (
    <div className="grammar-page">
      <nav className="grammar-breadcrumb" aria-label="Breadcrumb">
        <Link href="/grammar">Grammar</Link>
        <span aria-hidden="true">/</span>
        <span>Lektion {lesson.lektion}</span>
      </nav>
      <header className="grammar-page__header">
        <h1 className="grammar-page__title">{lesson.title}</h1>
        <p className="grammar-page__intro">
          This lesson is not ready yet. Lektion 1 is available now — more grammar
          notes will be added here as the course continues.
        </p>
        <Link href="/grammar/lektion-1" className="grammar-back-link">
          ← Open Lektion 1
        </Link>
      </header>
    </div>
  );
}
