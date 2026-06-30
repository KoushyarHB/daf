const deckFilterLabelBase =
  "flex flex-col gap-[0.1rem] text-[0.58rem] font-semibold uppercase tracking-[0.05em] transition-colors duration-150";

export function labelClass(active: boolean): string {
  return `${deckFilterLabelBase} ${active ? "text-daf-head" : "text-daf-faint"}`;
}

const deckFilterSelectBase =
  "font-inherit text-[0.78rem] font-normal normal-case tracking-normal text-daf-text py-[0.18rem] px-[0.32rem] border border-daf-border-control rounded-[3px] bg-daf-panel min-w-[5.75rem] max-w-[9.5rem] appearance-auto transition-[border-color,background,color,box-shadow] duration-150 focus:outline-none focus:border-daf-head/45 focus:shadow-daf-ring";

const deckFilterSelectActive =
  "border-daf-head/52 bg-daf-head-soft text-daf-head-active font-semibold shadow-daf-inset-active";

export function deckFilterSelectClass(active: boolean): string {
  return active
    ? `${deckFilterSelectBase} ${deckFilterSelectActive}`
    : deckFilterSelectBase;
}

const deckClearFiltersBase =
  "appearance-none box-border min-w-[3.25rem] py-[0.18rem] px-[0.32rem] font-inherit text-[0.78rem] font-normal normal-case tracking-normal text-daf-text bg-daf-panel border border-daf-border-control rounded-[3px] cursor-pointer whitespace-nowrap hover:enabled:border-daf-icon-muted/80 hover:enabled:bg-daf-panel-alt focus-visible:outline-none focus-visible:border-daf-head/45 focus-visible:shadow-daf-ring disabled:text-daf-disabled disabled:bg-daf-panel disabled:border-daf-border-row disabled:cursor-default disabled:opacity-55";

export function deckClearFiltersClass(active: boolean): string {
  return active
    ? `${deckClearFiltersBase} border-daf-head/52 bg-daf-head-soft text-daf-head-active font-semibold shadow-daf-inset-active`
    : deckClearFiltersBase;
}

export const pageSizeLabelClass = deckFilterLabelBase + " text-daf-faint";

const pageSizeSelectBase =
  "font-inherit text-[0.78rem] font-normal normal-case tracking-normal text-daf-text border border-daf-border-control rounded-[3px] bg-daf-panel min-w-0 w-[3.15rem] max-w-[3.75rem] py-[0.18rem] pl-[0.28rem] pr-[0.15rem] text-center transition-[border-color,background,color,box-shadow] duration-150 focus:outline-none focus:border-daf-head/45 focus:shadow-daf-ring";

export const pageSizeSelectClass = pageSizeSelectBase;
