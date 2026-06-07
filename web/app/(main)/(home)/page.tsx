import { loadVocabCards } from "@/lib/vocab/load-manifest";
import VocabularyDeck from "@/components/pages/vocabulary/VocabularyDeck";

export const metadata = {
  title: "daf — vocabulary",
};

export default function VocabularyPage() {
  const cards = loadVocabCards();
  return <VocabularyDeck cards={cards} />;
}
