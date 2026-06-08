import {
  cardEditLabel,
  cardRemoveLabel,
} from "@/lib/vocab/card-manage";
import { formatIpaDisplay } from "@/lib/vocab/card-utils";
import { posLabel } from "@/lib/vocab/types";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import PronounceButton from "@/components/shared/PronounceButton";
import StudiedButton from "@/components/shared/StudiedButton";
import ZoomableImage from "@/components/shared/ZoomableImage";
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

function HeadBlock({ head, ipa }: { head: string; ipa?: string | null }) {
  const lemma = head.trim();
  const ipaDisplay = formatIpaDisplay(ipa);
  if (ipaDisplay) {
    return (
      <div className="head">
        {lemma}
        <span className="head-ipa">{ipaDisplay}</span>
      </div>
    );
  }
  return <div className="head">{lemma}</div>;
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
  if (card.lektion != null) metaParts.push(`Lektion ${card.lektion}`);
  if (card.level) metaParts.push(card.level);

  const image = card.image?.trim();
  const editLabel = cardEditLabel(card);
  const removeLabel = cardRemoveLabel(card);

  return (
    <article
      id={`card-${card.domId}`}
      className={`card${hidden ? " is-hidden" : ""}${studied ? " is-studied" : ""}`}
      data-card-id={card.domId}
      data-deck-no={card.deckNo}
      data-lektion={card.lektion ?? ""}
      data-level={card.level}
      data-pos={card.pos}
      data-created-ms={card.createdMs}
    >
      <div className="head-line">
        <HeadBlock head={card.head} ipa={card.ipa} />
        <div className="head-actions">
          {manageEnabled && onEdit ? (
            <button
              type="button"
              className="card-manage-btn"
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
              className="card-manage-btn card-manage-btn--danger"
              onClick={onRemove}
              aria-label={`${removeLabel} card`}
              title={`${removeLabel} card`}
            >
              {removeLabel}
            </button>
          ) : null}
          {card.isCommunity && manageEnabled ? (
            <span className="card-community-badge" title="Community card">
              Community
            </span>
          ) : null}
          {card.isCustomized && manageEnabled ? (
            <span className="card-customized-badge" title="Your customized copy">
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
        <div className="meta">
          {metaParts.map((p) => (
            <span key={p}>{p}</span>
          ))}
          {card.pos ? (
            <span className="meta-pos">{posLabel(card.pos)}</span>
          ) : null}
        </div>
      ) : null}

      {card.pluralLine ? (
        <div className="plural-diagram">{card.pluralLine}</div>
      ) : null}

      {(card.gloss ?? []).map(
        (g, i) =>
          g.trim() ? (
            <p key={i} className="gloss">
              {g.trim()}
            </p>
          ) : null,
      )}

      {image ? (
        <div className="card-image">
          <ZoomableImage
            src={image}
            alt={`${card.head.trim()} image`}
          />
        </div>
      ) : null}

      {(card.notes ?? []).map(
        (n, i) =>
          n.trim() ? (
            <div key={i} className="notes">
              {n.trim()}
            </div>
          ) : null,
      )}

      {card.grammarTable ? (
        <GrammarTableBlock table={card.grammarTable} />
      ) : null}

      {card.examples.length > 0 ? (
        <div className="ex-block">
          {card.examples.map((ex, i) => {
            const de = (ex.german ?? "").trim();
            const en = ex.english;
            if (!de && !en) return null;
            return (
              <div key={i} className="ex-line">
                <PronounceButton audio={ex.audio} compact />
                <span className="ex-line-text">
                  <span className="chevr">›</span>
                  <span className="ex-de">{de}</span>
                  {en ? (
                    <>
                      {" "}
                      <span className="ex-en">({en.trim()})</span>
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

