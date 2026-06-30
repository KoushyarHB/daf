/** Shared form field classes (tags, admin, decks). */
export const formInputClass =
  "font-inherit font-normal py-2 px-2.5 border border-[#d8e2ef] rounded-md bg-white text-[#111] transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-daf-head focus:shadow-[0_0_0_3px_rgba(47,111,184,0.18)]";

export const formSelectClass = `${formInputClass} appearance-none pr-8 cursor-pointer bg-[length:0.75rem] bg-[right_0.55rem_center] bg-no-repeat bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2012%2012%27%3E%3Cpath%20fill=%27%23555%27%20d=%27M2.5%204.5%206%208l3.5-3.5%27/%3E%3C/svg%3E')]`;

export const formPlaceholderClass = "placeholder:text-[#999]";

/** Auth form inputs — slightly taller padding than default form fields. */
export const authInputClass = `${formInputClass} py-[0.55rem] px-[0.65rem] border-daf-border focus:shadow-[0_0_0_3px_rgba(47,111,184,0.22)] autofill:shadow-[inset_0_0_0_1000px_#fff] autofill:[-webkit-text-fill-color:#111]`;
