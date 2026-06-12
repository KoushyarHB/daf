import { NextRequest, NextResponse } from "next/server";

import { tagListQuerySchema, tagWriteSchema } from "@/lib/api/schemas";
import { isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import * as tagsService from "@/services/tags.service";

export async function GET(request: NextRequest) {
  const parsed = tagListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await tagsService.listTagsPaginated(parsed.data);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = tagWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await tagsService.createTag(parsed.data);
  if (result === "SLUG_EXISTS") {
    return NextResponse.json({ error: "Tag slug already exists" }, { status: 409 });
  }
  if (result === "INVALID_SLUG") {
    return NextResponse.json({ error: "Invalid tag slug" }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
