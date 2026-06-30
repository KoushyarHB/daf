"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import ConfirmModal from "@/components/shared/ConfirmModal";
import DataTable from "@/components/shared/DataTable";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useDeleteTagMutation,
  useTagsQuery,
  type TagRow,
} from "@/hooks/tags";
import { canModifyTag } from "@/lib/tags/permissions";
import { tagsPageTitleClass } from "@/lib/styles/pageTitle";
import {
  deckHintClass,
  systemBadgeClass,
  tagsPageBackClass,
  tagsPageClass,
  tagsPageHeaderClass,
  tagsPageIntroClass,
  tagsPageNewLinkClass,
  tagsTableActionGapClass,
  tagsTableActionLinkClass,
  tagsTableActionsClass,
  tagsTableActionsColClass,
  tagsTableBtnDangerClass,
  tagsTableClass,
  tagsTableMutedClass,
  tagsTableThTdClass,
} from "@/lib/styles/tagsPage";

type TagsManagerProps = {
  initialTags?: TagRow[];
};

export default function TagsManager({ initialTags }: TagsManagerProps) {
  const toast = useToast();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role ?? "user";
  const tagsQuery = useTagsQuery({
    enabled: initialTags === undefined,
    initialData: initialTags,
  });
  const deleteTag = useDeleteTagMutation();
  const [deleteTarget, setDeleteTarget] = useState<TagRow | null>(null);

  const tags = tagsQuery.data ?? initialTags ?? [];
  const loading = tagsQuery.isLoading && tags.length === 0;

  async function confirmDelete() {
    if (!deleteTarget) return;
    const tag = deleteTarget;
    try {
      await deleteTag.mutateAsync(tag.id);
      toast.success("Tag deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Delete failed"));
    }
  }

  const columns = useMemo<ColumnDef<TagRow>[]>(
    () => [
      { accessorKey: "label", header: "Label" },
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
      {
        id: "cardCount",
        header: "Cards",
        cell: ({ row }) => row.original.cardCount ?? 0,
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          headerClassName: `${tagsTableThTdClass} ${tagsTableActionsColClass}`,
          cellClassName: `${tagsTableThTdClass} ${tagsTableActionsColClass} ${tagsTableActionsClass}`,
        },
        cell: ({ row }) => {
          const tag = row.original;
          const editable =
            Boolean(userId) && canModifyTag(tag, userId!, role);
          if (!editable) {
            return <span className={tagsTableMutedClass}>—</span>;
          }
          return (
            <>
              <Link
                href={`/tags/${encodeURIComponent(tag.id)}/edit`}
                className={tagsTableActionLinkClass}
              >
                Edit
              </Link>
              <button
                type="button"
                className={`${tagsTableBtnDangerClass} ${tagsTableActionGapClass}`}
                onClick={() => setDeleteTarget(tag)}
                disabled={
                  deleteTag.isPending && deleteTarget?.id === tag.id
                }
              >
                {deleteTag.isPending && deleteTarget?.id === tag.id
                  ? "Deleting…"
                  : "Delete"}
              </button>
            </>
          );
        },
      },
    ],
    [deleteTag.isPending, deleteTarget, userId, role],
  );

  if (loading) {
    return (
      <div className={tagsPageClass}>
        <div className={tagsPageHeaderClass}>
          <h1 className={tagsPageTitleClass}>Tags</h1>
          <Link href="/tags/new" className={tagsPageNewLinkClass}>
            + New tag
          </Link>
        </div>
        <p className={deckHintClass}>Loading tags…</p>
      </div>
    );
  }

  return (
    <div className={tagsPageClass}>
      <div className={tagsPageHeaderClass}>
        <h1 className={tagsPageTitleClass}>Tags</h1>
        <Link href="/tags/new" className={tagsPageNewLinkClass}>
          + New tag
        </Link>
      </div>
      <p className={tagsPageIntroClass}>
        Tags organize cards and import bundles. Your tags are personal; tags you
        create as super admin are marked <span className={systemBadgeClass}>system</span>{" "}
        and can only be edited by super admins.
      </p>

      {tags.length === 0 ? (
        <p className={deckHintClass}>No tags yet.</p>
      ) : (
        <DataTable
          data={tags}
          columns={columns}
          tableClassName={tagsTableClass}
          getRowId={(row) => row.id}
        />
      )}

      <p className={tagsPageBackClass}>
        <Link href="/" className="text-daf-head no-underline hover:underline">← Back to vocabulary</Link>
      </p>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete tag"
        message={
          deleteTarget
            ? `Delete tag “${deleteTarget.label}”? This only works when no cards use it.`
            : ""
        }
        confirmLabel="Delete"
        danger
        loading={deleteTag.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteTag.isPending) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
