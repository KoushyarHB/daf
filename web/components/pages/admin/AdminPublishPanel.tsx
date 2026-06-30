"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import ConfirmModal from "@/components/shared/ConfirmModal";
import DataTable from "@/components/shared/DataTable";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useAdminDecksQuery,
  usePublishAdminDeckMutation,
  useUnpublishAdminDeckMutation,
} from "@/hooks/admin";
import type { AdminDeckDto } from "@/lib/api/dto";
import {
  formInputClass,
  formPlaceholderClass,
} from "@/lib/styles/formControls";
import { tagsPageTitleClass } from "@/lib/styles/pageTitle";
import {
  adminSearchClass,
  adminSearchInputClass,
  adminSearchLabelClass,
  deckHintClass,
  tagsPageClass,
  tagsPageHeaderClass,
  tagsPageIntroClass,
  tagsTableActionGapClass,
  tagsTableActionsClass,
  tagsTableActionsColClass,
  tagsTableBtnDangerClass,
  tagsTableBtnPrimaryClass,
  tagsTableBtnSecondaryClass,
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
            {row.original.name} <code>{row.original.slug}</code>
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
              <code>{row.original.publishedTagSlug}</code>
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
            <>
              <Link
                href={`/admin/publish/${encodeURIComponent(deck.id)}`}
                className={tagsTableBtnSecondaryClass}
              >
                Review
              </Link>
              <button
                type="button"
                className={`${tagsTableBtnPrimaryClass} ${tagsTableActionGapClass}`}
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
              </button>
              {deck.publishedAt ? (
                <button
                  type="button"
                  className={`${tagsTableBtnDangerClass} ${tagsTableActionGapClass}`}
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
                </button>
              ) : null}
            </>
          );
        },
      },
    ],
    [publishDeck.isPending, publishDeck.variables, unpublishDeck.isPending, unpublishDeck.variables],
  );

  return (
    <div className={tagsPageClass}>
      <div className={tagsPageHeaderClass}>
        <h1 className={tagsPageTitleClass}>Publish user decks</h1>
      </div>
      <p className={tagsPageIntroClass}>
        Copy a user&apos;s deck to the community catalog and expose it as an
        importable tag bundle. The user&apos;s original deck is unchanged.
      </p>

      <div className={adminSearchClass}>
        <label className={adminSearchLabelClass} htmlFor="admin-publish-q">
          Search by deck name or owner email
        </label>
        <input
          id="admin-publish-q"
          type="search"
          className={`${formInputClass} ${formPlaceholderClass} ${adminSearchInputClass}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
        />
      </div>

      {loading ? (
        <p className={deckHintClass}>Loading decks…</p>
      ) : decks.length === 0 ? (
        <p className={deckHintClass}>No decks found.</p>
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
    </div>
  );
}
