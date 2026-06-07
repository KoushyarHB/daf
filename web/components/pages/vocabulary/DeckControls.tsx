import { posLabel, type SortOrder, type ViewMode, type VocabPos } from "@/lib/vocab/types";
export type DeckFilters = {
  lektion: string;
  level: string;
  pos: string;
  sort: SortOrder;
  view: ViewMode;
  pageSize: string;
};

type DeckControlsProps = {
  lektions: number[];
  levels: string[];
  posValues: VocabPos[];
  filters: DeckFilters;
  countText: string;
  pageSizeControl?: React.ReactNode;
  onChange: (patch: Partial<DeckFilters>) => void;
};

function labelClass(active: boolean): string {
  return active ? "is-active" : "";
}

export default function DeckControls({
  lektions,
  levels,
  posValues,
  filters,
  countText,
  pageSizeControl,
  onChange,
}: DeckControlsProps) {
  return (
    <div className="deck-controls" role="region" aria-label="Filter and sort">
      <div className="deck-controls-row">
        <label className={labelClass(filters.lektion !== "all")}>
          Lektion{" "}
          <select
            id="filter-lektion"
            value={filters.lektion}
            onChange={(e) => onChange({ lektion: e.target.value })}
          >
            <option value="all">All</option>
            {lektions.map((n) => (
              <option key={n} value={String(n)}>
                Lektion {n}
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
        <label className={labelClass(filters.sort !== "deck")}>
          Sort{" "}
          <select
            id="sort-order"
            value={filters.sort}
            onChange={(e) =>
              onChange({ sort: e.target.value as SortOrder })
            }
          >
            <option value="deck">Deck order (#)</option>
            <option value="date-desc">Date: newest first</option>
            <option value="date-asc">Date: oldest first</option>
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
