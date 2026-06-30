"use client";

import GrammarEx from "@/components/pages/grammar/GrammarEx";
import {
  QuestionTypeCard,
  grammarExampleListClass,
  grammarExampleListSpeakClass,
  grammarSectionSubtitleClass,
} from "@/components/pages/grammar/grammar-ui";

const WIE_QUESTIONS: {
  de: string;
  en: string;
  speakText?: string;
}[] = [
  {
    de: "Wie geht's? / Wie geht es Ihnen?",
    en: "How are you?",
    speakText: "Wie geht's? Wie geht es Ihnen?",
  },
  {
    de: "Wie heißen Sie? / Wie heißt du?",
    en: "What is your name?",
    speakText: "Wie heißen Sie? Wie heißt du?",
  },
  {
    de: "Wie schreibt man das?",
    en: "How do you spell that?",
  },
  {
    de: "Wie ist Ihr/dein Name?",
    en: "What is your name?",
    speakText: "Wie ist Ihr Name? Wie ist dein Name?",
  },
  {
    de: "Wie ist Ihre/deine Nationalität?",
    en: "What is your nationality?",
    speakText: "Wie ist Ihre Nationalität? Wie ist deine Nationalität?",
  },
  {
    de: "Wie ist Ihre/deine Adresse?",
    en: "What is your address?",
    speakText: "Wie ist Ihre Adresse? Wie ist deine Adresse?",
  },
  {
    de: "Wie ist Ihre/deine Telefonnummer?",
    en: "What is your phone number?",
    speakText: "Wie ist Ihre Telefonnummer? Wie ist deine Telefonnummer?",
  },
  {
    de: "Wie ist Ihre/deine E-Mail-Adresse?",
    en: "What is your email?",
    speakText: "Wie ist Ihre E-Mail-Adresse? Wie ist deine E-Mail-Adresse?",
  },
];

export default function QuestionsSection() {
  return (
    <>
      <div className="mb-4 grid gap-[0.85rem] min-[40rem]:grid-cols-2">
        <QuestionTypeCard
          title="W-questions"
          variant="w"
          formula={<>W-word + verb + subject + …</>}
        >
          <ul className={grammarExampleListClass}>
            <GrammarEx de="Wo wohnst du?" en="Where do you live?" />
          </ul>
        </QuestionTypeCard>
        <QuestionTypeCard
          title="Yes / No questions"
          variant="yesno"
          formula={<>Verb + subject + …</>}
        >
          <ul className={grammarExampleListClass}>
            <GrammarEx de="Wohnst du in Berlin?" en="Do you live in Berlin?" />
          </ul>
        </QuestionTypeCard>
      </div>

      <h3 className={grammarSectionSubtitleClass}>
        Common questions with <em>wie</em>
      </h3>
      <ul className={grammarExampleListSpeakClass}>
        {WIE_QUESTIONS.map((q) => (
          <GrammarEx
            key={q.de}
            de={q.de}
            en={q.en}
            speakText={q.speakText}
          />
        ))}
      </ul>
      <p className="mt-3 mb-0 rounded-md bg-daf-panel-soft p-[0.5rem_0.75rem] text-[0.82rem] text-grm-slate-muted italic">
        <strong>Vorname</strong> = first name · <strong>Nachname</strong> /{" "}
        <strong>Familienname</strong> = surname · <strong>Handynummer</strong> =
        mobile number
      </p>
    </>
  );
}
