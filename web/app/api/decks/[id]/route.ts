import { NextResponse } from "next/server";

import { deckUpdateSchema } from "@/lib/api/schemas";
import { isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import * as decksService from "@/services/backend/decks.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  const deck = await decksService.getDeckForUser(id, authResult);
  if (!deck) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deck);
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = deckUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await decksService.updateDeck(id, authResult, parsed.data);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  const result = await decksService.deleteDeck(id, authResult);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result === "NOT_EMPTY") {
    return NextResponse.json(
      { error: "Deck must be empty and you must have another deck" },
      { status: 409 },
    );
  }
  return new NextResponse(null, { status: 204 });
}
