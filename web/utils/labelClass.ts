const deckFilterLabelBase =
  "flex flex-col gap-[0.1rem] text-[0.58rem] font-semibold uppercase tracking-[0.05em] transition-colors duration-150";

export function labelClass(active: boolean): string {
  return `${deckFilterLabelBase} ${active ? "text-daf-head" : "text-[#777]"}`;
}

const deckFilterSelectBase =
  "font-inherit text-[0.78rem] font-normal normal-case tracking-normal text-[#222] py-[0.18rem] px-[0.32rem] border border-[#d8d8d8] rounded-[3px] bg-[#fafafa] min-w-[5.75rem] max-w-[9.5rem] appearance-auto transition-[border-color,background,color,box-shadow] duration-150 focus:outline-none focus:border-daf-head/45 focus:shadow-[0_0_0_2px_rgba(47,111,184,0.12)]";

const deckFilterSelectActive =
  "border-daf-head/52 bg-[#eef4fc] text-[#1a4a85] font-semibold shadow-[inset_0_0_0_1px_rgba(47,111,184,0.14)]";

export function deckFilterSelectClass(active: boolean): string {
  return active
    ? `${deckFilterSelectBase} ${deckFilterSelectActive}`
    : deckFilterSelectBase;
}

const deckClearFiltersBase =
  "appearance-none box-border min-w-[3.25rem] py-[0.18rem] px-[0.32rem] font-inherit text-[0.78rem] font-normal normal-case tracking-normal text-[#222] bg-[#fafafa] border border-[#d8d8d8] rounded-[3px] cursor-pointer whitespace-nowrap hover:enabled:border-[#c8c8c8] hover:enabled:bg-[#f5f5f5] focus-visible:outline-none focus-visible:border-daf-head/45 focus-visible:shadow-[0_0_0_2px_rgba(47,111,184,0.12)] disabled:text-[#aaa] disabled:bg-[#fafafa] disabled:border-[#e8e8e8] disabled:cursor-default disabled:opacity-55";

export function deckClearFiltersClass(active: boolean): string {
  return active
    ? `${deckClearFiltersBase} border-daf-head/52 bg-[#eef4fc] text-[#1a4a85] font-semibold shadow-[inset_0_0_0_1px_rgba(47,111,184,0.14)]`
    : deckClearFiltersBase;
}

export const pageSizeLabelClass = deckFilterLabelBase + " text-[#777]";

const pageSizeSelectBase =
  "font-inherit text-[0.78rem] font-normal normal-case tracking-normal text-[#222] border border-[#d8d8d8] rounded-[3px] bg-[#fafafa] min-w-0 w-[3.15rem] max-w-[3.75rem] py-[0.18rem] pl-[0.28rem] pr-[0.15rem] text-center transition-[border-color,background,color,box-shadow] duration-150 focus:outline-none focus:border-daf-head/45 focus:shadow-[0_0_0_2px_rgba(47,111,184,0.12)]";

export const pageSizeSelectClass = pageSizeSelectBase;
