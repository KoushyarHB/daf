import Link from "next/link";

type DeckEmptyProps = {
  hasActiveFilters: boolean;
  progressEnabled: boolean;
  awaitingImport?: boolean;
  onClearFilters: () => void;
  onAddCard: () => void;
};

export default function DeckEmpty({
  hasActiveFilters,
  progressEnabled,
  awaitingImport = false,
  onClearFilters,
  onAddCard,
}: DeckEmptyProps) {
  if (hasActiveFilters && !awaitingImport) {
    return (
      <div className="deck-empty" role="status">
        <p className="deck-empty-title">No cards match your filters</p>
        <p className="deck-empty-text">
          Try a broader tag, level, or type — or clear filters to see your full
          deck.
        </p>
        <button
          type="button"
          className="deck-empty-action"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="deck-empty" role="status">
      <p className="deck-empty-title">No vocabulary cards yet</p>
      <p className="deck-empty-text">
        {progressEnabled
          ? awaitingImport
            ? "Import a tagged deck above, or create your first card."
            : "Add a card to start your deck, or import vocabulary from the community catalog."
          : "Your deck is empty. Sign in to add cards and track study progress."}
      </p>
      {progressEnabled && !awaitingImport ? (
        <button type="button" className="deck-empty-action" onClick={onAddCard}>
          + Add card
        </button>
      ) : progressEnabled ? null : (
        <Link href="/login" className="deck-empty-action deck-empty-action--link">
          Sign in
        </Link>
      )}
    </div>
  );
}
