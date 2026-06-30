import type { ViewMode } from "@/lib/vocab/types";

type DeckLoadingProps = {
  view: ViewMode;
};

const skeletonLineClass =
  "h-[0.65rem] bg-[#e4e8ec] rounded-[3px] animate-deck-shimmer";

function SkeletonLine({
  width,
  className = "",
}: {
  width: string;
  className?: string;
}) {
  return (
    <div
      className={`${skeletonLineClass}${className ? ` ${className}` : ""}`}
      style={{ width }}
      aria-hidden="true"
    />
  );
}

const skeletonCardClass =
  "pointer-events-none border-b border-daf-border py-[0.9rem] first:pt-0";

function CardSkeleton({ lineDelay = "0ms" }: { lineDelay?: string }) {
  const delayStyle = { animationDelay: lineDelay };
  return (
    <div className={skeletonCardClass} aria-hidden="true">
      <div className="flex items-center gap-2 mb-[0.35rem]">
        <div
          className={skeletonLineClass}
          style={{ width: "42%", ...delayStyle }}
          aria-hidden="true"
        />
        <div
          className={`${skeletonLineClass} h-[0.55rem]`}
          style={{ width: "18%", ...delayStyle }}
          aria-hidden="true"
        />
      </div>
      <div
        className={`${skeletonLineClass} mt-[0.45rem] ml-[0.4rem]`}
        style={{ width: "68%", ...delayStyle }}
        aria-hidden="true"
      />
      <div
        className={`${skeletonLineClass} mt-[0.45rem] ml-[0.4rem]`}
        style={{ width: "55%", ...delayStyle }}
        aria-hidden="true"
      />
      <div
        className={`${skeletonLineClass} mt-[0.55rem] ml-[0.4rem] h-2 opacity-85`}
        style={{ width: "80%", ...delayStyle }}
        aria-hidden="true"
      />
    </div>
  );
}

function ListSkeletonRow({ delay }: { delay: number }) {
  return (
    <li
      className="flex items-center gap-[0.65rem] py-[0.55rem] border-b border-daf-border"
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <SkeletonLine width="2.5rem" className="h-2 shrink-0" />
      <div className="flex-1 flex flex-col gap-[0.35rem]">
        <SkeletonLine width="55%" />
        <SkeletonLine width="35%" className="h-[0.55rem]" />
      </div>
    </li>
  );
}

export default function DeckLoading({ view }: DeckLoadingProps) {
  return (
    <div
      className="my-2 mb-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading vocabulary cards"
    >
      <p className="m-0 mb-[0.85rem] text-[0.78rem] text-daf-gray-en tracking-[0.01em]">
        Loading cards…
      </p>
      {view === "list" ? (
        <ol className="list-none m-0 p-0 border-t border-daf-border">
          {[0, 80, 160, 240, 320].map((delay) => (
            <ListSkeletonRow key={delay} delay={delay} />
          ))}
        </ol>
      ) : (
        <div>
          <CardSkeleton />
          <CardSkeleton lineDelay="120ms" />
          <CardSkeleton lineDelay="240ms" />
        </div>
      )}
    </div>
  );
}
