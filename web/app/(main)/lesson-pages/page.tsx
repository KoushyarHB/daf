import LessonHub from "@/components/pages/lesson-pages/LessonHub";
import * as lessonsService from "@/services/backend/lessons.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "daf — lesson pages",
};

export default async function LessonPagesPage() {
  const lessons = await lessonsService.fetchLessons();
  return <LessonHub lessons={lessons} />;
}
