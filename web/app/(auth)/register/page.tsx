"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import type { z } from "zod";

import { SubmitButton } from "@/components/shared/atoms/Button";
import { useRegisterMutation } from "@/hooks/auth";
import { registerSchema } from "@/lib/api/schemas";
import { authInputClass, formPlaceholderClass } from "@/lib/styles/formControls";

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    try {
      await register.mutateAsync({
        email: values.email,
        password: values.password,
        name: values.name?.trim() || undefined,
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setServerError("Email already registered.");
        return;
      }
      const data = isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)
        : undefined;
      setServerError(data?.error ?? "Registration failed.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: getValues("email"),
      password: getValues("password"),
      redirect: false,
    });
    if (signInResult?.error) {
      setServerError("Account created but sign-in failed. Try logging in.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="mx-auto my-10 max-w-auth rounded-[10px] border border-daf-border bg-daf-white px-6 pt-7 pb-6 shadow-card-md">
      <h1 className="mb-5 border-b-0 pb-0 text-center text-[1.35rem]">
        Register
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-[0.35rem] text-[0.9rem] font-semibold text-daf-label">
          Name (optional)
          <input
            type="text"
            className={`${authInputClass} ${formPlaceholderClass}`}
            placeholder="Your name"
            autoComplete="name"
            {...registerField("name")}
          />
        </label>
        <label className="flex flex-col gap-[0.35rem] text-[0.9rem] font-semibold text-daf-label">
          Email
          <input
            type="email"
            className={`${authInputClass} ${formPlaceholderClass}`}
            placeholder="you@example.com"
            autoComplete="email"
            {...registerField("email")}
          />
          {errors.email ? (
            <span className="text-[0.85rem] font-normal text-daf-danger">
              {errors.email.message}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-[0.35rem] text-[0.9rem] font-semibold text-daf-label">
          Password (min 8 characters)
          <input
            type="password"
            className={`${authInputClass} ${formPlaceholderClass}`}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            {...registerField("password")}
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
        <SubmitButton disabled={register.isPending}>
          {register.isPending ? "Creating account…" : "Create account"}
        </SubmitButton>
      </form>
      <p className="mt-5 text-center text-[0.9rem] text-daf-subtle">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-daf-head no-underline hover:underline"
        >
          Sign in
        </Link>
      </p>
    </main>
  );
}
