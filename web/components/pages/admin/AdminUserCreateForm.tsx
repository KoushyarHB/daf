"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import { useCreateAdminUserMutation } from "@/hooks/admin";
import { roleLabel } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/roles";
import {
  formInputClass,
  formSelectClass,
} from "@/lib/styles/formControls";
import { tagsPageTitleClass } from "@/lib/styles/pageTitle";
import {
  formLabelClass,
  tagFormActionsClass,
  tagFormCancelClass,
  tagFormClass,
  tagFormSubmitClass,
  tagsPageClass,
  tagsPageHeaderClass,
  tagsPageIntroClass,
} from "@/lib/styles/tagsPage";

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
    <div className={tagsPageClass}>
      <div className={tagsPageHeaderClass}>
        <h1 className={tagsPageTitleClass}>Create user</h1>
      </div>
      <p className={tagsPageIntroClass}>
        Add a new account and assign a role. Super admin accounts should be
        created here, not on the main users list.
      </p>

      <form className={tagFormClass} onSubmit={onCreate}>
        <label className={formLabelClass}>
          Email
          <input
            type="email"
            className={formInputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </label>
        <label className={formLabelClass}>
          Password
          <input
            type="password"
            className={formInputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </label>
        <label className={formLabelClass}>
          Name
          <input className={formInputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={formLabelClass}>
          Role
          <select
            className={formSelectClass}
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
        <div className={tagFormActionsClass}>
          <button type="submit" className={tagFormSubmitClass} disabled={createUser.isPending}>
            {createUser.isPending ? "Creating…" : "Create user"}
          </button>
          <Link href="/admin/users" className={tagFormCancelClass}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
