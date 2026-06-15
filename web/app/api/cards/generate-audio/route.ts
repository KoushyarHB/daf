import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import {
  AudioStorageError,
  generateCardAudio,
  speakTextForCardHead,
} from "@/services/audio.service";

const bodySchema = z.object({
  text: z.string().max(500).optional(),
  head: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const speakText =
    parsed.data.text?.trim() ||
    (parsed.data.head ? speakTextForCardHead(parsed.data.head) : "");
  if (!speakText) {
    return NextResponse.json(
      { error: "Provide non-empty text or head" },
      { status: 400 },
    );
  }

  try {
    const audio = await generateCardAudio(authResult, speakText);
    return NextResponse.json({ audio, speakText });
  } catch (err) {
    if (err instanceof AudioStorageError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Pronunciation generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
