import { posLabel } from "@/lib/vocab/types";
import type { EnrichedVocabCard } from "@/lib/vocab/types";

type VocabListProps = {
  cards: EnrichedVocabCard[];
  visibleIds: Set<string>;
  hidden?: boolean;
  onGoToCard: (domId: string) => void;
};

export default function VocabList({
  cards,
  visibleIds,
  hidden = false,
  onGoToCard,
}: VocabListProps) {
  return (
    <ol
      id="vocab-list"
      className={`vocab-list view-pane${hidden ? " is-hidden" : ""}`}
    >
      {cards.map((card) => {
        const isHidden = !visibleIds.has(card.domId);
        return (
          <li
            key={card.domId}
            className={`vocab-list-item${isHidden ? " is-hidden" : ""}`}
            data-card-id={card.domId}
            data-deck-no={card.deckNo}
            data-lektion={card.lektion ?? ""}
            data-pos={card.pos}
          >
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
          </li>
        );
      })}
    </ol>
  );
}
