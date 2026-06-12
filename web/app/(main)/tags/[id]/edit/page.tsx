"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import TagForm from "@/components/pages/tags/TagForm";

export default function EditTagPage() {
  const { status } = useSession();
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<{ slug: string; label: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !params.id) return;
    void fetch(`/api/tags/${encodeURIComponent(params.id)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json() as Promise<{ slug: string; label: string }>;
      })
      .then(setInitial)
      .catch(() => setError("Tag not found"));
  }, [status, params.id]);

  if (status === "loading") {
    return <p className="deck-hint">Loading…</p>;
  }

  if (status !== "authenticated") {
    return (
      <p className="deck-hint">
        <Link href="/login">Sign in</Link> to edit tags.
      </p>
    );
  }

  if (error) {
    return (
      <p className="deck-error" role="alert">
        {error}
      </p>
    );
  }

  if (!initial) {
    return <p className="deck-hint">Loading tag…</p>;
  }

  return <TagForm mode="edit" tagId={params.id} initial={initial} />;
}
