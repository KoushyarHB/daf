import {
  cardEditLabel,
  cardRemoveLabel,
} from "@/lib/vocab/card-manage";
import { formatIpaDisplay } from "@/lib/vocab/card-utils";
import { posLabel } from "@/lib/vocab/types";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import PronounceButton from "@/components/pages/vocabulary/PronounceButton";
import StudiedButton from "@/components/pages/vocabulary/StudiedButton";
import ZoomableImage from "@/components/shared/organisms/media/ZoomableImage";
import GrammarTableBlock from "./GrammarTable";

type VocabCardProps = {
  card: EnrichedVocabCard;
  hidden?: boolean;
  progressEnabled?: boolean;
  manageEnabled?: boolean;
  onToggleStudied?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
};

const cardClass =
  "border-b border-daf-border py-[0.9rem] first:pt-0";

const cardManageBtnClass =
  "appearance-none py-[0.12rem] px-[0.4rem] font-inherit text-[0.68rem] font-semibold text-daf-head bg-daf-head-soft border border-daf-head/40 rounded-[3px] cursor-pointer";

function HeadBlock({ head, ipa }: { head: string; ipa?: string | null }) {
  const lemma = head.trim();
  const ipaDisplay = formatIpaDisplay(ipa);
  if (ipaDisplay) {
    return (
      <div className="font-bold mb-0">
        {lemma}
        <span className="font-normal text-[0.88em] text-daf-muted">{ipaDisplay}</span>
      </div>
    );
  }
  return <div className="font-bold mb-0">{lemma}</div>;
}

export default function VocabCard({
  card,
  hidden = false,
  progressEnabled = false,
  manageEnabled = false,
  onToggleStudied,
  onEdit,
  onRemove,
}: VocabCardProps) {
  const studied = card.studied ?? false;
  const metaParts: string[] = [`#${card.deckNo}`];
  if (card.tags?.length) {
    metaParts.push(card.tags.map((t) => t.label).join(", "));
  }
  if (card.level) metaParts.push(card.level);

  const image = card.image?.trim();
  const editLabel = cardEditLabel(card);
  const removeLabel = cardRemoveLabel(card);

  return (
    <article
      id={`card-${card.domId}`}
      className={`${cardClass}${hidden ? " hidden" : ""}${studied ? " opacity-[0.92]" : ""}`}
      data-card-id={card.domId}
      data-deck-no={card.deckNo}
      data-tags={card.tags?.map((t) => t.slug).join(",") ?? ""}
      data-level={card.level}
      data-pos={card.pos}
      data-created-ms={card.createdMs}
    >
      <div className="flex items-center gap-[0.45rem] flex-wrap mb-[0.35rem]">
        <HeadBlock head={card.head} ipa={card.ipa} />
        <div className="inline-flex items-center gap-[0.35rem] shrink-0">
          {manageEnabled && onEdit ? (
            <button
              type="button"
              className={cardManageBtnClass}
              onClick={onEdit}
              aria-label={`${editLabel} card`}
              title={`${editLabel} card`}
            >
              {editLabel}
            </button>
          ) : null}
          {manageEnabled && onRemove ? (
            <button
              type="button"
              className={`${cardManageBtnClass} text-daf-danger-text bg-daf-danger-card-bg border-daf-danger/25`}
              onClick={onRemove}
              aria-label={`${removeLabel} card`}
              title={`${removeLabel} card`}
            >
              {removeLabel}
            </button>
          ) : null}
          {card.isCommunity && manageEnabled ? (
            <span
              className="text-[0.62rem] font-semibold uppercase tracking-[0.04em] text-daf-community bg-daf-community-bg border border-daf-community-border rounded-[3px] py-[0.1rem] px-[0.35rem]"
              title="Community card"
            >
              Community
            </span>
          ) : null}
          {card.isCustomized && manageEnabled ? (
            <span
              className="text-[0.62rem] font-semibold uppercase tracking-[0.04em] text-daf-customized bg-daf-customized-bg border border-daf-customized-border rounded-[3px] py-[0.1rem] px-[0.35rem]"
              title="Your customized copy"
            >
              Customized
            </span>
          ) : null}
          <PronounceButton audio={card.audio} />
          {progressEnabled && onToggleStudied ? (
            <StudiedButton studied={studied} onToggle={onToggleStudied} />
          ) : null}
        </div>
      </div>

      {metaParts.length > 0 || card.pos ? (
        <div className="text-xs text-daf-muted mb-2 [&_span]:mr-3">
          {metaParts.map((p) => (
            <span key={p}>{p}</span>
          ))}
          {card.pos ? (
            <span className="font-semibold text-daf-head">{posLabel(card.pos)}</span>
          ) : null}
        </div>
      ) : null}

      {card.pluralLine ? (
        <div className="my-[0.25rem] mb-[0.35rem] pl-[0.6rem] border-l-[3px] border-daf-border-muted text-[11pt] text-daf-ink">
          {card.pluralLine}
        </div>
      ) : null}

      {(card.gloss ?? []).map(
        (g, i) =>
          g.trim() ? (
            <p
              key={i}
              className="my-[0.35rem] pl-[0.6rem] border-l-[3px] border-daf-border-muted"
            >
              {g.trim()}
            </p>
          ) : null,
      )}

      {image ? (
        <div className="mt-[0.6rem] pl-[0.6rem]">
          <ZoomableImage
            src={image}
            alt={`${card.head.trim()} image`}
          />
        </div>
      ) : null}

      {(card.notes ?? []).map(
        (n, i) =>
          n.trim() ? (
            <div
              key={i}
              className="text-[10pt] italic text-daf-notes pl-[0.6rem] my-[0.35rem]"
            >
              {n.trim()}
            </div>
          ) : null,
      )}

      {card.grammarTable ? (
        <GrammarTableBlock table={card.grammarTable} />
      ) : null}

      {card.examples.length > 0 ? (
        <div className="mt-[0.45rem] pl-[0.6rem]">
          {card.examples.map((ex, i) => {
            const de = (ex.german ?? "").trim();
            const en = ex.english;
            if (!de && !en) return null;
            return (
              <div
                key={i}
                className="flex items-center gap-[0.32rem] text-[10.5pt] italic my-1"
              >
                <PronounceButton audio={ex.audio} compact />
                <span className="flex-1 min-w-0">
                  <span className="text-daf-blue mr-[0.15em]">›</span>
                  <span className="text-daf-blue">{de}</span>
                  {en ? (
                    <>
                      {" "}
                      <span className="text-daf-gray-en">({en.trim()})</span>
                    </>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
