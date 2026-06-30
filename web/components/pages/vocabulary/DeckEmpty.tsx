import EmptyState from "@/components/shared/molecules/EmptyState";

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
      <EmptyState
        title="No cards match your filters"
        description="Try a broader tag, level, or type — or clear filters to see your full deck."
        actionLabel="Clear filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <EmptyState
      title="No vocabulary cards yet"
      description={
        progressEnabled
          ? awaitingImport
            ? "Import a tagged deck above, or create your first card."
            : "Add a card to start your deck, or import vocabulary from the community catalog."
          : "Your deck is empty. Sign in to add cards and track study progress."
      }
      actionLabel={
        progressEnabled && !awaitingImport
          ? "+ Add card"
          : progressEnabled
            ? undefined
            : "Sign in"
      }
      actionHref={progressEnabled || awaitingImport ? undefined : "/login"}
      onAction={
        progressEnabled && !awaitingImport ? onAddCard : undefined
      }
    />
  );
}
