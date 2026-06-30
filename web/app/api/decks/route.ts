import { NextRequest, NextResponse } from "next/server";

import { deckListQuerySchema, deckWriteSchema } from "@/lib/api/schemas";
import { isAuthError, requireAuthSession } from "@/lib/auth/require-auth";
import * as decksService from "@/services/backend/decks.service";

export async function GET(request: NextRequest) {
  const authResult = await requireAuthSession();
  if (isAuthError(authResult)) return authResult;

  const parsed = deckListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await decksService.listDecksForUser(authResult.userId, parsed.data);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const authResult = await requireAuthSession();
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = deckWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isSystem = authResult.role === "super_admin";
  const deck = await decksService.createDeck(authResult.userId, parsed.data, {
    isSystem,
  });
  return NextResponse.json(deck, { status: 201 });
}
