import type { LessonPageEntry } from "@/lib/vocab/types";
import ZoomableImage from "@/components/shared/ZoomableImage";

type LessonHubProps = {
  lessons: LessonPageEntry[];
};

export default function LessonHub({ lessons }: LessonHubProps) {
  return (
    <>
      <section className="mb-5 rounded-lg border border-daf-border bg-white px-4 py-[0.85rem]">
        <h2 className="m-0 mb-2.5 text-[1.05rem] text-daf-text">Lesson Links</h2>
        <ul className="m-0 pl-[1.1rem]">
          {lessons.map((lesson) => {
            const wp = lesson.wordPage;
            const gp = lesson.grammarPage;
            return (
              <li key={lesson.lektion} className="my-[0.28rem]">
                {lesson.title}:{" "}
                <a
                  href={wp.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-daf-head"
                >
                  {wp.label}
                </a>{" "}
                ·{" "}
                <a
                  href={gp.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-daf-head"
                >
                  {gp.label}
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-[0.65rem] text-[1.05rem] text-daf-text">Page Previews</h2>
        <ul className="m-0 mt-3 list-none p-0">
          {lessons.map((lesson) => {
            const wp = lesson.wordPage;
            const gp = lesson.grammarPage;
            return (
              <li
                key={lesson.lektion}
                className="mb-[0.9rem] rounded-md border border-daf-border bg-white p-3"
              >
                <h2 className="m-0 mb-2 text-xl font-semibold text-daf-head border-b-2 border-daf-head pb-1.5">
                  {lesson.title}
                </h2>
                <div className="text-xs text-daf-muted mb-2 [&_span]:mr-3">
                  <span>Lektion {lesson.lektion}</span>
                </div>
                <div className="flex flex-wrap items-end gap-x-[0.55rem] gap-y-[0.35rem]">
                  <div>
                    <div>
                      <a
                        href={wp.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-daf-head"
                      >
                        {wp.label} — open full image
                      </a>
                    </div>
                    <ZoomableImage
                      src={wp.image}
                      alt={`${lesson.title} words page`}
                      className="mt-2.5 w-full"
                    />
                  </div>
                  <div>
                    <div>
                      <a
                        href={gp.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-daf-head"
                      >
                        {gp.label} — open full image
                      </a>
                    </div>
                    <ZoomableImage
                      src={gp.image}
                      alt={`${lesson.title} grammar page`}
                      className="mt-2.5 w-full"
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
