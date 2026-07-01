"use client";

import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import Badge from "@/components/shared/atoms/Badge";
import Button from "@/components/shared/atoms/Button";
import InlineCode from "@/components/shared/atoms/InlineCode";
import TextLink from "@/components/shared/atoms/TextLink";
import HintBanner from "@/components/shared/molecules/HintBanner";
import ListPage from "@/components/shared/molecules/ListPage";
import TableActions from "@/components/shared/molecules/TableActions";
import ConfirmModal from "@/components/shared/organisms/ConfirmModal";
import DataTable from "@/components/shared/organisms/DataTable";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useDeleteTagMutation,
  useTagsQuery,
  type TagRow,
} from "@/hooks/tags";
import { canModifyTag } from "@/lib/tags/permissions";
import {
  tagsPageBackClass,
  tagsTableActionsClass,
  tagsTableActionsColClass,
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
        cell: ({ row }) => <InlineCode>{row.original.slug}</InlineCode>,
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) =>
          row.original.isSystem ? <Badge>system</Badge> : "user",
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
            <TableActions>
              <TextLink
                href={`/tags/${encodeURIComponent(tag.id)}/edit`}
                variant="table"
              >
                Edit
              </TextLink>
              <Button
                type="button"
                variant="tableDanger"
                size="xs"
                onClick={() => setDeleteTarget(tag)}
                disabled={deleteTag.isPending && deleteTarget?.id === tag.id}
              >
                {deleteTag.isPending && deleteTarget?.id === tag.id
                  ? "Deleting…"
                  : "Delete"}
              </Button>
            </TableActions>
          );
        },
      },
    ],
    [deleteTag.isPending, deleteTarget, userId, role],
  );

  if (loading) {
    return (
      <ListPage title="Tags" actionHref="/tags/new" actionLabel="+ New tag">
        <HintBanner>Loading tags…</HintBanner>
      </ListPage>
    );
  }

  return (
    <ListPage
      title="Tags"
      actionHref="/tags/new"
      actionLabel="+ New tag"
      intro={
        <>
          Tags organize cards and import bundles. Your tags are personal; tags you
          create as super admin are marked <Badge>system</Badge> and can only be
          edited by super admins.
        </>
      }
    >
      {tags.length === 0 ? (
        <HintBanner>No tags yet.</HintBanner>
      ) : (
        <DataTable
          data={tags}
          columns={columns}
          tableClassName={tagsTableClass}
          getRowId={(row) => row.id}
        />
      )}

      <p className={tagsPageBackClass}>
        <TextLink href="/">← Back to vocabulary</TextLink>
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
    </ListPage>
  );
}
