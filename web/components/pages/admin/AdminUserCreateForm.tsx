"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import { useCreateAdminUserMutation } from "@/hooks/admin";
import { adminUserWriteSchema } from "@/lib/api/schemas";
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

type AdminUserFormValues = z.infer<typeof adminUserWriteSchema>;

export default function AdminUserCreateForm() {
  const toast = useToast();
  const router = useRouter();
  const createUser = useCreateAdminUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserWriteSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "user",
    },
  });

  async function onCreate(values: AdminUserFormValues) {
    try {
      await createUser.mutateAsync({
        email: values.email.trim(),
        password: values.password,
        name: values.name?.trim() || undefined,
        role: values.role ?? "user",
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

      <form className={tagFormClass} onSubmit={handleSubmit(onCreate)}>
        <label className={formLabelClass}>
          Email
          <input
            type="email"
            className={formInputClass}
            autoComplete="off"
            {...register("email")}
          />
          {errors.email ? (
            <span className="text-[0.85rem] font-normal text-daf-danger">
              {errors.email.message}
            </span>
          ) : null}
        </label>
        <label className={formLabelClass}>
          Password
          <input
            type="password"
            className={formInputClass}
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password ? (
            <span className="text-[0.85rem] font-normal text-daf-danger">
              {errors.password.message}
            </span>
          ) : null}
        </label>
        <label className={formLabelClass}>
          Name
          <input className={formInputClass} {...register("name")} />
        </label>
        <label className={formLabelClass}>
          Role
          <select className={formSelectClass} {...register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
        </label>
        <div className={tagFormActionsClass}>
          <button
            type="submit"
            className={tagFormSubmitClass}
            disabled={isSubmitting || createUser.isPending}
          >
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
