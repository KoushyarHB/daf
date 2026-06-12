"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

import TagForm from "@/components/pages/tags/TagForm";

export default function NewTagPage() {
  const { status } = useSession();

  if (status === "loading") {
    return <p className="deck-hint">Loading…</p>;
  }

  if (status !== "authenticated") {
    return (
      <p className="deck-hint">
        <Link href="/login">Sign in</Link> to create tags.
      </p>
    );
  }

  return <TagForm mode="create" />;
}
