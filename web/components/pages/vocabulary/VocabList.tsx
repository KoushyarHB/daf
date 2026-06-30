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

const listClass =
  "mb-4 p-0 list-none bg-white border border-daf-border rounded-md";

const listItemClass =
  "flex items-center gap-[0.45rem] py-[0.42rem] px-[0.65rem] border-b border-daf-border-row last:border-b-0";

const listLinkClass =
  "group flex-1 min-w-0 flex items-baseline gap-[0.55rem] text-inherit no-underline text-[0.95rem] bg-transparent border-none p-0 cursor-pointer text-left font-inherit";

const listManageBtnClass =
  "shrink-0 ml-[0.35rem] py-[0.2rem] px-[0.45rem] border border-daf-border-badge-soft rounded bg-daf-list-manage text-daf-head text-[0.68rem] font-semibold cursor-pointer";

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
      className={`${listClass}${hidden ? " hidden" : ""}`}
    >
      {cards.map((card) => {
        const isHidden = !visibleIds.has(card.domId);
        const studied = card.studied ?? false;
        return (
          <li
            key={card.domId}
            className={`${listItemClass}${isHidden ? " hidden" : ""}`}
            data-card-id={card.domId}
            data-deck-no={card.deckNo}
            data-tags={card.tags?.map((t) => t.slug).join(",") ?? ""}
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
              className={listLinkClass}
              onClick={() => onGoToCard(card.domId)}
            >
              <span className="font-bold text-daf-hint min-w-8 shrink-0">
                {card.deckNo}
              </span>
              <span
                className={`font-semibold text-daf-text group-hover:text-daf-head group-hover:underline${studied ? " text-daf-subtle" : ""}`}
              >
                {card.listLabel}
              </span>
              {card.tags?.length ? (
                <span className="text-[0.72rem] text-daf-hint shrink-0">
                  {card.tags.map((t) => t.label).join(", ")}
                </span>
              ) : null}
              {card.pos ? (
                <span className="text-[0.72rem] text-daf-head font-semibold shrink-0">
                  {posLabel(card.pos)}
                </span>
              ) : null}
            </button>
            {manageEnabled && onEdit ? (
              <button
                type="button"
                className={listManageBtnClass}
                onClick={() => onEdit(card)}
                aria-label={`${cardEditLabel(card)} card`}
              >
                {cardEditLabel(card)}
              </button>
            ) : null}
            {manageEnabled && onRemove ? (
              <button
                type="button"
                className={`${listManageBtnClass} text-daf-danger-btn border-daf-border-danger-soft bg-daf-danger-list-bg`}
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
