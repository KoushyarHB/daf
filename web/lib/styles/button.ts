import { cn } from "@/utils/cn";

/** Tailwind class maps for `<Button>` — not components; import from atoms/Button for UI. */
export const buttonBaseClass =
  "inline-flex items-center justify-center font-inherit cursor-pointer appearance-none rounded border border-transparent font-semibold whitespace-nowrap transition-[background,border-color,box-shadow,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-none";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "ghostDanger"
  | "link"
  | "text"
  | "ai"
  | "outline"
  | "tablePrimary"
  | "tableSecondary"
  | "tableDanger";

export type ButtonSize = "md" | "sm" | "xs" | "compact" | "block";

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-[0.85rem] py-[0.45rem] text-[0.85rem]",
  sm: "py-1.5 px-[0.85rem] text-[0.85rem]",
  xs: "py-[0.28rem] px-[0.55rem] text-[0.8rem] leading-tight min-w-[4.75rem] text-center",
  compact: "px-[0.7rem] py-[0.35rem] text-[0.78rem]",
  block: "w-full px-4 py-2.5 text-[0.95rem] text-center shadow-sm",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-daf-head-dark bg-daf-head text-white hover:bg-daf-head-dark focus-visible:ring-2 focus-visible:ring-daf-head/40",
  secondary:
    "border-daf-border-muted bg-daf-panel-alt text-daf-body hover:bg-daf-panel",
  danger:
    "border-daf-danger-text bg-daf-danger-btn text-white hover:bg-daf-danger-hover",
  ghost:
    "border-0 bg-transparent p-0 text-[0.8rem] text-daf-head hover:underline",
  ghostDanger:
    "border-0 bg-transparent p-0 text-[1.1rem] leading-none text-daf-icon-muted hover:text-daf-danger",
  link: "border-0 bg-transparent p-0 font-medium text-daf-head no-underline hover:underline hover:underline-offset-2",
  text: "border-0 bg-transparent p-0 text-[0.8rem] font-semibold text-daf-head underline underline-offset-2 hover:text-daf-head-link",
  ai: "shrink-0 border-daf-head/45 bg-gradient-to-b from-daf-ai-from to-daf-head-soft text-daf-ai-text hover:border-daf-head/65 hover:from-daf-ai-hover-from hover:to-daf-ai-hover-to disabled:opacity-55",
  outline:
    "shrink-0 border-daf-head/45 bg-daf-white font-mono text-daf-ai-text hover:border-daf-head/65 hover:bg-daf-head-softer disabled:opacity-55",
  tablePrimary:
    "inline-block align-middle text-white bg-daf-head border-daf-head-dark rounded-[5px] min-w-[6.75rem] hover:bg-daf-head-hover hover:border-daf-head-link hover:text-white focus:border-daf-head focus:shadow-daf-focus-lg disabled:opacity-55",
  tableSecondary:
    "inline-flex align-middle text-daf-head bg-daf-white border-daf-border-badge rounded-[5px] no-underline hover:bg-daf-head-soft hover:border-grm-hub-card-hover hover:text-daf-head-link",
  tableDanger:
    "inline-block align-middle text-daf-danger-strong bg-daf-danger-bg border-daf-danger-border rounded-[5px] min-w-[4.75rem] hover:bg-daf-danger-bg-hover hover:border-daf-danger-border-hover hover:text-daf-danger-hover focus:border-daf-danger-border-focus focus:shadow-danger-focus disabled:opacity-55",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  const sizeClass =
    variant === "ghost" ||
    variant === "ghostDanger" ||
    variant === "link" ||
    variant === "text"
      ? ""
      : sizeClasses[size];

  return cn(buttonBaseClass, sizeClass, variantClasses[variant], className);
}

/** @deprecated Prefer `<Button variant="tablePrimary" />`. */
export const tagsTableBtnPrimaryClass = buttonClassName("tablePrimary", "xs");

/** @deprecated Prefer `<Button variant="tableSecondary" />`. */
export const tagsTableBtnSecondaryClass = buttonClassName("tableSecondary", "xs");

/** @deprecated Prefer `<Button variant="tableDanger" />`. */
export const tagsTableBtnDangerClass = buttonClassName("tableDanger", "xs");

/** @deprecated Prefer `<Button variant="primary" size="sm" />`. */
export const tagFormSubmitClass = buttonClassName("primary", "sm", "border-0");

/** @deprecated Prefer `<Button variant="primary" size="sm" />`. */
export const decksCreateSubmitClass = buttonClassName("primary", "sm");

/** @deprecated Prefer `<SubmitButton />`. */
export const authSubmitButtonClass = cn(
  buttonClassName("primary", "block", "mt-2 border-0"),
);

/** @deprecated Prefer `<Button variant="primary" size="compact" />`. */
export const deckEmptyActionClass = buttonClassName(
  "primary",
  "compact",
  "inline-block py-[0.4rem] px-[0.85rem] no-underline",
);

/** @deprecated Prefer `<PageHeader actionHref … />`. */
export const tagsPageNewLinkClass = buttonClassName(
  "primary",
  "sm",
  "no-underline py-1.5 px-2.5",
);
