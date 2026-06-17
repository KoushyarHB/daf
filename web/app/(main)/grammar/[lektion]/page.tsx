import { notFound } from "next/navigation";

import Lektion1Grammar from "@/components/pages/grammar/Lektion1Grammar";
import LektionPlaceholder from "@/components/pages/grammar/LektionPlaceholder";
import { grammarLessonBySlug } from "@/lib/grammar/lessons";

type PageProps = {
  params: Promise<{ lektion: string }>;
};

export function generateStaticParams() {
  return Array.from({ length: 8 }, (_, i) => ({
    lektion: `lektion-${i + 1}`,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { lektion } = await params;
  const lesson = grammarLessonBySlug(lektion);
  if (!lesson) return { title: "daf — grammar" };
  return { title: `daf — ${lesson.title}` };
}

export default async function GrammarLektionPage({ params }: PageProps) {
  const { lektion } = await params;
  const lesson = grammarLessonBySlug(lektion);
  if (!lesson) notFound();

  if (lesson.slug === "lektion-1") {
    return <Lektion1Grammar />;
  }

  return <LektionPlaceholder lesson={lesson} />;
}
