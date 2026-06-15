import { EdgeTTS } from "edge-tts-universal";

export const DEFAULT_TTS_VOICE = "de-DE-KatjaNeural";

export async function synthesizeGermanSpeech(
  text: string,
  voice = process.env.TTS_VOICE?.trim() || DEFAULT_TTS_VOICE,
): Promise<Buffer> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Text is empty");
  }

  const tts = new EdgeTTS(trimmed, voice);
  const result = await tts.synthesize();
  const arrayBuffer = await result.audio.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
