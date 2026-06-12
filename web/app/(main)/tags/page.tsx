"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

import TagsManager from "@/components/pages/tags/TagsManager";

export default function TagsPage() {
  const { status } = useSession();

  if (status === "loading") {
    return <p className="deck-hint">Loading…</p>;
  }

  if (status !== "authenticated") {
    return (
      <p className="deck-hint">
        <Link href="/login">Sign in</Link> to manage tags.
      </p>
    );
  }

  return <TagsManager />;
}
