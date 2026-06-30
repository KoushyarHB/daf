import { getAuthUserId } from "@/lib/auth/require-auth";
import VocabularyDeck from "@/components/pages/vocabulary/VocabularyDeck";
import * as cardsService from "@/services/backend/cards.service";
import * as decksService from "@/services/backend/decks.service";
import { getImportStatus } from "@/services/backend/import.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "daf — vocabulary",
};

type PageProps = {
  searchParams: Promise<{ deck?: string }>;
};

export default async function VocabularyPage({ searchParams }: PageProps) {
  const { deck: deckId } = await searchParams;
  const userId = await getAuthUserId();

  const cardQuery = {
    page: 1,
    pageSize: 25,
    sort: "deck-desc" as const,
    ...(deckId ? { deckId } : {}),
  };

  const [cards, filterOptions, userDecks, importStatus] = await Promise.all([
    cardsService.listCards(cardQuery, userId),
    cardsService.getFilterOptions(userId),
    userId
      ? decksService.listDecksForUser(userId, { page: 1, pageSize: 100 })
      : Promise.resolve(null),
    userId ? getImportStatus(userId) : Promise.resolve(null),
  ]);

  return (
    <VocabularyDeck
      initialDeckId={deckId}
      initialData={cards}
      initialFilterOptions={filterOptions}
      initialUserDecks={userDecks?.items.map((d) => ({ id: d.id, name: d.name })) ?? []}
      initialImportStatus={importStatus}
    />
  );
}
