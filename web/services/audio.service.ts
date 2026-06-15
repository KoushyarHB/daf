import { speakTextForHead } from "@/lib/audio/speak-text";
import { AudioStorageError, storeUserAudioMp3 } from "@/lib/audio/store";
import { synthesizeGermanSpeech } from "@/lib/audio/tts";

export { AudioStorageError };

export async function generateCardAudio(
  userId: string,
  text: string,
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Nothing to speak");
  }
  if (trimmed.length > 500) {
    throw new Error("Text is too long for pronunciation (max 500 characters)");
  }

  const buffer = await synthesizeGermanSpeech(trimmed);
  return storeUserAudioMp3(userId, trimmed, buffer);
}

export function speakTextForCardHead(head: string): string {
  return speakTextForHead(head);
}
