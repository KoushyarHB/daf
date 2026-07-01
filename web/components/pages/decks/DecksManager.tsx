"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import type { z } from "zod";

import ConfirmModal from "@/components/shared/organisms/ConfirmModal";
import DataTable from "@/components/shared/organisms/DataTable";
import { useToast } from "@/providers/ToastProvider";
import {
  useCreateDeckMutation,
  useDecksQuery,
  useDeleteDeckMutation,
  type DeckRow,
} from "@/hooks/decks";
import { getApiErrorMessage } from "@/services/frontend/http";
import { deckCreateFormSchema } from "@/lib/api/schemas";
import { CEFR_LEVELS } from "@/lib/vocab/levels";
import {
  formInputClass,
  formPlaceholderClass,
  formSelectClass,
} from "@/lib/styles/formControls";
import { tagsPageTitleClass } from "@/lib/styles/pageTitle";
import {
  deckHintClass,
  decksCreateFormClass,
  decksCreateSubmitClass,
  formLabelClass,
  systemBadgeClass,
  tagsPageClass,
  tagsPageHeaderClass,
  tagsPageIntroClass,
  tagsTableActionGapClass,
  tagsTableActionLinkClass,
  tagsTableActionsClass,
  tagsTableBtnDangerClass,
  tagsTableDecksActionsColClass,
  tagsTableDecksClass,
  tagsTableThTdClass,
} from "@/lib/styles/tagsPage";

type DeckCreateValues = z.infer<typeof deckCreateFormSchema>;

type DecksManagerProps = {
  initialDecks: DeckRow[];
};

export default function DecksManager({ initialDecks }: DecksManagerProps) {
  const toast = useToast();
  const decksQuery = useDecksQuery({ initialData: initialDecks });
  const createDeck = useCreateDeckMutation();
  const deleteDeck = useDeleteDeckMutation();
  const [deleteTarget, setDeleteTarget] = useState<DeckRow | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<DeckCreateValues>({
    resolver: zodResolver(deckCreateFormSchema),
    defaultValues: { name: "", level: "A1" },
  });

  const nameValue = useWatch({ control, name: "name" }) ?? "";
  const decks = decksQuery.data ?? [];
  const loading = decksQuery.isLoading;

  async function onCreate(values: DeckCreateValues) {
    try {
      await createDeck.mutateAsync({
        name: values.name.trim(),
        level: values.level,
      });
      toast.success("Deck created");
      reset({ name: "", level: values.level });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Create failed"));
    }
  }

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const deck = deleteTarget;
    try {
      await deleteDeck.mutateAsync(deck.id);
      toast.success("Deck deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Delete failed"));
    }
  }, [deleteTarget, deleteDeck, toast]);

  const columns = useMemo<ColumnDef<DeckRow>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => <code>{row.original.slug}</code>,
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) =>
          row.original.isSystem ? (
            <span className={systemBadgeClass}>system</span>
          ) : (
            "user"
          ),
      },
      { accessorKey: "cardCount", header: "Cards" },
      {
        id: "published",
        header: "Published",
        cell: ({ row }) => (row.original.publishedAt ? "Yes" : "No"),
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          headerClassName: `${tagsTableThTdClass} ${tagsTableDecksActionsColClass}`,
          cellClassName: `${tagsTableThTdClass} ${tagsTableDecksActionsColClass} ${tagsTableActionsClass}`,
        },
        cell: ({ row }) => {
          const deck = row.original;
          return (
            <>
              <Link
                href={`/?deck=${encodeURIComponent(deck.id)}`}
                className={tagsTableActionLinkClass}
              >
                View cards
              </Link>
              <button
                type="button"
                className={`${tagsTableBtnDangerClass} ${tagsTableActionGapClass}`}
                onClick={() => setDeleteTarget(deck)}
                disabled={
                  deleteDeck.isPending && deleteTarget?.id === deck.id
                }
              >
                {deleteDeck.isPending && deleteTarget?.id === deck.id
                  ? "Deleting…"
                  : "Delete"}
              </button>
            </>
          );
        },
      },
    ],
    [deleteDeck.isPending, deleteTarget],
  );

  if (loading && decks.length === 0) {
    return (
      <div className={tagsPageClass}>
        <div className={tagsPageHeaderClass}>
          <h1 className={tagsPageTitleClass}>My decks</h1>
        </div>
        <p className={deckHintClass}>Loading decks…</p>
      </div>
    );
  }

  return (
    <div className={tagsPageClass}>
      <div className={tagsPageHeaderClass}>
        <h1 className={tagsPageTitleClass}>My decks</h1>
      </div>
      <p className={tagsPageIntroClass}>
        Every card belongs to a deck. Decks you create as super admin are marked{" "}
        <span className={systemBadgeClass}>system</span>; other decks are personal.
      </p>

      <form className={decksCreateFormClass} onSubmit={handleSubmit(onCreate)}>
        <label className={formLabelClass}>
          New deck name
          <input
            className={`${formInputClass} ${formPlaceholderClass}`}
            placeholder="Lektion 3 vocab"
            {...register("name")}
          />
        </label>
        <label className={formLabelClass}>
          Default level
          <select className={formSelectClass} {...register("level")}>
            {CEFR_LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className={decksCreateSubmitClass}
          disabled={isSubmitting || createDeck.isPending || !nameValue.trim()}
        >
          {createDeck.isPending ? "Creating…" : "+ Create deck"}
        </button>
      </form>

      {decks.length === 0 ? (
        <p className={deckHintClass}>No decks yet.</p>
      ) : (
        <DataTable
          data={decks}
          columns={columns}
          tableClassName={tagsTableDecksClass}
          getRowId={(row) => row.id}
        />
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete deck"
        message={
          deleteTarget
            ? `Delete deck “${deleteTarget.name}”? It must be empty and you need at least one other deck.`
            : ""
        }
        confirmLabel="Delete"
        danger
        loading={deleteDeck.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteDeck.isPending) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
