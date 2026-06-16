"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { isPristineCommunityCard } from "@/lib/vocab/card-manage";
import type { PaginatedResponse } from "@/lib/api/types";
import type { EnrichedVocabCard, VocabPos } from "@/lib/vocab/types";

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

type ImportStatus = {
  importedTagSlugs: string[];
  availableTags: TagImportOption[];
  hasUserCreatedCard: boolean;
  showImportOnHome: boolean;
};

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

type FilterOptions = {
  tags: { slug: string; label: string }[];
  levels: string[];
  posValues: VocabPos[];
};

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
  const { status: sessionStatus } = useSession();
  const toast = useToast();
  const hadServerSession =
    initialUserDecks.length > 0 || initialImportStatus !== null;
  const progressEnabled =
    sessionStatus === "authenticated" ||
    (sessionStatus === "loading" && hadServerSession);

  const [userDecks, setUserDecks] = useState(initialUserDecks);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>(
    initialFilterOptions ?? { tags: [], levels: [], posValues: [] },
  );

  const [filters, setFilters] = useState<DeckFilters>(() => ({
    ...DEFAULT_DECK_FILTER_VALUES,
    deckId: initialDeckId ?? DEFAULT_DECK_FILTER_VALUES.deckId,
    view: "cards",
    pageSize: "25",
  }));
  const [currentPage, setCurrentPage] = useState(0);

  const [data, setData] = useState<PaginatedResponse<EnrichedVocabCard> | null>(
    initialData ?? null,
  );
  const [loading, setLoading] = useState(!initialData);
  const skipInitialCardsFetch = useRef(Boolean(initialData));
  const skipInitialFilterOptionsFetch = useRef(Boolean(initialFilterOptions));
  const skipInitialUserDecksFetch = useRef(initialUserDecks.length > 0);
  const skipInitialImportStatusFetch = useRef(initialImportStatus !== null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingCard, setEditingCard] = useState<EnrichedVocabCard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedVocabCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [prevSessionStatus, setPrevSessionStatus] = useState(sessionStatus);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(
    initialImportStatus,
  );

  if (sessionStatus !== prevSessionStatus) {
    setPrevSessionStatus(sessionStatus);
    if (sessionStatus === "unauthenticated") {
      setFilters((prev) =>
        prev.studied === "all" ? prev : { ...prev, studied: "all" },
      );
    }
  }

  const bumpReload = useCallback((opts?: { showLoading?: boolean }) => {
    if (opts?.showLoading !== false) {
      setLoading(true);
    }
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!progressEnabled) {
      if (!hadServerSession) setUserDecks([]);
      return;
    }
    if (skipInitialUserDecksFetch.current) {
      skipInitialUserDecksFetch.current = false;
      return;
    }
    void fetch("/api/decks?pageSize=100")
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { items?: { id: string; name: string }[] } | null) => {
        setUserDecks(json?.items ?? []);
      })
      .catch(() => setUserDecks([]));
  }, [progressEnabled, reloadToken, hadServerSession]);

  useEffect(() => {
    if (skipInitialFilterOptionsFetch.current) {
      skipInitialFilterOptionsFetch.current = false;
      return;
    }
    fetch("/api/cards/filter-options")
      .then((r) => r.json())
      .then(setFilterOptions)
      .catch(() => { });
  }, [reloadToken, sessionStatus]);

  useEffect(() => {
    if (!progressEnabled) {
      if (!hadServerSession) setImportStatus(null);
      return;
    }
    if (skipInitialImportStatusFetch.current) {
      skipInitialImportStatusFetch.current = false;
      return;
    }
    void fetch("/api/cards/import-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((json: ImportStatus | null) => setImportStatus(json))
      .catch(() => setImportStatus(null));
  }, [progressEnabled, reloadToken, hadServerSession]);

  useEffect(() => {
    if (skipInitialCardsFetch.current) {
      skipInitialCardsFetch.current = false;
      return;
    }

    const params = new URLSearchParams();
    params.set("page", String(currentPage + 1));
    params.set("pageSize", String(apiPageSize(filters.pageSize)));
    if (filters.deckId !== "all") params.set("deckId", filters.deckId);
    if (filters.tag !== "all") params.set("tag", filters.tag);
    if (filters.level !== "all") params.set("level", filters.level);
    if (filters.pos !== "all") params.set("pos", filters.pos);
    if (progressEnabled) {
      const studied = studiedParam(filters.studied);
      if (studied) params.set("studied", studied);
    }
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
  }, [currentPage, filters, progressEnabled, reloadToken]);

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
        <div className={loading ? "deck-results deck-results--refreshing" : "deck-results"}>
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
        loading={deleting}
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
