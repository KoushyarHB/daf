import Link from "next/link";

import { GRAMMAR_LESSONS } from "@/lib/grammar/lessons";

export default function GrammarHub() {
  return (
    <div className="grammar-page">
      <header className="grammar-hub__hero">
        <div className="grammar-hub__hero-text">
          <p className="grammar-hub__eyebrow">DaF A1 course notes</p>
          <h1 className="grammar-page__title">Grammar</h1>
          <p className="grammar-page__intro">
            Lesson-by-lesson grammar — colour-coded tables, examples, and study
            tips from your notebook, ready to use alongside vocabulary cards.
          </p>
        </div>
      </header>

      <ul className="grammar-lesson-grid">
        {GRAMMAR_LESSONS.map((lesson) => (
          <li key={lesson.slug}>
            {lesson.available ? (
              <Link
                href={`/grammar/${lesson.slug}`}
                className={`grammar-lesson-card grammar-lesson-card--available grammar-lesson-card--l${lesson.lektion}`}
              >
                <span className="grammar-lesson-card__badge">
                  Lektion {lesson.lektion}
                </span>
                <span className="grammar-lesson-card__title">{lesson.title}</span>
                <span className="grammar-lesson-card__summary">{lesson.summary}</span>
                <span className="grammar-lesson-card__cta">Open lesson →</span>
              </Link>
            ) : (
              <div
                className={`grammar-lesson-card grammar-lesson-card--soon grammar-lesson-card--l${lesson.lektion}`}
                aria-disabled="true"
              >
                <span className="grammar-lesson-card__badge">
                  Lektion {lesson.lektion}
                </span>
                <span className="grammar-lesson-card__title">{lesson.title}</span>
                <span className="grammar-lesson-card__summary">{lesson.summary}</span>
                <span className="grammar-lesson-card__cta">Coming soon</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
