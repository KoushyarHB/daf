import { posLabel, type VocabPos } from "@/lib/vocab/types";
import type { SortOrder, StudiedFilter, ViewMode } from "@/lib/vocab/types";
import {
  DEFAULT_DECK_FILTER_VALUES,
  type DeckFilters,
} from "@/utils/deckFilters";
import { hasActiveDeckFilters } from "@/utils/hasActiveDeckFilters";
import { labelClass } from "@/utils/labelClass";

export {
  DEFAULT_DECK_FILTER_VALUES,
  type DeckFilters,
} from "@/utils/deckFilters";

type TagOption = { slug: string; label: string };
type UserDeckOption = { id: string; name: string };

type DeckControlsProps = {
  userDecks?: UserDeckOption[];
  tags: TagOption[];
  levels: string[];
  posValues: VocabPos[];
  filters: DeckFilters;
  countText: string;
  progressEnabled?: boolean;
  pageSizeControl?: React.ReactNode;
  onChange: (patch: Partial<DeckFilters>) => void;
  onClearFilters?: () => void;
};

export default function DeckControls({
  userDecks = [],
  tags,
  levels,
  posValues,
  filters,
  countText,
  progressEnabled = false,
  pageSizeControl,
  onChange,
  onClearFilters,
}: DeckControlsProps) {
  const filtersActive = hasActiveDeckFilters(filters, {
    includeStudied: progressEnabled,
  });

  return (
    <div className="deck-controls" role="region" aria-label="Filter and sort">
      <div className="deck-controls-row">
        {userDecks.length > 0 ? (
          <label className={labelClass(filters.deckId !== "all")}>
            My deck{" "}
            <select
              id="filter-deck"
              value={filters.deckId}
              onChange={(e) => onChange({ deckId: e.target.value })}
            >
              <option value="all">All my cards</option>
              {userDecks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className={labelClass(filters.tag !== "all")}>
          Tag{" "}
          <select
            id="filter-tag"
            value={filters.tag}
            onChange={(e) => onChange({ tag: e.target.value })}
          >
            <option value="all">All</option>
            {tags.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass(filters.level !== "all")}>
          Level{" "}
          <select
            id="filter-level"
            value={filters.level}
            onChange={(e) => onChange({ level: e.target.value })}
          >
            <option value="all">All</option>
            {levels.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass(filters.pos !== "all")}>
          Type{" "}
          <select
            id="filter-pos"
            value={filters.pos}
            onChange={(e) => onChange({ pos: e.target.value })}
          >
            <option value="all">All</option>
            {posValues.map((p) => (
              <option key={p} value={p}>
                {posLabel(p)}
              </option>
            ))}
          </select>
        </label>
        {progressEnabled ? (
          <label className={labelClass(filters.studied !== "all")}>
            Studied{" "}
            <select
              id="filter-studied"
              value={filters.studied}
              onChange={(e) =>
                onChange({ studied: e.target.value as StudiedFilter })
              }
            >
              <option value="all">All</option>
              <option value="studied">Studied</option>
              <option value="unstudied">Not studied</option>
            </select>
          </label>
        ) : null}
        <label
          className={labelClass(
            filters.sort !== DEFAULT_DECK_FILTER_VALUES.sort,
          )}
        >
          Sort{" "}
          <select
            id="sort-order"
            value={filters.sort}
            onChange={(e) =>
              onChange({ sort: e.target.value as SortOrder })
            }
          >
            <option value="deck-desc">Deck #: high → low</option>
            <option value="deck-asc">Deck #: low → high</option>
            <option value="date-desc">Created: newest first</option>
            <option value="date-asc">Created: oldest first</option>
          </select>
        </label>
        <label className={labelClass(filters.view !== "cards")}>
          View{" "}
          <select
            id="view-mode"
            value={filters.view}
            onChange={(e) => onChange({ view: e.target.value as ViewMode })}
          >
            <option value="cards">Cards</option>
            <option value="list">List</option>
          </select>
        </label>
        <div id="page-size-controls-slot">{pageSizeControl}</div>
        {onClearFilters ? (
          <label className={labelClass(filtersActive)}>
            Reset{" "}
            <button
              type="button"
              className="deck-clear-filters"
              onClick={onClearFilters}
              disabled={!filtersActive}
              aria-label="Clear all filters"
            >
              Clear
            </button>
          </label>
        ) : null}
      </div>
      <p className="deck-count" id="deck-count" aria-live="polite">
        {countText}
      </p>
    </div>
  );
}

export function PageSizeControl({
  value,
  onChange,
  id = "page-size",
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  return (
    <label id="page-size-label" className="page-size-control">
      Per page{" "}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="all">All</option>
      </select>
    </label>
  );
}
