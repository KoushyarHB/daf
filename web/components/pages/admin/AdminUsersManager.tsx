"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { writeRouteCache } from "@/lib/client/route-data-cache";
import { roleLabel } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/roles";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};

const ROLES: UserRole[] = ["user", "admin", "super_admin"];

type AdminUsersManagerProps = {
  initialUsers?: UserRow[];
};

export default function AdminUsersManager({ initialUsers }: AdminUsersManagerProps) {
  const toast = useToast();
  const [users, setUsers] = useState<UserRow[]>(initialUsers ?? []);
  const [loading, setLoading] = useState(initialUsers === undefined);
  const [hasLoaded, setHasLoaded] = useState(initialUsers !== undefined);
  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "100" });
    if (q.trim()) params.set("q", q.trim());
    void fetch(`/api/admin/users?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { items?: UserRow[] }) => {
        const items = data.items ?? [];
        setUsers(items);
        writeRouteCache("admin-users", items);
        setHasLoaded(true);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load users");
        setHasLoaded(true);
        setLoading(false);
      });
  }, [q, toast]);

  useEffect(() => {
    if (initialUsers !== undefined && q.trim() === "") return;
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
  }, [load, initialUsers, q]);

  async function onRoleChange(user: UserRow, role: UserRole) {
    setSavingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Update failed (${res.status})`);
      }
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const user = deleteTarget;
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
      toast.success("User deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
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

      {loading && !hasLoaded ? (
        <p className="deck-hint">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="deck-hint">No users found.</p>
      ) : (
        <div className={`tags-table-wrap${loading ? " tags-table-wrap--refreshing" : ""}`}>
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
                    disabled={savingId === user.id}
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
                    disabled={deleting && deleteTarget?.id === user.id}
                  >
                    {deleting && deleteTarget?.id === user.id ? "Deleting…" : "Delete"}
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
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
