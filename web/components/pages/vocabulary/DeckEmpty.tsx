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
          Try a broader Lektion, level, or part of speech — or reset filters to
          see the full deck.
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
      <p className="deck-empty-title">No cards here yet</p>
      <p className="deck-empty-text">
        {progressEnabled
          ? awaitingImport
            ? "Import a Lektion above to add the shared vocabulary deck, or create your own card."
            : "Add a card to build your deck, or import more community vocabulary from Import community cards."
          : "The shared vocabulary deck is empty for now. Sign in to add your own cards."}
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
