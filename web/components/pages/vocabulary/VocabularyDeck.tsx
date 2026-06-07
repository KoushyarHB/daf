"use client";

import { useCallback, useMemo, useState } from "react";
import { collectFilterOptions } from "@/lib/vocab/card-utils";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import DeckControls, {
  type DeckFilters,
  PageSizeControl,
} from "./DeckControls";
import DeckPagination from "./DeckPagination";
import VocabCard from "./VocabCard";
import VocabList from "./VocabList";

type VocabularyDeckProps = {
  cards: EnrichedVocabCard[];
};

function pageSizeValue(pageSize: string): number {
  if (pageSize === "all") return 0;
  const n = parseInt(pageSize, 10);
  return Number.isNaN(n) || n < 1 ? 25 : n;
}

function filterAndSort(
  cards: EnrichedVocabCard[],
  filters: DeckFilters,
): EnrichedVocabCard[] {
  let visible = cards.filter((card) => {
    if (filters.lektion !== "all" && String(card.lektion) !== filters.lektion) {
      return false;
    }
    if (filters.level !== "all" && card.level !== filters.level) {
      return false;
    }
    return true;
  });

  if (filters.sort === "date-asc") {
    visible = [...visible].sort((a, b) => a.createdMs - b.createdMs);
  } else if (filters.sort === "date-desc") {
    visible = [...visible].sort((a, b) => b.createdMs - a.createdMs);
  }

  return visible;
}

function deckCountText(
  visible: EnrichedVocabCard[],
  deckTotal: number,
  pageSize: string,
  currentPage: number,
): string {
  const size = pageSizeValue(pageSize);
  const total = visible.length;
  if (total === 0) {
    return `0 of ${deckTotal} cards`;
  }
  if (size === 0) {
    return `${total} of ${deckTotal} cards`;
  }
  const start = currentPage * size;
  const end = Math.min(start + size, total);
  return `Showing ${start + 1}\u2013${end} of ${total} (deck ${deckTotal})`;
}

export default function VocabularyDeck({ cards }: VocabularyDeckProps) {
  const deckTotal = cards.length;
  const { lektions, levels } = useMemo(
    () => collectFilterOptions(cards),
    [cards],
  );

  const [filters, setFilters] = useState<DeckFilters>({
    lektion: "all",
    level: "all",
    sort: "deck",
    view: "cards",
    pageSize: "25",
  });
  const [currentPage, setCurrentPage] = useState(0);

  const visible = useMemo(
    () => filterAndSort(cards, filters),
    [cards, filters],
  );

  const size = pageSizeValue(filters.pageSize);
  const totalPages =
    size === 0 ? 1 : Math.max(1, Math.ceil(visible.length / size));
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));

  const pageSlice = useMemo(() => {
    if (size === 0) return visible;
    const start = safePage * size;
    return visible.slice(start, start + size);
  }, [visible, safePage, size]);

  const pageIds = useMemo(
    () => new Set(pageSlice.map((c) => c.domId)),
    [pageSlice],
  );

  const countText = deckCountText(
    visible,
    deckTotal,
    filters.pageSize,
    safePage,
  );

  const updateFilters = useCallback((patch: Partial<DeckFilters>) => {
    const resetsPage =
      "lektion" in patch ||
      "level" in patch ||
      "sort" in patch ||
      "pageSize" in patch;
    if (resetsPage) setCurrentPage(0);
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const goToCard = useCallback(
    (domId: string) => {
      const idx = visible.findIndex((c) => c.domId === domId);
      if (idx < 0) return;
      const ps = pageSizeValue(filters.pageSize);
      setFilters((prev) => ({ ...prev, view: "cards" }));
      if (ps > 0) setCurrentPage(Math.floor(idx / ps));
      requestAnimationFrame(() => {
        document.getElementById(`card-${domId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    },
    [visible, filters.pageSize],
  );

  const cardHidden = (card: EnrichedVocabCard): boolean => {
    if (!pageIds.has(card.domId)) return true;
    if (filters.lektion !== "all" && String(card.lektion) !== filters.lektion) {
      return true;
    }
    if (filters.level !== "all" && card.level !== filters.level) {
      return true;
    }
    return false;
  };

  return (
    <>
      <DeckControls
        lektions={lektions}
        levels={levels}
        filters={filters}
        countText={countText}
        pageSizeControl={
          <div className="page-size-mobile-only">
            <PageSizeControl
              value={filters.pageSize}
              onChange={(v) => updateFilters({ pageSize: v })}
            />
          </div>
        }
        onChange={updateFilters}
      />

      <DeckPagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={visible.length}
        pageSize={filters.pageSize}
        onPageSizeChange={(v) => updateFilters({ pageSize: v })}
        onFirst={() => setCurrentPage(0)}
        onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
        onNext={() => setCurrentPage((p) => p + 1)}
        onLast={() => setCurrentPage(totalPages - 1)}
      />

      <VocabList
        cards={visible}
        visibleIds={pageIds}
        hidden={filters.view !== "list"}
        onGoToCard={goToCard}
      />

      <div
        id="deck"
        className={`view-pane${filters.view !== "cards" ? " is-hidden" : ""}`}
      >
        {filters.sort === "deck"
          ? cards.map((card) => (
              <VocabCard
                key={card.domId}
                card={card}
                hidden={cardHidden(card)}
              />
            ))
          : pageSlice.map((card) => (
              <VocabCard key={card.domId} card={card} hidden={false} />
            ))}
      </div>
    </>
  );
}
