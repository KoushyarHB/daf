"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import { loginFormSchema } from "@/lib/api/schemas";
import { authInputClass, formPlaceholderClass } from "@/lib/styles/formControls";

type LoginFormValues = z.infer<typeof loginFormSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    setServerError(null);
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setServerError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <label className="flex flex-col gap-[0.35rem] text-[0.9rem] font-semibold text-daf-label">
        Email
        <input
          type="email"
          className={`${authInputClass} ${formPlaceholderClass}`}
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <span className="text-[0.85rem] font-normal text-daf-danger">
            {errors.email.message}
          </span>
        ) : null}
      </label>
      <label className="flex flex-col gap-[0.35rem] text-[0.9rem] font-semibold text-daf-label">
        Password
        <input
          type="password"
          className={`${authInputClass} ${formPlaceholderClass}`}
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password ? (
          <span className="text-[0.85rem] font-normal text-daf-danger">
            {errors.password.message}
          </span>
        ) : null}
      </label>
      {serverError ? (
        <p className="m-0 text-[0.9rem] text-daf-danger">{serverError}</p>
      ) : null}
      <AuthSubmitButton disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </AuthSubmitButton>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto my-10 max-w-auth rounded-[10px] border border-daf-border bg-daf-white px-6 pt-7 pb-6 shadow-card-md">
      <h1 className="mb-5 border-b-0 pb-0 text-center text-[1.35rem]">
        Sign in
      </h1>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginForm />
      </Suspense>
      <p className="mt-5 text-center text-[0.9rem] text-daf-subtle">
        No account?{" "}
        <Link
          href="/register"
          className="font-semibold text-daf-head no-underline hover:underline"
        >
          Register
        </Link>
      </p>
    </main>
  );
}
