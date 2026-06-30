"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import TextLink from "@/components/shared/atoms/TextLink";
import { SubmitButton } from "@/components/shared/atoms/Button";
import FieldError from "@/components/shared/atoms/FieldError";
import FormField from "@/components/shared/molecules/FormField";
import Input from "@/components/shared/atoms/Input";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { loginFormSchema } from "@/lib/api/schemas";

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
      <FormField
        variant="auth"
        label="Email"
        error={errors.email?.message}
      >
        <Input
          type="email"
          variant="auth"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
      </FormField>
      <FormField
        variant="auth"
        label="Password"
        error={errors.password?.message}
      >
        <Input
          type="password"
          variant="auth"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
        />
      </FormField>
      {serverError ? <FieldError block>{serverError}</FieldError> : null}
      <SubmitButton disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </SubmitButton>
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
        No account? <TextLink href="/register">Register</TextLink>
      </p>
    </main>
  );
}
