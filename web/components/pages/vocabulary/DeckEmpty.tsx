import Link from "next/link";

type DeckEmptyProps = {
  hasActiveFilters: boolean;
  progressEnabled: boolean;
  onClearFilters: () => void;
  onAddCard: () => void;
};

export default function DeckEmpty({
  hasActiveFilters,
  progressEnabled,
  onClearFilters,
  onAddCard,
}: DeckEmptyProps) {
  if (hasActiveFilters) {
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
          ? "Add a card to start building your deck, or check back once community vocabulary is loaded."
          : "The shared vocabulary deck is empty for now. Sign in to add your own cards."}
      </p>
      {progressEnabled ? (
        <button type="button" className="deck-empty-action" onClick={onAddCard}>
          + Add card
        </button>
      ) : (
        <Link href="/login" className="deck-empty-action deck-empty-action--link">
          Sign in
        </Link>
      )}
    </div>
  );
}
