"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import { useCreateAdminUserMutation } from "@/hooks/admin";
import { roleLabel } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/roles";

const ROLES: UserRole[] = ["user", "admin", "super_admin"];

export default function AdminUserCreateForm() {
  const toast = useToast();
  const router = useRouter();
  const createUser = useCreateAdminUserMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("user");

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUser.mutateAsync({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        role,
      });
      toast.success("User created");
      router.push("/admin/users");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Create failed"));
    }
  }

  return (
    <div className="tags-page">
      <div className="tags-page__header">
        <h1 className="tags-page__title">Create user</h1>
      </div>
      <p className="tags-page__intro">
        Add a new account and assign a role. Super admin accounts should be
        created here, not on the main users list.
      </p>

      <form className="tag-form admin-user-create-form" onSubmit={onCreate}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </label>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
        </label>
        <div className="tag-form__actions">
          <button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? "Creating…" : "Create user"}
          </button>
          <Link href="/admin/users" className="tag-form__cancel">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
