import { NextRequest, NextResponse } from "next/server";

import { cardListQuerySchema, cardWriteSchema } from "@/lib/api/schemas";
import { getAuthUserId, isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import * as cardsService from "@/services/backend/cards.service";

export async function GET(request: NextRequest) {
  const parsed = cardListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const userId = await getAuthUserId();
  try {
    const result = await cardsService.listCards(parsed.data, userId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "STUDIED_FILTER_REQUIRES_AUTH") {
      return NextResponse.json(
        { error: "studied filter requires authentication" },
        { status: 401 },
      );
    }
    throw err;
  }
}

export async function POST(request: Request) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;
  const userId = authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = cardWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const card = await cardsService.createCard(userId, parsed.data);
    return NextResponse.json(card, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_DECK") {
      return NextResponse.json({ error: "Invalid deck" }, { status: 400 });
    }
    const code =
      err && typeof err === "object" && "code" in err
        ? (err as { code: string }).code
        : null;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "A card with this id already exists" },
        { status: 409 },
      );
    }
    throw err;
  }
}
