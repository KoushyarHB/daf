import { getAuthSession } from "@/lib/auth/require-auth";
import SignInPrompt from "@/components/shared/molecules/SignInPrompt";
import DecksManager from "@/components/pages/decks/DecksManager";
import * as decksService from "@/services/backend/decks.service";

export const dynamic = "force-dynamic";

export default async function DecksPage() {
  const session = await getAuthSession();
  if (!session) {
    return <SignInPrompt message="to manage decks." />;
  }

  const decks = await decksService.listDecksForUser(session.userId, {
    page: 1,
    pageSize: 100,
  });

  return <DecksManager initialDecks={decks.items} />;
}
