"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import { authInputClass, formPlaceholderClass } from "@/lib/styles/formControls";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
        Password
        <input
          type="password"
          className={`${authInputClass} ${formPlaceholderClass}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
      </label>
      {error ? <p className="m-0 text-[0.9rem] text-daf-danger">{error}</p> : null}
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
