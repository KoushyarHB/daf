import type { LessonPageEntry } from "@/lib/vocab/types";
import ZoomableImage from "@/components/shared/ZoomableImage";

type LessonHubProps = {
  lessons: LessonPageEntry[];
};

export default function LessonHub({ lessons }: LessonHubProps) {
  return (
    <>
      <section className="lesson-links">
        <h2>Lesson Links</h2>
        <ul>
          {lessons.map((lesson) => {
            const wp = lesson.wordPage;
            const gp = lesson.grammarPage;
            return (
              <li key={lesson.lektion}>
                {lesson.title}:{" "}
                <a href={wp.image} target="_blank" rel="noopener noreferrer">
                  {wp.label}
                </a>{" "}
                ·{" "}
                <a href={gp.image} target="_blank" rel="noopener noreferrer">
                  {gp.label}
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="lesson-previews">
        <h2 className="lesson-preview-title">Page Previews</h2>
        <ul className="lesson-list">
          {lessons.map((lesson) => {
            const wp = lesson.wordPage;
            const gp = lesson.grammarPage;
            return (
              <li key={lesson.lektion} className="lesson-item">
                <h2>{lesson.title}</h2>
                <div className="meta">
                  <span>Lektion {lesson.lektion}</span>
                </div>
                <div className="deck-controls-row">
                  <div>
                    <div>
                      <a
                        href={wp.image}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {wp.label} — open full image
                      </a>
                    </div>
                    <ZoomableImage
                      src={wp.image}
                      alt={`${lesson.title} words page`}
                    />
                  </div>
                  <div>
                    <div>
                      <a
                        href={gp.image}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {gp.label} — open full image
                      </a>
                    </div>
                    <ZoomableImage
                      src={gp.image}
                      alt={`${lesson.title} grammar page`}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
