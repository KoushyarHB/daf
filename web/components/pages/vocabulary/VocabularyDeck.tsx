"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import {
  invalidateCardQueries,
  useCardsQuery,
  useDeleteCardMutation,
  useFilterOptionsQuery,
  useImportStatusQuery,
  useUpdateCardProgressMutation,
  type FilterOptions,
  type ImportStatus,
} from "@/hooks/cards";
import { useDeckOptionsQuery } from "@/hooks/decks";
import { cardKeys } from "@/hooks/query-keys";
import type { PaginatedResponse } from "@/lib/api/types";
import { isPristineCommunityCard } from "@/lib/vocab/card-manage";
import type { EnrichedVocabCard } from "@/lib/vocab/types";

import CardFormModal from "./CardFormModal";
import DeckControls, {
  DEFAULT_DECK_FILTER_VALUES,
  hasActiveDeckFilters,
  type DeckFilters,
  PageSizeControl,
} from "./DeckControls";
import DeckEmpty from "./DeckEmpty";
import DeckLoading from "./DeckLoading";
import DeckPagination from "./DeckPagination";
import ImportTagPanel, {
  type TagImportOption,
} from "./ImportTagPanel";
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

type VocabularyDeckProps = {
  initialDeckId?: string;
  initialData?: PaginatedResponse<EnrichedVocabCard>;
  initialFilterOptions?: FilterOptions;
  initialUserDecks?: { id: string; name: string }[];
  initialImportStatus?: ImportStatus | null;
};

export default function VocabularyDeck({
  initialDeckId,
  initialData,
  initialFilterOptions,
  initialUserDecks = [],
  initialImportStatus = null,
}: VocabularyDeckProps) {
  const queryClient = useQueryClient();
  const { status: sessionStatus } = useSession();
  const toast = useToast();
  const hadServerSession =
    initialUserDecks.length > 0 || initialImportStatus !== null;
  const progressEnabled =
    sessionStatus === "authenticated" ||
    (sessionStatus === "loading" && hadServerSession);

  const [filters, setFilters] = useState<DeckFilters>(() => ({
    ...DEFAULT_DECK_FILTER_VALUES,
    deckId: initialDeckId ?? DEFAULT_DECK_FILTER_VALUES.deckId,
    view: "cards",
    pageSize: "25",
  }));
  const [currentPage, setCurrentPage] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingCard, setEditingCard] = useState<EnrichedVocabCard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedVocabCard | null>(null);
  const [prevSessionStatus, setPrevSessionStatus] = useState(sessionStatus);

  if (sessionStatus !== prevSessionStatus) {
    setPrevSessionStatus(sessionStatus);
    if (sessionStatus === "unauthenticated") {
      setFilters((prev) =>
        prev.studied === "all" ? prev : { ...prev, studied: "all" },
      );
    }
  }

  const listParams = useMemo(
    () => ({
      page: currentPage + 1,
      pageSize: apiPageSize(filters.pageSize),
      deckId: filters.deckId !== "all" ? filters.deckId : undefined,
      tag: filters.tag !== "all" ? filters.tag : undefined,
      level: filters.level !== "all" ? filters.level : undefined,
      pos: filters.pos !== "all" ? filters.pos : undefined,
      studied: progressEnabled ? studiedParam(filters.studied) : undefined,
      sort: filters.sort,
    }),
    [currentPage, filters, progressEnabled],
  );

  const cardsQuery = useCardsQuery(listParams, {
    initialData,
    initialDeckId,
  });
  const filterOptionsQuery = useFilterOptionsQuery({
    initialData: initialFilterOptions,
  });
  const importStatusQuery = useImportStatusQuery({
    enabled: progressEnabled,
    initialData: initialImportStatus ?? undefined,
  });
  const userDecksQuery = useDeckOptionsQuery({
    enabled: progressEnabled,
  });

  const updateProgress = useUpdateCardProgressMutation();
  const deleteCard = useDeleteCardMutation();

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: cardKeys.filterOptions() });
  }, [sessionStatus, queryClient]);

  const filterOptions = filterOptionsQuery.data ?? {
    tags: [],
    levels: [],
    posValues: [],
  };
  const importStatus = importStatusQuery.data ?? null;
  const userDecks =
    progressEnabled && userDecksQuery.data
      ? userDecksQuery.data
      : progressEnabled
        ? initialUserDecks
        : [];

  const data = cardsQuery.data ?? null;
  const loading = cardsQuery.isLoading;
  const refreshing = cardsQuery.isFetching && !cardsQuery.isLoading;
  const error = cardsQuery.error
    ? cardsQuery.error instanceof Error
      ? cardsQuery.error.message
      : "Failed to load cards"
    : null;

  const bumpReload = useCallback(
    (opts?: { showLoading?: boolean }) => {
      if (opts?.showLoading === false) {
        void invalidateCardQueries(queryClient);
        return;
      }
      void invalidateCardQueries(queryClient);
    },
    [queryClient],
  );

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
      "deckId" in patch ||
      "tag" in patch ||
      "level" in patch ||
      "pos" in patch ||
      "studied" in patch ||
      "sort" in patch ||
      "pageSize" in patch;
    if (resetsPage) setCurrentPage(0);
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const clearFilters = useCallback(() => {
    setCurrentPage(0);
    setFilters((prev) => ({ ...prev, ...DEFAULT_DECK_FILTER_VALUES }));
  }, []);

  const toggleStudied = useCallback(
    (domId: string) => {
      if (!progressEnabled) return;
      const card = items.find((c) => c.domId === domId);
      const nextStudied = !(card?.studied ?? false);
      updateProgress.mutate({ domId, studied: nextStudied });
    },
    [progressEnabled, items, updateProgress],
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
    if (deleteCard.isPending) return;
    setDeleteTarget(null);
  }, [deleteCard.isPending]);

  const confirmRemoveCard = useCallback(async () => {
    if (!deleteTarget) return;
    const card = deleteTarget;
    try {
      await deleteCard.mutateAsync(card.domId);
      toast.success(
        isPristineCommunityCard(card)
          ? "Card removed from your deck"
          : card.isCustomized
            ? "Customized card deleted"
            : "Card deleted",
      );
      setDeleteTarget(null);
    } catch {
      toast.error("Could not remove card. Try again.");
    }
  }, [deleteTarget, deleteCard, toast]);

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
          <Link href="/login" className="deck-hint-link">
            Sign in
          </Link>{" "}
          to create cards, save study progress, and manage your deck.
        </p>
      ) : null}

      {progressEnabled ? (
        <div className="deck-manage-bar">
          <button type="button" className="deck-add-card-btn" onClick={openCreate}>
            + Add card
          </button>
          <Link href="/decks" className="deck-import-link">
            My decks
          </Link>
          {importStatus && !importStatus.showImportOnHome ? (
            <Link href="/import-community-cards" className="deck-import-link">
              Import community cards
            </Link>
          ) : null}
        </div>
      ) : null}

      {progressEnabled && importStatus?.showImportOnHome ? (
        <ImportTagPanel
          options={importStatus.availableTags}
          onChanged={() => bumpReload({ showLoading: false })}
        />
      ) : null}

      <DeckControls
        userDecks={userDecks}
        tags={filterOptions.tags}
        levels={filterOptions.levels}
        posValues={filterOptions.posValues}
        filters={filters}
        progressEnabled={progressEnabled}
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
        onClearFilters={
          progressEnabled &&
          (importStatus?.importedTagSlugs.length ?? 0) === 0
            ? undefined
            : clearFilters
        }
      />

      {!loading && totalItems > 0 ? (
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
      ) : null}

      {loading && !data ? (
        <DeckLoading view={filters.view} />
      ) : totalItems === 0 ? (
        <DeckEmpty
          hasActiveFilters={hasActiveDeckFilters(filters, {
            includeStudied: progressEnabled,
          })}
          progressEnabled={progressEnabled}
          awaitingImport={
            progressEnabled &&
            (importStatus?.importedTagSlugs.length ?? 0) === 0 &&
            (importStatus?.availableTags.length ?? 0) > 0
          }
          onClearFilters={clearFilters}
          onAddCard={openCreate}
        />
      ) : (
        <div
          className={
            refreshing ? "deck-results deck-results--refreshing" : "deck-results"
          }
        >
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
        </div>
      )}

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
        loading={deleteCard.isPending}
        onConfirm={confirmRemoveCard}
        onCancel={cancelRemoveCard}
      />

      <CardFormModal
        open={editorOpen}
        mode={editorMode}
        card={editingCard}
        defaultDeckId={
          filters.deckId !== "all" ? filters.deckId : undefined
        }
        onClose={() => setEditorOpen(false)}
        onSaved={onCardSaved}
      />
    </>
  );
}
