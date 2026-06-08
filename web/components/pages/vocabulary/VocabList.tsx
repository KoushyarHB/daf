import { cardEditLabel, cardRemoveLabel } from "@/lib/vocab/card-manage";
import { posLabel } from "@/lib/vocab/types";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import StudiedButton from "@/components/shared/StudiedButton";

type VocabListProps = {
  cards: EnrichedVocabCard[];
  visibleIds: Set<string>;
  hidden?: boolean;
  progressEnabled?: boolean;
  manageEnabled?: boolean;
  onGoToCard: (domId: string) => void;
  onToggleStudied: (domId: string) => void;
  onEdit?: (card: EnrichedVocabCard) => void;
  onRemove?: (card: EnrichedVocabCard) => void;
};

export default function VocabList({
  cards,
  visibleIds,
  hidden = false,
  progressEnabled = false,
  manageEnabled = false,
  onGoToCard,
  onToggleStudied,
  onEdit,
  onRemove,
}: VocabListProps) {
  return (
    <ol
      id="vocab-list"
      className={`vocab-list view-pane${hidden ? " is-hidden" : ""}`}
    >
      {cards.map((card) => {
        const isHidden = !visibleIds.has(card.domId);
        const studied = card.studied ?? false;
        return (
          <li
            key={card.domId}
            className={`vocab-list-item${isHidden ? " is-hidden" : ""}${studied ? " is-studied" : ""}`}
            data-card-id={card.domId}
            data-deck-no={card.deckNo}
            data-lektion={card.lektion ?? ""}
            data-pos={card.pos}
            data-studied={studied ? "true" : "false"}
          >
            {progressEnabled ? (
              <StudiedButton
                studied={studied}
                compact
                onToggle={() => onToggleStudied(card.domId)}
              />
            ) : null}
            <button
              type="button"
              className="vocab-list-link"
              onClick={() => onGoToCard(card.domId)}
            >
              <span className="vocab-list-no">{card.deckNo}</span>
              <span className="vocab-list-lemma">{card.listLabel}</span>
              {card.lektion != null ? (
                <span className="vocab-list-meta">L{card.lektion}</span>
              ) : null}
              {card.pos ? (
                <span className="vocab-list-meta vocab-list-pos">
                  {posLabel(card.pos)}
                </span>
              ) : null}
            </button>
            {manageEnabled && onEdit ? (
              <button
                type="button"
                className="vocab-list-manage-btn"
                onClick={() => onEdit(card)}
                aria-label={`${cardEditLabel(card)} card`}
              >
                {cardEditLabel(card)}
              </button>
            ) : null}
            {manageEnabled && onRemove ? (
              <button
                type="button"
                className="vocab-list-manage-btn vocab-list-manage-btn--danger"
                onClick={() => onRemove(card)}
                aria-label={`${cardRemoveLabel(card)} card`}
              >
                {cardRemoveLabel(card)}
              </button>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
