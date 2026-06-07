import { formatIpaDisplay } from "@/lib/vocab/card-utils";
import { posLabel } from "@/lib/vocab/types";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import PronounceButton from "@/components/shared/PronounceButton";
import ZoomableImage from "@/components/shared/ZoomableImage";
import GrammarTableBlock from "./GrammarTable";

type VocabCardProps = {
  card: EnrichedVocabCard;
  hidden?: boolean;
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

export default function VocabCard({ card, hidden = false }: VocabCardProps) {
  const metaParts: string[] = [`#${card.deckNo}`];
  if (card.lektion != null) metaParts.push(`Lektion ${card.lektion}`);
  if (card.level) metaParts.push(card.level);

  const image = card.image?.trim();

  return (
    <article
      id={`card-${card.domId}`}
      className={`card${hidden ? " is-hidden" : ""}`}
      data-card-id={card.domId}
      data-deck-no={card.deckNo}
      data-lektion={card.lektion ?? ""}
      data-level={card.level}
      data-pos={card.pos}
      data-created-ms={card.createdMs}
    >
      <div className="head-line">
        <HeadBlock head={card.head} ipa={card.ipa} />
        <PronounceButton audio={card.audio} />
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

