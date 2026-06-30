"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import Button from "@/components/shared/atoms/Button";
import InlineCode from "@/components/shared/atoms/InlineCode";
import HintBanner from "@/components/shared/molecules/HintBanner";
import ListPage from "@/components/shared/molecules/ListPage";
import SearchField from "@/components/shared/molecules/SearchField";
import TableActions from "@/components/shared/molecules/TableActions";
import ConfirmModal from "@/components/shared/organisms/ConfirmModal";
import DataTable from "@/components/shared/organisms/DataTable";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useAdminDecksQuery,
  usePublishAdminDeckMutation,
  useUnpublishAdminDeckMutation,
} from "@/hooks/admin";
import type { AdminDeckDto } from "@/lib/api/dto";
import {
  tagsTableActionsClass,
  tagsTableActionsColClass,
  tagsTableClass,
  tagsTableThTdClass,
  tagsTableWrapClass,
  tagsTableWrapRefreshingClass,
} from "@/lib/styles/tagsPage";

type AdminPublishPanelProps = {
  initialDecks?: AdminDeckDto[];
};

export default function AdminPublishPanel({ initialDecks }: AdminPublishPanelProps) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [publishTarget, setPublishTarget] = useState<AdminDeckDto | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<AdminDeckDto | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const skipInitial = initialDecks !== undefined && debouncedQ.trim() === "";
  const decksQuery = useAdminDecksQuery(debouncedQ, {
    enabled: initialDecks === undefined || debouncedQ.trim() !== "",
    initialData: skipInitial ? initialDecks : undefined,
  });
  const publishDeck = usePublishAdminDeckMutation();
  const unpublishDeck = useUnpublishAdminDeckMutation();

  const decks = skipInitial ? (initialDecks ?? []) : (decksQuery.data ?? []);
  const loading = decksQuery.isLoading && decks.length === 0;
  const refreshing = decksQuery.isFetching && !decksQuery.isLoading;

  async function onPublish(deck: AdminDeckDto) {
    try {
      const data = await publishDeck.mutateAsync(deck.id);
      toast.success(
        data.republished
          ? `Republished ${data.cardCount} cards as tag “${data.tag?.label}”`
          : `Published ${data.cardCount} cards as tag “${data.tag?.label}” (${data.tag?.slug})`,
      );
      setPublishTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Publish failed"));
    }
  }

  async function onUnpublish(deck: AdminDeckDto) {
    try {
      const data = await unpublishDeck.mutateAsync(deck.id);
      toast.success(
        `Unpublished — removed ${data.removedCardCount ?? 0} community cards`,
      );
      setUnpublishTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unpublish failed"));
    }
  }

  const columns = useMemo<ColumnDef<AdminDeckDto>[]>(
    () => [
      {
        id: "deck",
        header: "Deck",
        cell: ({ row }) => (
          <>
            {row.original.name} <InlineCode>{row.original.slug}</InlineCode>
          </>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => (
          <>
            {row.original.ownerName ? `${row.original.ownerName} — ` : ""}
            {row.original.ownerEmail}
          </>
        ),
      },
      { accessorKey: "cardCount", header: "Cards" },
      {
        id: "published",
        header: "Published",
        cell: ({ row }) =>
          row.original.publishedAt ? (
            row.original.publishedTagSlug ? (
              <InlineCode>{row.original.publishedTagSlug}</InlineCode>
            ) : (
              "Yes"
            )
          ) : (
            "—"
          ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          headerClassName: `${tagsTableThTdClass} ${tagsTableActionsColClass}`,
          cellClassName: `${tagsTableThTdClass} ${tagsTableActionsColClass} ${tagsTableActionsClass}`,
        },
        cell: ({ row }) => {
          const deck = row.original;
          return (
            <TableActions>
              <Button
                href={`/admin/publish/${encodeURIComponent(deck.id)}`}
                variant="tableSecondary"
                size="xs"
              >
                Review
              </Button>
              <Button
                type="button"
                variant="tablePrimary"
                size="xs"
                onClick={() => setPublishTarget(deck)}
                disabled={
                  publishDeck.isPending && publishDeck.variables === deck.id
                }
              >
                {publishDeck.isPending && publishDeck.variables === deck.id
                  ? "Publishing…"
                  : deck.publishedAt
                    ? "Republish"
                    : "Publish"}
              </Button>
              {deck.publishedAt ? (
                <Button
                  type="button"
                  variant="tableDanger"
                  size="xs"
                  onClick={() => setUnpublishTarget(deck)}
                  disabled={
                    unpublishDeck.isPending &&
                    unpublishDeck.variables === deck.id
                  }
                >
                  {unpublishDeck.isPending &&
                  unpublishDeck.variables === deck.id
                    ? "Unpublishing…"
                    : "Unpublish"}
                </Button>
              ) : null}
            </TableActions>
          );
        },
      },
    ],
    [publishDeck.isPending, publishDeck.variables, unpublishDeck.isPending, unpublishDeck.variables],
  );

  return (
    <ListPage
      title="Publish user decks"
      intro="Copy a user's deck to the community catalog and expose it as an importable tag bundle. The user's original deck is unchanged."
    >
      <SearchField
        id="admin-publish-q"
        label="Search by deck name or owner email"
        value={q}
        onChange={setQ}
        placeholder="Search…"
      />

      {loading ? (
        <HintBanner>Loading decks…</HintBanner>
      ) : decks.length === 0 ? (
        <HintBanner>No decks found.</HintBanner>
      ) : (
        <DataTable
          data={decks}
          columns={columns}
          tableClassName={tagsTableClass}
          wrapClassName={`${tagsTableWrapClass}${refreshing ? ` ${tagsTableWrapRefreshingClass}` : ""}`}
          getRowId={(row) => row.id}
        />
      )}

      <ConfirmModal
        open={publishTarget !== null}
        title={publishTarget?.publishedAt ? "Republish deck" : "Publish deck"}
        message={
          publishTarget
            ? `Publish “${publishTarget.name}” by ${publishTarget.ownerEmail} to the community catalog? ` +
              `Learners can import it via Import community cards (${publishTarget.cardCount} cards).`
            : ""
        }
        confirmLabel={publishTarget?.publishedAt ? "Republish" : "Publish"}
        loading={publishDeck.isPending}
        onConfirm={() => {
          if (publishTarget) void onPublish(publishTarget);
        }}
        onCancel={() => setPublishTarget(null)}
      />

      <ConfirmModal
        open={unpublishTarget !== null}
        title="Unpublish deck"
        message={
          unpublishTarget
            ? `Remove “${unpublishTarget.name}” from the community catalog? ` +
              `The bundle will no longer appear for new imports.`
            : ""
        }
        confirmLabel="Unpublish"
        danger
        loading={unpublishDeck.isPending}
        onConfirm={() => {
          if (unpublishTarget) void onUnpublish(unpublishTarget);
        }}
        onCancel={() => setUnpublishTarget(null)}
      />
    </ListPage>
  );
}
