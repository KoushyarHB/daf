import type { ReactNode } from "react";

/* ── Shared layout tokens ─────────────────────────────────────────── */

export const grammarPageClass =
  "mx-auto max-w-grammar px-5 pb-11 pt-4 md:px-7";

export const grammarPageTitleClass =
  "mb-[0.45rem] text-[1.65rem] font-bold tracking-tight text-daf-head";

export const grammarPageIntroClass =
  "m-0 text-[0.95rem] leading-[1.6] text-grm-slate";

export const grammarBreadcrumbClass =
  "mb-[0.85rem] flex items-center gap-[0.4rem] text-[0.8rem] text-daf-muted [&_a]:font-semibold [&_a]:text-daf-head [&_a]:no-underline hover:[&_a]:underline";

export const grammarSectionSubtitleClass =
  "mt-[1.1rem] mb-2 text-[0.9rem] font-bold text-daf-head";

export const grammarTableWrapClass =
  "my-3 overflow-x-auto rounded-lg border border-daf-border-table [-webkit-overflow-scrolling:touch]";

export const grammarLessonTableClass =
  "w-full border-collapse text-[0.84rem] [&_td]:border [&_td]:border-daf-border-nav [&_td]:p-2 [&_td]:text-left [&_td]:align-top [&_th]:border [&_th]:border-daf-border-nav [&_th]:bg-grm-panel-table [&_th]:p-2 [&_th]:text-left [&_th]:align-top [&_th]:font-bold";

export const grammarLessonColCaseClass =
  "whitespace-nowrap bg-grm-panel-table! p-[0.45rem_0.5rem]! text-left align-middle text-[0.74rem] font-bold text-daf-label";

export const grammarColHeadClass =
  "bg-grm-panel-table! p-[0.42rem_0.45rem] text-center align-middle text-[0.72rem] font-semibold text-grm-slate-meta";

export const grammarColDerClass =
  "bg-grm-der-bg p-[0.45rem_0.4rem] text-center font-extrabold text-grm-der";

export const grammarColDasClass =
  "bg-grm-das-bg p-[0.45rem_0.4rem] text-center font-extrabold text-grm-das";

export const grammarColDieClass =
  "bg-grm-die-bg p-[0.45rem_0.4rem] text-center font-extrabold text-grm-die";

export const grammarColPlClass =
  "bg-grm-pl-bg p-[0.45rem_0.4rem] text-center font-extrabold text-grm-pl";

export const grammarExampleListClass = "m-0 mt-2 list-none p-0";

export const grammarExampleListSpeakClass =
  "m-0 mt-2 flex list-none flex-col gap-[0.35rem] p-0 [&_li]:items-center";

export const grammarExampleClass =
  "flex items-start gap-[0.35rem] rounded-md border border-grm-panel-border-row bg-grm-panel p-[0.45rem_0.6rem] text-[0.86rem]";

export const grammarExampleMarkerClass =
  "shrink-0 text-[0.95rem] font-bold leading-[1.35] text-daf-blue";

export const grammarExampleDeClass =
  "text-[0.92rem] font-medium italic text-daf-blue";

export const grammarExampleEnClass =
  "ml-[0.3rem] text-[0.8rem] italic text-daf-gray-en";

export const grammarPatternListClass =
  "my-[0.35rem] mb-[0.65rem] pl-[1.15rem] text-[0.88rem] leading-[1.55] text-grm-slate [&_li]:mb-[0.35rem]";

export const grammarBackLinkClass =
  "inline-flex items-center gap-[0.35rem] rounded-md border border-grm-der-border bg-grm-der-bg px-3 py-[0.4rem] text-[0.88rem] font-bold text-daf-head no-underline hover:bg-daf-head-pale";

const GENDER_CHIP: Record<"m" | "f" | "n" | "pl", string> = {
  m: "border-grm-der-border bg-grm-der-bg text-grm-der",
  n: "border-grm-das-border bg-grm-das-bg text-grm-das",
  f: "border-grm-die-border bg-grm-die-bg text-grm-die",
  pl: "border-grm-pl-border bg-grm-pl-bg text-grm-pl",
};

const GENDER_CARD: Record<"m" | "f" | "n", string> = {
  m: "border-grm-der-border bg-grm-der-bg text-grm-der [&_li]:text-grm-der-text-dark",
  n: "border-grm-das-border bg-grm-das-bg text-grm-das [&_li]:text-grm-das-text",
  f: "border-grm-die-border bg-grm-die-bg text-grm-die [&_li]:text-grm-die-text",
};

const CALLOUT: Record<"tip" | "remember" | "insight", string> = {
  tip: "border border-grm-gold-border border-l-4 border-l-grm-gold bg-grm-gold-bg text-grm-gold-text [&_p]:text-inherit [&_h3]:text-grm-gold-title",
  remember:
    "border border-grm-der-border border-l-4 border-l-grm-der bg-grm-der-bg text-grm-der-text-dark [&_p]:text-inherit [&_h3]:text-grm-der",
  insight:
    "border border-grm-teal-border border-l-4 border-l-grm-teal bg-grm-teal-bg text-grm-teal-text [&_p]:text-inherit [&_h3]:text-grm-teal",
};

/* ── Components ─────────────────────────────────────────────────── */

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mb-[0.85rem] rounded-r-md border-l-[3px] border-l-grm-der bg-grammar-lead p-[0.65rem_0.85rem] text-[0.92rem] leading-[1.6] text-grm-slate-body">
      {children}
    </p>
  );
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
    <section
      id={id}
      className="mb-9 scroll-mt-[calc(var(--site-header-h,3.5rem)+0.85rem)] rounded-xl border border-daf-border-nav bg-white p-[1.15rem_1.1rem_1.2rem] shadow-section"
    >
      <header className="mb-[0.85rem] flex items-start gap-3 border-b-2 border-grm-panel-border-section pb-[0.65rem]">
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-daf-head text-[0.9rem] font-extrabold text-white shadow-hub-card-bar"
          aria-hidden="true"
        >
          {number}
        </span>
        <h2 className="m-0 pt-[0.15rem] text-[1.12rem] font-bold leading-snug text-grm-slate-heading">
          {title}
        </h2>
      </header>
      <div className="[&_p]:mb-[0.65rem] [&_p]:text-[0.9rem] [&_p]:leading-[1.6] [&_p]:text-grm-slate [&_p:last-child]:mb-0">
        {children}
      </div>
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
    <aside
      className={`mt-4 rounded-lg p-4 text-[0.86rem] leading-[1.55] ${CALLOUT[variant]}`}
    >
      {title ? (
        <p className="m-0 mb-[0.35rem] text-[0.8rem] font-extrabold tracking-wide uppercase">
          {title}
        </p>
      ) : null}
      <div className="[&_p]:m-0">{children}</div>
    </aside>
  );
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <p className="my-[0.35rem] mb-[0.65rem] rounded-md bg-grm-formula p-[0.5rem_0.75rem] font-mono text-[0.82rem] font-semibold tracking-wide text-grm-formula-text">
      {children}
    </p>
  );
}

export function Ex({ de, en }: { de: string; en?: string }) {
  return (
    <li className={grammarExampleClass}>
      <span className={grammarExampleMarkerClass} aria-hidden="true">
        ›
      </span>
      <span>
        <span className={grammarExampleDeClass}>{de}</span>
        {en ? <span className={grammarExampleEnClass}>({en})</span> : null}
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
  const widthClass = gender === "pl" ? "min-w-[7.25rem]" : "min-w-[5rem]";

  return (
    <span
      className={`box-border inline-flex shrink-0 ${widthClass} flex-col items-center justify-center gap-0.5 rounded-md border px-2 py-1.5 text-center ${GENDER_CHIP[gender]}`}
    >
      <span className="text-[0.92rem] leading-none font-extrabold">{article}</span>
      <span className="max-w-full text-[0.62rem] leading-tight font-semibold tracking-wide uppercase opacity-85">
        {label}
      </span>
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
    <div className={`rounded-[10px] border p-[0.85rem_0.9rem] ${GENDER_CARD[gender]}`}>
      <h3 className="m-0 mb-[0.55rem] text-[0.82rem] font-extrabold tracking-wide uppercase">
        {title}
      </h3>
      <ul className="m-0 list-none p-0">{children}</ul>
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
    <li className="flex flex-wrap items-baseline gap-1 border-b border-black/5 py-[0.32rem] text-[0.82rem] leading-[1.45] last:border-b-0">
      {suffix ? (
        <>
          <strong className="font-extrabold">{suffix}</strong>
          <span className="opacity-45" aria-hidden="true">
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
      <col className="w-[2.85rem]" />
      <col />
      <col />
      <col />
      <col />
    </colgroup>
  );
}

export function GenderTableHead() {
  const cols = [
    { label: "m.", className: grammarColHeadClass },
    { label: "n.", className: grammarColHeadClass },
    { label: "f.", className: grammarColHeadClass },
    { label: "pl.", className: grammarColHeadClass },
  ] as const;

  return (
    <tr>
      <th scope="col" className={grammarLessonColCaseClass}>
        Case
      </th>
      {cols.map((col) => (
        <th key={col.label} scope="col" className={col.className}>
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
  const borderTop =
    variant === "w" ? "border-t-[3px] border-t-grm-der" : "border-t-[3px] border-t-grm-teal";
  const formulaClass =
    variant === "w"
      ? "border border-grm-der-border bg-grm-der-bg text-grm-der-text"
      : "border border-grm-teal-border bg-grm-teal-bg text-grm-teal-text-alt";

  return (
    <div
      className={`rounded-[10px] border border-grm-panel-border bg-white p-[0.85rem_0.95rem] shadow-grammar ${borderTop}`}
    >
      <h3 className="m-0 mb-[0.45rem] text-[0.92rem] font-extrabold text-daf-head">
        {title}
      </h3>
      <p
        className={`m-0 mb-[0.55rem] rounded-md p-[0.45rem_0.6rem] text-[0.8rem] font-semibold leading-snug tracking-wide ${formulaClass}`}
      >
        {formula}
      </p>
      <div className="[&_li]:border-grm-panel-border-row [&_li]:bg-daf-panel-soft">{children}</div>
    </div>
  );
}
