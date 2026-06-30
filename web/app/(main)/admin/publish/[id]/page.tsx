import { notFound } from "next/navigation";

import AdminDeckReview from "@/components/pages/admin/AdminDeckReview";
import { getAuthSession } from "@/lib/auth/require-auth";
import { isSuperAdminRole } from "@/lib/auth/roles";
import * as adminDecksService from "@/services/backend/admin-decks.service";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminDeckReviewPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session || !isSuperAdminRole(session.role)) {
    return (
      <p className="deck-hint" role="alert">
        Super admin access required.
      </p>
    );
  }

  const { id } = await params;
  const [deck, cardsResult] = await Promise.all([
    adminDecksService.getDeckAdmin(id),
    adminDecksService.listDeckCardsAdmin(id),
  ]);

  if (!deck || cardsResult === "NOT_FOUND") {
    notFound();
  }

  return (
    <AdminDeckReview
      key={id}
      deckId={id}
      initialDeck={deck}
      initialCards={cardsResult}
    />
  );
}
