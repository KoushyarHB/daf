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
    <nav className="deck-pagination" id="pagination" aria-label="Pagination">
      <div className="deck-pagination-inner">
        <div className="deck-pagination-size" id="page-size-slot">
          <div className="page-size-desktop-only">
            <PageSizeControl value={pageSize} onChange={onPageSizeChange} />
          </div>
        </div>
        <div className="deck-pagination-nav">
          <button
            type="button"
            id="page-first"
            className="page-edge page-edge--jump"
            disabled={atStart}
            aria-label="First page"
            onClick={onFirst}
          >
            <ChevronDoubleLeftIcon className="heroicon heroicon--double" aria-hidden />
          </button>
          <button
            type="button"
            id="page-prev"
            className="page-edge"
            disabled={atStart}
            aria-label="Previous page"
            onClick={onPrev}
          >
            <ChevronLeftIcon className="heroicon" aria-hidden />
          </button>
          <span
            className="page-current"
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
            className="page-edge"
            disabled={atEnd}
            aria-label="Next page"
            onClick={onNext}
          >
            <ChevronRightIcon className="heroicon" aria-hidden />
          </button>
          <button
            type="button"
            id="page-last"
            className="page-edge page-edge--jump"
            disabled={atEnd}
            aria-label="Last page"
            onClick={onLast}
          >
            <ChevronDoubleRightIcon
              className="heroicon heroicon--double"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </nav>
  );
}
