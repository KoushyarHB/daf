"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { isPristineCommunityCard } from "@/lib/vocab/card-manage";
import type { PaginatedResponse } from "@/lib/api/types";
import type { EnrichedVocabCard, VocabPos } from "@/lib/vocab/types";

import CardFormModal from "./CardFormModal";
import DeckControls, {
  DEFAULT_DECK_FILTER_VALUES,
  type DeckFilters,
  PageSizeControl,
} from "./DeckControls";
import DeckPagination from "./DeckPagination";
import VocabCard from "./VocabCard";
import VocabList from "./VocabList";

function apiPageSize(pageSize: string): number {
  if (pageSize === "all") return 100;
  const n = parseInt(pageSize, 10);
  return Number.isNaN(n) || n < 1 ? 20 : Math.min(n, 100);
}

function studiedParam(studied: DeckFilters["studied"]): string | undefined {
  if (studied === "studied") return "true";
  if (studied === "unstudied") return "false";
  return undefined;
}

function deckCountText(
  page: number,
  pageSize: number,
  pageItems: number,
  totalItems: number,
): string {
  if (totalItems === 0) return "0 cards";
  if (pageSize >= totalItems && page === 1) {
    return `${totalItems} cards`;
  }
  const start = (page - 1) * pageSize + 1;
  const end = (page - 1) * pageSize + pageItems;
  return `Showing ${start}\u2013${end} of ${totalItems}`;
}

export default function VocabularyDeck() {
  const { status: sessionStatus } = useSession();
  const toast = useToast();
  const progressEnabled = sessionStatus === "authenticated";

  const [filterOptions, setFilterOptions] = useState<{
    lektions: number[];
    levels: string[];
    posValues: VocabPos[];
  }>({ lektions: [], levels: [], posValues: [] });

  const [filters, setFilters] = useState<DeckFilters>({
    ...DEFAULT_DECK_FILTER_VALUES,
    view: "cards",
    pageSize: "25",
  });
  const [currentPage, setCurrentPage] = useState(0);

  const [data, setData] = useState<PaginatedResponse<EnrichedVocabCard> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingCard, setEditingCard] = useState<EnrichedVocabCard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedVocabCard | null>(null);
  const [deleting, setDeleting] = useState(false);

  const bumpReload = useCallback(() => {
    setLoading(true);
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    fetch("/api/cards/filter-options")
      .then((r) => r.json())
      .then(setFilterOptions)
      .catch(() => { });
  }, [reloadToken, sessionStatus]);

  useEffect(() => {
    if (filters.studied !== "all" && sessionStatus === "unauthenticated") {
      return;
    }

    const params = new URLSearchParams();
    params.set("page", String(currentPage + 1));
    params.set("pageSize", String(apiPageSize(filters.pageSize)));
    if (filters.lektion !== "all") params.set("lektion", filters.lektion);
    if (filters.level !== "all") params.set("level", filters.level);
    if (filters.pos !== "all") params.set("pos", filters.pos);
    const studied = studiedParam(filters.studied);
    if (studied) params.set("studied", studied);
    params.set("sort", filters.sort);

    const ac = new AbortController();
    let pending = true;

    void (async () => {
      try {
        const res = await fetch(`/api/cards?${params}`, { signal: ac.signal });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json = (await res.json()) as PaginatedResponse<EnrichedVocabCard>;
        if (!pending) return;
        setData(json);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!pending || (err instanceof DOMException && err.name === "AbortError")) {
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load cards");
        setData(null);
        setLoading(false);
      }
    })();

    return () => {
      pending = false;
      ac.abort();
    };
  }, [currentPage, filters, sessionStatus, reloadToken]);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const totalItems = data?.totalItems ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));

  const pageIds = useMemo(
    () => new Set(items.map((c) => c.domId)),
    [items],
  );

  const countText = deckCountText(
    data?.page ?? 1,
    data?.pageSize ?? apiPageSize(filters.pageSize),
    items.length,
    totalItems,
  );

  const updateFilters = useCallback((patch: Partial<DeckFilters>) => {
    const resetsPage =
      "lektion" in patch ||
      "level" in patch ||
      "pos" in patch ||
      "studied" in patch ||
      "sort" in patch ||
      "pageSize" in patch;
    if (resetsPage) setCurrentPage(0);
    setLoading(true);
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setLoading(true);
    setCurrentPage(page);
  }, []);

  const clearFilters = useCallback(() => {
    setCurrentPage(0);
    setLoading(true);
    setFilters((prev) => ({ ...prev, ...DEFAULT_DECK_FILTER_VALUES }));
  }, []);

  const toggleStudied = useCallback(
    async (domId: string) => {
      if (!progressEnabled) return;

      const card = items.find((c) => c.domId === domId);
      const nextStudied = !(card?.studied ?? false);

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((c) =>
            c.domId === domId ? { ...c, studied: nextStudied } : c,
          ),
        };
      });

      try {
        const res = await fetch(
          `/api/cards/${encodeURIComponent(domId)}/progress`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studied: nextStudied }),
          },
        );
        if (!res.ok) throw new Error("save failed");
      } catch {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((c) =>
              c.domId === domId ? { ...c, studied: !nextStudied } : c,
            ),
          };
        });
      }
    },
    [progressEnabled, items],
  );

  const openCreate = useCallback(() => {
    setEditorMode("create");
    setEditingCard(null);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((card: EnrichedVocabCard) => {
    setEditorMode("edit");
    setEditingCard(card);
    setEditorOpen(true);
  }, []);

  const requestRemoveCard = useCallback((card: EnrichedVocabCard) => {
    setDeleteTarget(card);
  }, []);

  const cancelRemoveCard = useCallback(() => {
    if (deleting) return;
    setDeleteTarget(null);
  }, [deleting]);

  const confirmRemoveCard = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const card = deleteTarget;
    try {
      const res = await fetch(`/api/cards/${encodeURIComponent(card.domId)}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 200) throw new Error("Remove failed");
      toast.success(
        isPristineCommunityCard(card)
          ? "Card removed from your deck"
          : card.isCustomized
            ? "Customized card deleted"
            : "Card deleted",
      );
      setDeleteTarget(null);
      bumpReload();
    } catch {
      toast.error("Could not remove card. Try again.");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, bumpReload, toast]);

  const onCardSaved = useCallback(() => {
    bumpReload();
  }, [bumpReload]);

  const goToCard = useCallback(
    (domId: string) => {
      const idx = items.findIndex((c) => c.domId === domId);
      if (idx < 0) return;
      setFilters((prev) => ({ ...prev, view: "cards" }));
      requestAnimationFrame(() => {
        document.getElementById(`card-${domId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    },
    [items],
  );

  if (error) {
    return (
      <p className="deck-error" role="alert">
        {error}
        {error.includes("authentication") || error.includes("Unauthorized") ? (
          <>
            {" "}
            <a href="/login">Sign in</a> to filter by studied status.
          </>
        ) : null}
      </p>
    );
  }

  return (
    <>
      {!progressEnabled && sessionStatus !== "loading" ? (
        <p className="deck-hint">
          <a href="/login">Sign in</a> to save studied progress, add cards, and customize
          the deck.
        </p>
      ) : null}

      {progressEnabled ? (
        <div className="deck-manage-bar">
          <button type="button" className="deck-add-card-btn" onClick={openCreate}>
            + Add card
          </button>
        </div>
      ) : null}

      <DeckControls
        lektions={filterOptions.lektions}
        levels={filterOptions.levels}
        posValues={filterOptions.posValues}
        filters={filters}
        countText={loading ? "Loading…" : countText}
        pageSizeControl={
          <div className="page-size-mobile-only">
            <PageSizeControl
              value={filters.pageSize}
              onChange={(v) => updateFilters({ pageSize: v })}
            />
          </div>
        }
        onChange={updateFilters}
        onClearFilters={clearFilters}
      />

      <DeckPagination
        currentPage={safePage}
        totalPages={Math.max(1, totalPages)}
        totalItems={totalItems}
        pageSize={filters.pageSize}
        onPageSizeChange={(v) => updateFilters({ pageSize: v })}
        onFirst={() => goToPage(0)}
        onPrev={() => goToPage(Math.max(0, safePage - 1))}
        onNext={() => goToPage(safePage + 1)}
        onLast={() => goToPage(Math.max(0, totalPages - 1))}
      />

      <VocabList
        cards={items}
        visibleIds={pageIds}
        hidden={filters.view !== "list"}
        progressEnabled={progressEnabled}
        manageEnabled={progressEnabled}
        onGoToCard={goToCard}
        onToggleStudied={toggleStudied}
        onEdit={openEdit}
        onRemove={requestRemoveCard}
      />

      <div
        id="deck"
        className={`view-pane${filters.view !== "cards" ? " is-hidden" : ""}`}
      >
        {items.map((card) => (
          <VocabCard
            key={card.domId}
            card={card}
            hidden={false}
            progressEnabled={progressEnabled}
            manageEnabled={progressEnabled}
            onToggleStudied={() => toggleStudied(card.domId)}
            onEdit={() => openEdit(card)}
            onRemove={() => requestRemoveCard(card)}
          />
        ))}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title={
          deleteTarget && isPristineCommunityCard(deleteTarget)
            ? "Remove from deck"
            : "Delete card"
        }
        message={
          deleteTarget && isPristineCommunityCard(deleteTarget)
            ? "Remove this community card from your deck? The shared card stays available for others."
            : deleteTarget?.isCustomized
              ? "Delete your customized copy? The original community card can appear in your deck again."
              : "Delete this card permanently? This cannot be undone."
        }
        confirmLabel={
          deleteTarget && isPristineCommunityCard(deleteTarget) ? "Remove" : "Delete"
        }
        danger
        loading={deleting}
        onConfirm={confirmRemoveCard}
        onCancel={cancelRemoveCard}
      />

      <CardFormModal
        open={editorOpen}
        mode={editorMode}
        card={editingCard}
        onClose={() => setEditorOpen(false)}
        onSaved={onCardSaved}
      />
    </>
  );
}
