import Link from "next/link";

import AlphabetPronunciationSection from "@/components/pages/grammar/AlphabetPronunciationSection";
import GenderPatternsSection from "@/components/pages/grammar/GenderPatternsSection";
import PluralPatternsSection from "@/components/pages/grammar/PluralPatternsSection";
import PresentTenseSection from "@/components/pages/grammar/PresentTenseSection";
import QuestionsSection from "@/components/pages/grammar/QuestionsSection";
import WQuestionWordsSection from "@/components/pages/grammar/WQuestionWordsSection";
import {
  Callout,
  Ex,
  Formula,
  GenderTableHead,
  Lead,
  Section,
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
    <article className="grammar-page grammar-lesson">
      <nav className="grammar-breadcrumb" aria-label="Breadcrumb">
        <Link href="/grammar">Grammar</Link>
        <span aria-hidden="true">/</span>
        <span>Lektion 1</span>
      </nav>

      <header className="grammar-lesson__hero">
        <div className="grammar-lesson__hero-inner">
          <p className="grammar-lesson__level">DaF A1</p>
          <h1 className="grammar-page__title">Lektion 1 — Grammar</h1>
          <p className="grammar-page__intro">
            Core patterns for articles, plurals, pronunciation, verb endings,
            asking questions, and the first case changes you need at A1.
          </p>
        </div>
      </header>

      <nav className="grammar-toc" aria-label="On this page">
        <p className="grammar-toc__label">Jump to section</p>
        <ol className="grammar-toc__list">
          {TOC.map((item, i) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>
                <span className="grammar-toc__num">{i + 1}</span>
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
          <strong className="grammar-highlight">die</strong> — for every gender.
        </Lead>
        <PluralPatternsSection />
      </Section>

      <Section id="alphabet" number={3} title="Alphabet & pronunciation">
        <AlphabetPronunciationSection />
      </Section>

      <Section id="present" number={4} title="Present tense — regular verbs & sein">
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
        <div className="grammar-table-wrap">
          <table className="grammar-lesson-table grammar-lesson-table--gender">
            <thead>
              <GenderTableHead useCol />
            </thead>
            <tbody>
              <tr>
                <td>Nominativ</td>
                <td className="grammar-col grammar-col--der">der</td>
                <td className="grammar-col grammar-col--das">das</td>
                <td className="grammar-col grammar-col--die">die</td>
                <td className="grammar-col grammar-col--die-pl">die</td>
                <td>subject</td>
              </tr>
              <tr>
                <td>Akkusativ</td>
                <td className="grammar-col grammar-col--der">den</td>
                <td className="grammar-col grammar-col--das">das</td>
                <td className="grammar-col grammar-col--die">die</td>
                <td className="grammar-col grammar-col--die-pl">die</td>
                <td>direct object</td>
              </tr>
              <tr>
                <td>Dativ</td>
                <td className="grammar-col grammar-col--der">dem</td>
                <td className="grammar-col grammar-col--das">dem</td>
                <td className="grammar-col grammar-col--die">der</td>
                <td className="grammar-col grammar-col--die-pl">
                  den + <em>n</em>
                </td>
                <td>indirect object; after mit, aus, von, zu, bei …</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="grammar-example-list">
          <Ex de="Der Mann arbeitet." en="The man works. (Nom.)" />
          <Ex de="Ich sehe den Mann." en="I see the man. (Akk.)" />
          <Ex de="Ich spreche mit dem Mann." en="I speak with the man. (Dat.)" />
          <Ex de="Ich spreche mit den Kindern." en="with the children (Dat. pl. + n)" />
        </ul>
        <Callout variant="remember" title="Quick memory hook">
          Only <strong>masculine</strong> changes in Akkusativ (<em>der → den</em>
          ). Dativ uses <em>dem / der / dem</em>; plural dative is{" "}
          <em>den + n</em> on the noun when possible.
        </Callout>
      </Section>

      <Section id="aus" number={8} title="aus + Dative — countries & origins">
        <Lead>
          <strong>aus</strong> is a dative preposition — <em>no exceptions</em>. Use
          it for where someone or something comes <em>from</em>.
        </Lead>
        <h3 className="grammar-section__subtitle">Most countries (neuter, no article)</h3>
        <ul className="grammar-example-list">
          <Ex de="Ich komme aus Deutschland." />
          <Ex de="aus China" />
          <Ex de="aus Österreich" />
          <Ex de="aus Russland" />
          <Ex de="aus Berlin." en="cities & continents — no article" />
        </ul>
        <p>
          With an adjective, the neuter article appears:{" "}
          <em>aus dem schönen Deutschland</em>.
        </p>

        <h3 className="grammar-section__subtitle">Countries with an article</h3>
        <div className="grammar-table-wrap">
          <table className="grammar-lesson-table grammar-lesson-table--compact">
            <thead>
              <tr>
                <th>Gender</th>
                <th>Dative</th>
                <th>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>masculine</td>
                <td>dem</td>
                <td>aus dem Iran, aus dem Irak</td>
              </tr>
              <tr>
                <td>feminine</td>
                <td>der</td>
                <td>aus der Schweiz, aus der Türkei, aus der Ukraine</td>
              </tr>
              <tr>
                <td>plural</td>
                <td>den</td>
                <td>aus den USA, aus den Niederlanden</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="travel" number={9} title="nach vs in — travelling to countries">
        <ul className="grammar-pattern-list">
          <li>
            <strong>nach</strong> + country <em>without</em> article —{" "}
            <em>nach Deutschland</em>
          </li>
          <li>
            <strong>in</strong> + <strong>Akkusativ</strong> + country{" "}
            <em>with</em> article — <em>in die Schweiz</em>,{" "}
            <em>in den Iran</em>
          </li>
        </ul>
        <ul className="grammar-example-list">
          <Ex de="Wir reisen nach Deutschland." />
          <Ex de="Wir fahren in die Schweiz." />
          <Ex de="Wir fliegen in den Iran." />
        </ul>
        <p className="grammar-note">
          <em>Wie heißt Ihr Land in Ihrer Sprache?</em> — What is your country
          called in your language?
        </p>
      </Section>

      <Section id="possessives" number={10} title="Possessive pronouns (mein …)">
        <p>Eight stems you meet constantly:</p>
        <div className="grammar-stem-grid">
          <span className="grammar-stem-chip">mein · my</span>
          <span className="grammar-stem-chip">dein · your (du)</span>
          <span className="grammar-stem-chip">sein · his / its</span>
          <span className="grammar-stem-chip">ihr · her</span>
          <span className="grammar-stem-chip">unser · our</span>
          <span className="grammar-stem-chip">euer · your (ihr)</span>
          <span className="grammar-stem-chip">ihr · their</span>
          <span className="grammar-stem-chip">Ihr · your (Sie)</span>
        </div>
        <p>
          Endings follow the same pattern as <strong>ein</strong> /{" "}
          <strong>kein</strong> — they agree with gender, case, and number.
        </p>
        <div className="grammar-table-wrap">
          <table className="grammar-lesson-table grammar-lesson-table--gender">
            <thead>
              <GenderTableHead />
            </thead>
            <tbody>
              <tr>
                <td>Nominativ</td>
                <td className="grammar-col grammar-col--der">mein</td>
                <td className="grammar-col grammar-col--das">mein</td>
                <td className="grammar-col grammar-col--die">meine</td>
                <td className="grammar-col grammar-col--die-pl">meine</td>
              </tr>
              <tr>
                <td>Akkusativ</td>
                <td className="grammar-col grammar-col--der">meinen</td>
                <td className="grammar-col grammar-col--das">mein</td>
                <td className="grammar-col grammar-col--die">meine</td>
                <td className="grammar-col grammar-col--die-pl">meine</td>
              </tr>
              <tr>
                <td>Dativ</td>
                <td className="grammar-col grammar-col--der">meinem</td>
                <td className="grammar-col grammar-col--das">meinem</td>
                <td className="grammar-col grammar-col--die">meiner</td>
                <td className="grammar-col grammar-col--die-pl">meinen</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout variant="insight" title="Same pattern as ein / kein">
          The endings on <em>mein, dein, sein …</em> work like{" "}
          <strong>ein</strong> and <strong>kein</strong> — only the stem changes.
        </Callout>
      </Section>

      <Section id="two-way" number={11} title="Two-way preposition: in">
        <p>
          <strong>in</strong> can take <strong>Dativ</strong> or{" "}
          <strong>Akkusativ</strong>:
        </p>
        <ul className="grammar-pattern-list">
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
        <div className="grammar-table-wrap">
          <table className="grammar-lesson-table grammar-lesson-table--compact">
            <tbody>
              <tr><td>ich</td><td>mich / mir</td></tr>
              <tr><td>du</td><td>dich / dir</td></tr>
              <tr><td>er / sie / es</td><td>sich</td></tr>
              <tr><td>wir</td><td>uns</td></tr>
              <tr><td>ihr</td><td>euch</td></tr>
              <tr><td>sie / Sie</td><td>sich</td></tr>
            </tbody>
          </table>
        </div>
        <ul className="grammar-example-list">
          <Ex de="Ich wasche mich." en="I wash myself." />
          <Ex de="Freust du dich?" en="Are you looking forward to it?" />
        </ul>
        <Callout title="Preview for later lessons">
          Whether you need <em>mich</em> or <em>mir</em> depends on the case the
          verb requires — you will practise this with common reflexive verbs in
          later Lektionen.
        </Callout>
      </Section>

      <footer className="grammar-lesson__footer">
        <Link href="/grammar" className="grammar-back-link">
          ← All grammar lessons
        </Link>
      </footer>
    </article>
  );
}
