import Link from "next/link";

type DeckEmptyProps = {
  hasActiveFilters: boolean;
  progressEnabled: boolean;
  awaitingImport?: boolean;
  onClearFilters: () => void;
  onAddCard: () => void;
};

const deckEmptyClass =
  "my-6 mb-8 py-7 px-5 text-center bg-white border border-daf-border rounded-lg shadow-[0_1px_2px_rgb(0_0_0/4%)]";

const deckEmptyActionClass =
  "appearance-none inline-block py-[0.4rem] px-[0.85rem] font-inherit text-[0.8rem] font-semibold text-white bg-daf-head border border-daf-head-dark rounded cursor-pointer no-underline hover:bg-daf-head-dark";

export default function DeckEmpty({
  hasActiveFilters,
  progressEnabled,
  awaitingImport = false,
  onClearFilters,
  onAddCard,
}: DeckEmptyProps) {
  if (hasActiveFilters && !awaitingImport) {
    return (
      <div className={deckEmptyClass} role="status">
        <p className="m-0 mb-[0.45rem] text-[0.95rem] font-semibold text-daf-head">
          No cards match your filters
        </p>
        <p className="mx-auto mb-4 max-w-[22rem] text-[0.82rem] leading-normal text-daf-gray-en">
          Try a broader tag, level, or type — or clear filters to see your full
          deck.
        </p>
        <button
          type="button"
          className={deckEmptyActionClass}
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className={deckEmptyClass} role="status">
      <p className="m-0 mb-[0.45rem] text-[0.95rem] font-semibold text-daf-head">
        No vocabulary cards yet
      </p>
      <p className="mx-auto mb-4 max-w-[22rem] text-[0.82rem] leading-normal text-daf-gray-en">
        {progressEnabled
          ? awaitingImport
            ? "Import a tagged deck above, or create your first card."
            : "Add a card to start your deck, or import vocabulary from the community catalog."
          : "Your deck is empty. Sign in to add cards and track study progress."}
      </p>
      {progressEnabled && !awaitingImport ? (
        <button type="button" className={deckEmptyActionClass} onClick={onAddCard}>
          + Add card
        </button>
      ) : progressEnabled ? null : (
        <Link href="/login" className={deckEmptyActionClass}>
          Sign in
        </Link>
      )}
    </div>
  );
}
