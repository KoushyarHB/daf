import { NextResponse } from "next/server";

import { publishDeckBodySchema } from "@/lib/api/schemas";
import { isAuthError, requireAdminSession } from "@/lib/auth/require-auth";
import * as adminDecksService from "@/services/admin-decks.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  let body: unknown = {};
  try {
    const text = await request.text();
    if (text.trim()) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = publishDeckBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await adminDecksService.publishDeckToCommunity(
    id,
    authResult.userId,
    parsed.data,
  );
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }
  if (result === "EMPTY") {
    return NextResponse.json({ error: "Deck has no cards to publish" }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
