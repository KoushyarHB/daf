/** Shared form field classes (tags, admin, decks). */
export const formInputClass =
  "font-inherit font-normal py-2 px-2.5 border border-daf-border-input rounded-md bg-daf-white text-daf-ink transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-daf-head focus:shadow-daf-focus";

export const formSelectClass = `${formInputClass} appearance-none pr-8 cursor-pointer bg-[length:0.75rem] bg-[right_0.55rem_center] bg-no-repeat bg-daf-select-chevron`;

export const formPlaceholderClass = "placeholder:text-daf-disabled";

/** Auth form inputs — slightly taller padding than default form fields. */
export const authInputClass = `${formInputClass} py-[0.55rem] px-[0.65rem] border-daf-border focus:shadow-daf-focus-lg autofill:shadow-[inset_0_0_0_1000px_var(--color-daf-white)] autofill:[-webkit-text-fill-color:var(--color-daf-ink)]`;
