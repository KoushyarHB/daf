"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useAdminUsersQuery,
  useDeleteAdminUserMutation,
  useUpdateAdminUserRoleMutation,
  type AdminUserRow,
} from "@/hooks/admin";
import { roleLabel } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/roles";

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

  async function onRoleChange(user: AdminUserRow, role: UserRole) {
    try {
      await updateRole.mutateAsync({ userId: user.id, role });
      toast.success("Role updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Update failed"));
    }
  }

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

  return (
    <div className="tags-page">
      <div className="tags-page__header">
        <h1 className="tags-page__title">Users</h1>
        <Link href="/admin/users/new" className="tags-page__new">
          + Create user
        </Link>
      </div>
      <p className="tags-page__intro">
        View accounts and change roles. Use{" "}
        <Link href="/admin/users/new">Create user</Link> to add new accounts
        (including super admins).
      </p>

      <div className="admin-search">
        <label className="admin-search__label" htmlFor="admin-users-q">
          Search users
        </label>
        <input
          id="admin-users-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Email or name…"
        />
      </div>

      {loading ? (
        <p className="deck-hint">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="deck-hint">No users found.</p>
      ) : (
        <div className={`tags-table-wrap${refreshing ? " tags-table-wrap--refreshing" : ""}`}>
        <table className="tags-table tags-table--users">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th scope="col">Joined</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name ?? "—"}</td>
                <td>
                  <select
                    value={user.role}
                    disabled={updateRole.isPending && updateRole.variables?.userId === user.id}
                    onChange={(e) =>
                      onRoleChange(user, e.target.value as UserRole)
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {roleLabel(r)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="tags-table__actions">
                  <button
                    type="button"
                    className="tags-table__btn-danger"
                    onClick={() => setDeleteTarget(user)}
                    disabled={deleteUser.isPending && deleteTarget?.id === user.id}
                  >
                    {deleteUser.isPending && deleteTarget?.id === user.id
                      ? "Deleting…"
                      : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
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
    </div>
  );
}
