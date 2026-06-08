"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import AuthSubmitButton from "@/components/auth/AuthSubmitButton";

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
    <form onSubmit={onSubmit} className="auth-form">
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>
      {error ? <p className="auth-error">{error}</p> : null}
      <AuthSubmitButton disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </AuthSubmitButton>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="auth-page">
      <h1>Sign in</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginForm />
      </Suspense>
      <p className="auth-footer">
        No account? <Link href="/register">Register</Link>
      </p>
    </main>
  );
}
