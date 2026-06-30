"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAxiosError } from "axios";

import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import { useRegisterMutation } from "@/hooks/auth";
import { authInputClass, formPlaceholderClass } from "@/lib/styles/formControls";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegisterMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await register.mutateAsync({
        email,
        password,
        name: name || undefined,
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError("Email already registered.");
        return;
      }
      const data = isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)
        : undefined;
      setError(data?.error ?? "Registration failed.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (signInResult?.error) {
      setError("Account created but sign-in failed. Try logging in.");
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
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-[0.35rem] text-[0.9rem] font-semibold text-daf-label">
          Name (optional)
          <input
            type="text"
            className={`${authInputClass} ${formPlaceholderClass}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label className="flex flex-col gap-[0.35rem] text-[0.9rem] font-semibold text-daf-label">
          Email
          <input
            type="email"
            className={`${authInputClass} ${formPlaceholderClass}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-[0.35rem] text-[0.9rem] font-semibold text-daf-label">
          Password (min 8 characters)
          <input
            type="password"
            className={`${authInputClass} ${formPlaceholderClass}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {error ? <p className="m-0 text-[0.9rem] text-daf-danger">{error}</p> : null}
        <AuthSubmitButton disabled={register.isPending}>
          {register.isPending ? "Creating account…" : "Create account"}
        </AuthSubmitButton>
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
