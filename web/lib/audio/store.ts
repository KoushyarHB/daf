import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { put } from "@vercel/blob";

import { DEFAULT_TTS_VOICE } from "@/lib/audio/tts";

export class AudioStorageError extends Error {
  constructor(
    readonly code: "NOT_CONFIGURED",
    message: string,
  ) {
    super(message);
    this.name = "AudioStorageError";
  }
}

function storageKey(userId: string, text: string, voice: string): string {
  const hash = createHash("sha256")
    .update(`${voice}:${text}`)
    .digest("hex")
    .slice(0, 32);
  return `audio/user/${userId}/${hash}.mp3`;
}

export async function storeUserAudioMp3(
  userId: string,
  text: string,
  buffer: Buffer,
  voice = process.env.TTS_VOICE?.trim() || DEFAULT_TTS_VOICE,
): Promise<string> {
  const key = storageKey(userId, text, voice);
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (token) {
    const blob = await put(key, buffer, {
      access: "public",
      contentType: "audio/mpeg",
      token,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (process.env.NODE_ENV === "development") {
    const hash = key.split("/").pop() ?? "audio.mp3";
    const relPath = `/audio/generated/${userId}/${hash}`;
    const absDir = path.join(
      process.cwd(),
      "public",
      "audio",
      "generated",
      userId,
    );
    await mkdir(absDir, { recursive: true });
    await writeFile(path.join(absDir, hash), buffer);
    return relPath;
  }

  throw new AudioStorageError(
    "NOT_CONFIGURED",
    "Audio storage is not configured. Set BLOB_READ_WRITE_TOKEN on Vercel.",
  );
}
