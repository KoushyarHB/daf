import type { ViewMode } from "@/lib/vocab/types";

type DeckLoadingProps = {
  view: ViewMode;
};

function SkeletonLine({
  width,
  className = "",
}: {
  width: string;
  className?: string;
}) {
  return (
    <div
      className={`deck-skeleton-line${className ? ` ${className}` : ""}`}
      style={{ width }}
      aria-hidden="true"
    />
  );
}

function CardSkeleton() {
  return (
    <div className="deck-skeleton-card card" aria-hidden="true">
      <div className="deck-skeleton-head">
        <SkeletonLine width="42%" />
        <SkeletonLine width="18%" className="deck-skeleton-line--short" />
      </div>
      <SkeletonLine width="68%" className="deck-skeleton-line--indent" />
      <SkeletonLine width="55%" className="deck-skeleton-line--indent" />
      <SkeletonLine width="80%" className="deck-skeleton-line--example" />
    </div>
  );
}

function ListSkeletonRow({ delay }: { delay: number }) {
  return (
    <li
      className="deck-skeleton-list-row"
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <SkeletonLine width="2.5rem" className="deck-skeleton-line--num" />
      <div className="deck-skeleton-list-body">
        <SkeletonLine width="55%" />
        <SkeletonLine width="35%" className="deck-skeleton-line--short" />
      </div>
    </li>
  );
}

export default function DeckLoading({ view }: DeckLoadingProps) {
  return (
    <div
      className="deck-loading"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading vocabulary cards"
    >
      <p className="deck-loading-label">Loading cards…</p>
      {view === "list" ? (
        <ol className="deck-skeleton-list">
          {[0, 80, 160, 240, 320].map((delay) => (
            <ListSkeletonRow key={delay} delay={delay} />
          ))}
        </ol>
      ) : (
        <div className="deck-skeleton-cards">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}
    </div>
  );
}
