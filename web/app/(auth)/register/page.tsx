"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAxiosError } from "axios";

import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import { useRegisterMutation } from "@/hooks/auth";

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
    <main className="auth-page">
      <h1>Register</h1>
      <form onSubmit={onSubmit} className="auth-form">
        <label>
          Name (optional)
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password (min 8 characters)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {error ? <p className="auth-error">{error}</p> : null}
        <AuthSubmitButton disabled={register.isPending}>
          {register.isPending ? "Creating account…" : "Create account"}
        </AuthSubmitButton>
      </form>
      <p className="auth-footer">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </main>
  );
}
