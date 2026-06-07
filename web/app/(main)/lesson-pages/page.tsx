import { loadLessonPages } from "@/lib/vocab/load-manifest";
import LessonHub from "@/components/pages/lesson-pages/LessonHub";

export const metadata = {
  title: "daf — lesson pages",
};

export default function LessonPagesPage() {
  const lessons = loadLessonPages();
  return <LessonHub lessons={lessons} />;
}
