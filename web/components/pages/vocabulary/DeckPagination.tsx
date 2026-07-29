import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { PageSizeControl } from "./DeckControls";

type DeckPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: string;
  onPageSizeChange: (v: string) => void;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
};

const pageEdgeClass =
  "inline-flex items-center justify-center w-7 h-7 p-0 border-none rounded bg-transparent text-daf-head cursor-pointer transition-[color,background] duration-150 shrink-0 hover:enabled:bg-daf-head-panel disabled:cursor-default disabled:text-daf-head-line [&_svg]:w-4 [&_svg]:h-4 [&_svg]:block [&_svg]:shrink-0";

const pageEdgeJumpClass = "w-auto min-w-7 px-[0.1rem] [&_svg]:w-[1.35rem]";

export default function DeckPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageSizeChange,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: DeckPaginationProps) {
  const sizeNum = pageSize === "all" ? 0 : parseInt(pageSize, 10);
  const disabled = totalItems === 0 || sizeNum === 0;
  const atStart = currentPage <= 0 || disabled;
  const atEnd = currentPage >= totalPages - 1 || disabled;

  let pageLabel: string;
  if (totalItems === 0) {
    pageLabel = "—";
  } else if (sizeNum === 0) {
    pageLabel = "1";
  } else {
    pageLabel = String(currentPage + 1);
  }

  return (
    <nav
      className="sticky top-[var(--site-header-h,4.55rem)] z-90 mb-[0.85rem] py-[0.45rem] px-[0.55rem] bg-daf-white border border-daf-border rounded-md"
      id="pagination"
      aria-label="Pagination"
    >
      <div className="relative flex items-center justify-center min-h-[2.1rem] py-[0.05rem] max-sm:min-h-[1.85rem]">
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[1] shrink-0 max-sm:hidden"
          id="page-size-slot"
        >
          <div className="hidden sm:block">
            <PageSizeControl value={pageSize} onChange={onPageSizeChange} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-[0.2rem]">
          <button
            type="button"
            id="page-first"
            className={`${pageEdgeClass} ${pageEdgeJumpClass}`}
            disabled={atStart}
            aria-label="First page"
            onClick={onFirst}
          >
            <ChevronDoubleLeftIcon aria-hidden />
          </button>
          <button
            type="button"
            id="page-prev"
            className={pageEdgeClass}
            disabled={atStart}
            aria-label="Previous page"
            onClick={onPrev}
          >
            <ChevronLeftIcon aria-hidden />
          </button>
          <span
            className="text-[0.92rem] font-bold text-daf-head min-w-7 text-center leading-none px-[0.15rem]"
            id="page-current"
            aria-live="polite"
            {...(totalItems > 0 && sizeNum !== 0
              ? { "aria-current": "page" as const }
              : {})}
          >
            {pageLabel}
          </span>
          <button
            type="button"
            id="page-next"
            className={pageEdgeClass}
            disabled={atEnd}
            aria-label="Next page"
            onClick={onNext}
          >
            <ChevronRightIcon aria-hidden />
          </button>
          <button
            type="button"
            id="page-last"
            className={`${pageEdgeClass} ${pageEdgeJumpClass}`}
            disabled={atEnd}
            aria-label="Last page"
            onClick={onLast}
          >
            <ChevronDoubleRightIcon aria-hidden />
          </button>
        </div>
      </div>
    </nav>
  );
}
