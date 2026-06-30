import type { ReactNode } from "react";

export function Lead({ children }: { children: ReactNode }) {
  return <p className="grammar-lead">{children}</p>;
}

export function Section({
  id,
  title,
  number,
  children,
}: {
  id: string;
  title: string;
  number: number;
  children: ReactNode;
}) {
  return (
    <section id={id} className="grammar-section">
      <header className="grammar-section__head">
        <span className="grammar-section__num" aria-hidden="true">
          {number}
        </span>
        <h2 className="grammar-section__title">{title}</h2>
      </header>
      <div className="grammar-section__body">{children}</div>
    </section>
  );
}

export function Callout({
  title,
  variant = "tip",
  children,
}: {
  title?: string;
  variant?: "tip" | "remember" | "insight";
  children: ReactNode;
}) {
  return (
    <aside className={`grammar-callout grammar-callout--${variant}`}>
      {title ? <p className="grammar-callout__title">{title}</p> : null}
      <div className="grammar-callout__body">{children}</div>
    </aside>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return <p className="grammar-formula">{children}</p>;
}

export function Ex({ de, en }: { de: string; en?: string }) {
  return (
    <li className="grammar-example">
      <span className="grammar-example__marker" aria-hidden="true">
        ›
      </span>
      <span className="grammar-example__text">
        <span className="grammar-example__de">{de}</span>
        {en ? <span className="grammar-example__en">({en})</span> : null}
      </span>
    </li>
  );
}

export function GenderChip({
  article,
  label,
  gender,
}: {
  article: string;
  label: string;
  gender: "m" | "f" | "n" | "pl";
}) {
  return (
    <span className={`grammar-gender-chip grammar-gender-chip--${gender}`}>
      <span className="grammar-gender-chip__article">{article}</span>
      <span className="grammar-gender-chip__label">{label}</span>
    </span>
  );
}

export function GenderPatternCard({
  gender,
  title,
  children,
}: {
  gender: "m" | "f" | "n";
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`grammar-gender-card grammar-gender-card--${gender}`}>
      <h3 className="grammar-gender-card__title">{title}</h3>
      <ul className="grammar-gender-card__list">{children}</ul>
    </div>
  );
}

export function PatternItem({
  suffix,
  children,
}: {
  suffix?: string;
  children: ReactNode;
}) {
  return (
    <li className="grammar-gender-card__item">
      {suffix ? (
        <>
          <strong className="grammar-gender-card__suffix">{suffix}</strong>
          <span className="grammar-gender-card__sep" aria-hidden="true">
            —
          </span>
        </>
      ) : null}
      <span>{children}</span>
    </li>
  );
}

export function GenderTableColGroup() {
  return (
    <colgroup>
      <col className="grammar-lesson-col-case" />
      <col />
      <col />
      <col />
      <col />
    </colgroup>
  );
}

export function GenderTableHead() {
  const cols = [
    { label: "m.", className: "grammar-col--der" },
    { label: "n.", className: "grammar-col--das" },
    { label: "f.", className: "grammar-col--die" },
    { label: "pl.", className: "grammar-col--die-pl" },
  ] as const;

  return (
    <tr>
      <th scope="col" className="grammar-lesson-col-case">
        Case
      </th>
      {cols.map((col) => (
        <th
          key={col.className}
          scope="col"
          className={`grammar-col ${col.className}`}
        >
          {col.label}
        </th>
      ))}
    </tr>
  );
}

export function QuestionTypeCard({
  title,
  formula,
  variant = "w",
  children,
}: {
  title: string;
  formula: ReactNode;
  variant?: "w" | "yesno";
  children: ReactNode;
}) {
  return (
    <div className={`grammar-qtype-card grammar-qtype-card--${variant}`}>
      <h3 className="grammar-qtype-card__title">{title}</h3>
      <p className="grammar-qtype-card__formula">{formula}</p>
      {children}
    </div>
  );
}
