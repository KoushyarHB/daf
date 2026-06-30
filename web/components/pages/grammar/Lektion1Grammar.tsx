import Link from "next/link";

import AlphabetPronunciationSection from "@/components/pages/grammar/AlphabetPronunciationSection";
import GenderPatternsSection from "@/components/pages/grammar/GenderPatternsSection";
import PluralPatternsSection from "@/components/pages/grammar/PluralPatternsSection";
import PresentTenseSection from "@/components/pages/grammar/PresentTenseSection";
import QuestionsSection from "@/components/pages/grammar/QuestionsSection";
import WQuestionWordsSection from "@/components/pages/grammar/WQuestionWordsSection";
import AusCountriesSection from "@/components/pages/grammar/AusCountriesSection";
import PossessivesSection from "@/components/pages/grammar/PossessivesSection";
import TravelCountriesSection from "@/components/pages/grammar/TravelCountriesSection";
import GrammarEx from "@/components/pages/grammar/GrammarEx";
import {
  Callout,
  Ex,
  GenderTableColGroup,
  GenderTableHead,
  Lead,
  Section,
  grammarBackLinkClass,
  grammarBreadcrumbClass,
  grammarColDasClass,
  grammarColDerClass,
  grammarColDieClass,
  grammarColPlClass,
  grammarExampleListClass,
  grammarExampleListSpeakClass,
  grammarLessonColCaseClass,
  grammarLessonTableClass,
  grammarPageClass,
  grammarPageIntroClass,
  grammarPageTitleClass,
  grammarPatternListClass,
  grammarTableWrapClass,
} from "@/components/pages/grammar/grammar-ui";

const TOC = [
  { id: "articles", label: "Articles & gender" },
  { id: "plural", label: "Plural" },
  { id: "alphabet", label: "Alphabet & pronunciation" },
  { id: "present", label: "Present tense" },
  { id: "questions", label: "Questions" },
  { id: "w-words", label: "W-question words" },
  { id: "cases", label: "Articles in cases" },
  { id: "aus", label: "aus + countries" },
  { id: "travel", label: "nach / in + travel" },
  { id: "possessives", label: "Possessives" },
  { id: "two-way", label: "Two-way prepositions" },
  { id: "pronouns", label: "Personal vs reflexive" },
] as const;

export default function Lektion1Grammar() {
  return (
    <article className={grammarPageClass}>
      <nav className={grammarBreadcrumbClass} aria-label="Breadcrumb">
        <Link href="/grammar">Grammar</Link>
        <span aria-hidden="true">/</span>
        <span>Lektion 1</span>
      </nav>

      <header className="mb-[1.35rem]">
        <div className="rounded-xl border border-grm-toc bg-grammar-hub p-[1.35rem_1.2rem] shadow-hub">
          <p className="m-0 mb-[0.3rem] text-[0.72rem] font-bold tracking-[0.08em] text-grm-der uppercase">
            DaF A1
          </p>
          <h1 className={grammarPageTitleClass}>Lektion 1 — Grammar</h1>
          <p className={grammarPageIntroClass}>
            Core patterns for articles, plurals, pronunciation, verb endings,
            asking questions, and the first case changes you need at A1.
          </p>
        </div>
      </header>

      <nav
        className="mb-7 rounded-[10px] border border-grm-toc-hover bg-white p-4 shadow-section"
        aria-label="On this page"
      >
        <p className="m-0 mb-[0.65rem] text-[0.72rem] font-bold tracking-wide text-daf-head uppercase">
          Jump to section
        </p>
        <ol className="m-0 flex list-none flex-wrap gap-[0.4rem] p-0">
          {TOC.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex items-center gap-[0.35rem] rounded-full border border-grm-toc-hover bg-grm-panel-table px-[0.55rem] py-[0.28rem] text-[0.78rem] font-medium text-grm-slate-case no-underline transition-[background,border-color] hover:border-grm-der-border hover:bg-grm-der-bg hover:text-grm-der"
              >
                <span className="inline-flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-daf-head text-[0.65rem] font-bold text-white">
                  {i + 1}
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="articles" number={1} title="German articles & noun gender">
        <Lead>
          Every German noun has a gender. Learn nouns <strong>with their article</strong>{" "}
          — not the bare word alone. Gender affects adjectives, articles, and
          cases throughout the course.
        </Lead>
        <GenderPatternsSection />
      </Section>

      <Section id="plural" number={2} title="Plural (Plural)">
        <Lead>
          German plurals change in several ways. The plural article is always{" "}
          <strong className="text-grm-die">die</strong> — for every gender.
        </Lead>
        <PluralPatternsSection />
      </Section>

      <Section id="alphabet" number={3} title="Alphabet & pronunciation">
        <AlphabetPronunciationSection />
      </Section>

      <Section id="present" number={4} title="Present tense — regular & irregular verbs">
        <PresentTenseSection />
      </Section>

      <Section id="questions" number={5} title="Questions (Fragen)">
        <QuestionsSection />
      </Section>

      <Section id="w-words" number={6} title="W-question words">
        <WQuestionWordsSection />
      </Section>

      <Section id="cases" number={7} title="Definite articles in the cases">
        <Lead>
          At A1 you meet three cases. The definite article changes shape; the
          noun itself changes less often (except plural dative).
        </Lead>
        <div className={grammarTableWrapClass}>
          <table className={`${grammarLessonTableClass} table-fixed`}>
            <GenderTableColGroup />
            <thead>
              <GenderTableHead />
            </thead>
            <tbody>
              <tr>
                <th
                  scope="row"
                  className={`${grammarLessonColCaseClass} bg-daf-panel-soft!`}
                  title="Nominativ"
                >
                  Nom.
                </th>
                <td className={grammarColDerClass}>der</td>
                <td className={grammarColDasClass}>das</td>
                <td className={grammarColDieClass}>die</td>
                <td className={grammarColPlClass}>die</td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className={`${grammarLessonColCaseClass} bg-daf-panel-soft!`}
                  title="Akkusativ"
                >
                  Akk.
                </th>
                <td className={grammarColDerClass}>den</td>
                <td className={grammarColDasClass}>das</td>
                <td className={grammarColDieClass}>die</td>
                <td className={grammarColPlClass}>die</td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className={`${grammarLessonColCaseClass} bg-daf-panel-soft!`}
                  title="Dativ"
                >
                  Dat.
                </th>
                <td className={grammarColDerClass}>dem</td>
                <td className={grammarColDasClass}>dem</td>
                <td className={grammarColDieClass}>der</td>
                <td className={grammarColPlClass}>
                  den + <em>n</em>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className={grammarExampleListSpeakClass}>
          <GrammarEx de="Der Mann arbeitet." en="The man works. (Nom.)" />
          <GrammarEx de="Ich sehe den Mann." en="I see the man. (Akk.)" />
          <GrammarEx
            de="Ich spreche mit dem Mann."
            en="I speak with the man. (Dat.)"
          />
          <GrammarEx
            de="Ich spreche mit den Kindern."
            en="with the children (Dat. pl. + n)"
          />
        </ul>
        <Callout variant="remember" title="Quick memory hook">
          Only <strong>masculine</strong> changes in Akkusativ (<em>der → den</em>
          ). Dativ uses <em>dem / dem / der</em> (masc · neut · fem); plural dative is{" "}
          <em>den + n</em> on the noun when possible.
        </Callout>
      </Section>

      <Section id="aus" number={8} title="aus + Dative — countries & origins">
        <AusCountriesSection />
      </Section>

      <Section id="travel" number={9} title="nach vs in — travelling to countries">
        <TravelCountriesSection />
      </Section>

      <Section id="possessives" number={10} title="Possessive pronouns (mein …)">
        <PossessivesSection />
      </Section>

      <Section id="two-way" number={11} title="Two-way preposition: in">
        <p>
          <strong>in</strong> can take <strong>Dativ</strong> or{" "}
          <strong>Akkusativ</strong>:
        </p>
        <ul className={grammarPatternListClass}>
          <li>
            <strong>in + Dativ</strong> — location (where?) — no movement:{" "}
            <em>Ich bin in der Schule.</em>
          </li>
          <li>
            <strong>in + Akkusativ</strong> — direction (where to?) — movement:{" "}
            <em>Ich gehe in die Schule.</em>
          </li>
        </ul>
        <Callout variant="remember" title="Wo? vs Wohin?">
          <strong>Wo?</strong> → Dativ (static). <strong>Wohin?</strong> →
          Akkusativ (motion). The same logic applies to other two-way
          prepositions you will meet later (<em>an, auf, über, unter, vor, hinter,
          neben, zwischen</em>).
        </Callout>
      </Section>

      <Section id="pronouns" number={12} title="Personal vs reflexive pronouns">
        <p>
          <strong>Personal pronouns</strong> replace a noun: <em>ich, du, er, sie,
          es, wir, ihr, sie, Sie</em>.
        </p>
        <p>
          <strong>Reflexive pronouns</strong> refer back to the subject — common
          with reflexive verbs like <em>sich freuen</em>, <em>sich waschen</em>:
        </p>
        <div className={grammarTableWrapClass}>
          <table className={grammarLessonTableClass}>
            <tbody>
              <tr>
                <td className="w-[36%] bg-grm-panel font-semibold text-daf-label">ich</td>
                <td>mich / mir</td>
              </tr>
              <tr>
                <td className="w-[36%] bg-grm-panel font-semibold text-daf-label">du</td>
                <td>dich / dir</td>
              </tr>
              <tr>
                <td className="w-[36%] bg-grm-panel font-semibold text-daf-label">er / sie / es</td>
                <td>sich</td>
              </tr>
              <tr>
                <td className="w-[36%] bg-grm-panel font-semibold text-daf-label">wir</td>
                <td>uns</td>
              </tr>
              <tr>
                <td className="w-[36%] bg-grm-panel font-semibold text-daf-label">ihr</td>
                <td>euch</td>
              </tr>
              <tr>
                <td className="w-[36%] bg-grm-panel font-semibold text-daf-label">sie / Sie</td>
                <td>sich</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className={grammarExampleListClass}>
          <Ex de="Ich wasche mich." en="I wash myself." />
          <Ex de="Freust du dich?" en="Are you looking forward to it?" />
        </ul>
        <Callout title="Preview for later lessons">
          Whether you need <em>mich</em> or <em>mir</em> depends on the case the
          verb requires — you will practise this with common reflexive verbs in
          later Lektionen.
        </Callout>
      </Section>

      <footer className="mt-8 border-t-2 border-grm-panel-border-section pt-4">
        <Link href="/grammar" className={grammarBackLinkClass}>
          ← All grammar lessons
        </Link>
      </footer>
    </article>
  );
}
