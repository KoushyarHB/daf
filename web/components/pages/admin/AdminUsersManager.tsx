"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import Button from "@/components/shared/atoms/Button";
import Select from "@/components/shared/atoms/Select";
import TextLink from "@/components/shared/atoms/TextLink";
import HintBanner from "@/components/shared/molecules/HintBanner";
import ListPage from "@/components/shared/molecules/ListPage";
import SearchField from "@/components/shared/molecules/SearchField";
import TableActions from "@/components/shared/molecules/TableActions";
import ConfirmModal from "@/components/shared/organisms/ConfirmModal";
import DataTable from "@/components/shared/organisms/DataTable";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useAdminUsersQuery,
  useDeleteAdminUserMutation,
  useUpdateAdminUserRoleMutation,
  type AdminUserRow,
} from "@/hooks/admin";
import { roleLabel } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/roles";
import {
  formSelectTableClass,
  tagsTableActionsClass,
  tagsTableActionsColClass,
  tagsTableThTdClass,
  tagsTableUsersClass,
  tagsTableUsersRoleColClass,
  tagsTableWrapClass,
  tagsTableWrapRefreshingClass,
} from "@/lib/styles/tagsPage";

const ROLES: UserRole[] = ["user", "admin", "super_admin"];

type AdminUsersManagerProps = {
  initialUsers?: AdminUserRow[];
};

export default function AdminUsersManager({ initialUsers }: AdminUsersManagerProps) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const skipInitial = initialUsers !== undefined && debouncedQ.trim() === "";
  const usersQuery = useAdminUsersQuery(debouncedQ, {
    enabled: initialUsers === undefined || debouncedQ.trim() !== "",
    initialData: skipInitial ? initialUsers : undefined,
  });
  const updateRole = useUpdateAdminUserRoleMutation();
  const deleteUser = useDeleteAdminUserMutation();

  const users = skipInitial ? (initialUsers ?? []) : (usersQuery.data ?? []);
  const loading = usersQuery.isLoading && users.length === 0;
  const refreshing = usersQuery.isFetching && !usersQuery.isLoading;

  const onRoleChange = useCallback(
    async (user: AdminUserRow, role: UserRole) => {
      try {
        await updateRole.mutateAsync({ userId: user.id, role });
        toast.success("Role updated");
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Update failed"));
      }
    },
    [updateRole, toast],
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    const user = deleteTarget;
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success("User deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Delete failed"));
    }
  }

  const columns = useMemo<ColumnDef<AdminUserRow>[]>(
    () => [
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => row.original.name ?? "—",
      },
      {
        id: "role",
        header: "Role",
        meta: {
          headerClassName: `${tagsTableThTdClass} ${tagsTableUsersRoleColClass}`,
          cellClassName: `${tagsTableThTdClass} ${tagsTableUsersRoleColClass}`,
        },
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Select
              variant="default"
              className={formSelectTableClass}
              value={user.role}
              disabled={
                updateRole.isPending &&
                updateRole.variables?.userId === user.id
              }
              onChange={(e) =>
                onRoleChange(user, e.target.value as UserRole)
              }
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </Select>
          );
        },
      },
      {
        id: "joined",
        header: "Joined",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          headerClassName: `${tagsTableThTdClass} ${tagsTableActionsColClass}`,
          cellClassName: `${tagsTableThTdClass} ${tagsTableActionsColClass} ${tagsTableActionsClass}`,
        },
        cell: ({ row }) => {
          const user = row.original;
          return (
            <TableActions>
              <Button
                type="button"
                variant="tableDanger"
                size="xs"
                onClick={() => setDeleteTarget(user)}
                disabled={deleteUser.isPending && deleteTarget?.id === user.id}
              >
                {deleteUser.isPending && deleteTarget?.id === user.id
                  ? "Deleting…"
                  : "Delete"}
              </Button>
            </TableActions>
          );
        },
      },
    ],
    [
      deleteTarget,
      deleteUser.isPending,
      onRoleChange,
      updateRole.isPending,
      updateRole.variables?.userId,
    ],
  );

  return (
    <ListPage
      title="Users"
      actionHref="/admin/users/new"
      actionLabel="+ Create user"
      intro={
        <>
          View accounts and change roles. Use{" "}
          <TextLink href="/admin/users/new">Create user</TextLink> to add new
          accounts (including super admins).
        </>
      }
    >
      <SearchField
        id="admin-users-q"
        label="Search users"
        value={q}
        onChange={setQ}
        placeholder="Email or name…"
      />

      {loading ? (
        <HintBanner>Loading users…</HintBanner>
      ) : users.length === 0 ? (
        <HintBanner>No users found.</HintBanner>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          tableClassName={tagsTableUsersClass}
          wrapClassName={`${tagsTableWrapClass}${refreshing ? ` ${tagsTableWrapRefreshingClass}` : ""}`}
          getRowId={(row) => row.id}
        />
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete user"
        message={
          deleteTarget
            ? `Delete user ${deleteTarget.email}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        danger
        loading={deleteUser.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteUser.isPending) setDeleteTarget(null);
        }}
      />
    </ListPage>
  );
}
