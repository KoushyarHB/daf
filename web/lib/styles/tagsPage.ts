/** Shared layout / table classes for tags, decks, and admin pages. */

import {
  decksCreateSubmitClass,
  tagFormSubmitClass,
  tagsPageNewLinkClass,
  tagsTableBtnDangerClass,
  tagsTableBtnPrimaryClass,
  tagsTableBtnSecondaryClass,
} from "@/lib/styles/button";

export const tagsPageClass = "max-w-tags mx-auto px-5 py-4 pb-8";

export const tagsPageHeaderClass =
  "flex items-center justify-between gap-4 mb-2";

export const tagsPageIntroClass = "m-0 mb-4 text-[0.88rem] text-daf-body";

export const tagsPageBackClass = "mt-5 mb-0 text-[0.85rem]";

export const deckHintClass =
  "mb-[0.85rem] py-[0.45rem] pl-2.5 pr-0 text-[0.78rem] leading-normal text-daf-gray-en border-l-2 border-daf-border";

export const systemBadgeClass =
  "inline-block py-0.5 px-1.5 rounded-sm text-[0.72rem] font-semibold uppercase tracking-wide bg-daf-head-soft text-daf-head border border-daf-border-badge";

export const tagsTableWrapClass =
  "overflow-x-auto [-webkit-overflow-scrolling:touch] -mx-1 px-1";

export const tagsTableWrapRefreshingClass =
  "opacity-55 pointer-events-none";

export const tagsTableClass = "w-full border-collapse text-[0.88rem]";

export const tagsTableUsersClass = `${tagsTableClass} min-w-[36rem]`;

export const tagsTableDecksClass = `${tagsTableClass} min-w-[40rem]`;

export const tagsTableThTdClass =
  "text-left py-[0.45rem] px-2 border-b border-daf-border-table align-middle";

export const tagsTableActionsColClass =
  "w-44 min-w-44 max-w-44 text-center whitespace-nowrap align-middle";

export const tagsTableDecksActionsColClass =
  "w-52 min-w-52 max-w-52 text-center whitespace-nowrap align-middle";

export const tagsTableUsersRoleColClass = "min-w-[9.5rem]";

export const tagsTableActionsClass = "text-center";

export const tagsTableActionLinkClass =
  "inline-block align-middle text-[0.82rem] font-semibold text-daf-head no-underline hover:underline";

export const tagsTableActionGapClass = "ml-2";

export const tagsTableMutedClass = "text-daf-disabled text-[0.85rem]";

export const decksCreateFormClass =
  "flex flex-wrap gap-x-4 gap-y-3 items-end mb-5 px-4 max-w-[56rem]";

export const formLabelClass =
  "flex flex-col gap-[0.35rem] text-[0.85rem] font-semibold text-daf-label min-w-40";

export const adminSearchClass =
  "flex flex-col gap-[0.35rem] mb-4 max-w-[22rem] border-0 p-0";

export const adminSearchLabelClass =
  "text-[0.85rem] font-semibold text-daf-label";

export const adminSearchInputClass =
  "w-full block font-normal border border-daf-border-input rounded-md bg-daf-white shadow-none appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-cancel-button]:appearance-none";

export const tagFormClass =
  "max-w-md mx-auto px-5 py-4 pb-8 flex flex-col gap-3";

export const tagFormTitleClass = "m-0 mb-1 text-xl text-daf-head";

export const tagFormErrorClass = "text-daf-danger-alt text-[0.85rem] m-0";

export const tagFormActionsClass =
  "flex gap-3 items-center mt-2";

export const tagFormCancelClass = "text-[0.85rem] text-daf-head no-underline";

export const formSelectTableClass =
  "py-[0.35rem] pl-2 pr-7 text-[0.85rem] min-w-36 w-full max-w-44";

export {
  decksCreateSubmitClass,
  tagFormSubmitClass,
  tagsPageNewLinkClass,
  tagsTableBtnDangerClass,
  tagsTableBtnPrimaryClass,
  tagsTableBtnSecondaryClass,
};
