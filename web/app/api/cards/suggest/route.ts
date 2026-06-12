import { NextResponse } from "next/server";
import { z } from "zod";

import { AiSuggestError, suggestCardFromHeadword } from "@/lib/ai/suggest-card";
import { isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";

const bodySchema = z.object({
  head: z.string().min(1).max(200),
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

  try {
    const suggestion = await suggestCardFromHeadword(parsed.data.head);
    return NextResponse.json(suggestion);
  } catch (err) {
    if (err instanceof AiSuggestError) {
      const status =
        err.code === "NOT_CONFIGURED"
          ? 503
          : err.code === "PARSE"
            ? 422
            : 502;
      return NextResponse.json({ error: err.message }, { status });
    }
    throw err;
  }
}
