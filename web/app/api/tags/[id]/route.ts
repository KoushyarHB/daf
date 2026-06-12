import { NextResponse } from "next/server";

import { tagUpdateSchema } from "@/lib/api/schemas";
import { isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import * as tagsService from "@/services/tags.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const tag = await tagsService.getTagById(id);
  if (!tag) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(tag);
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

  const parsed = tagUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await tagsService.updateTag(id, parsed.data);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result === "SLUG_EXISTS") {
    return NextResponse.json({ error: "Tag slug already exists" }, { status: 409 });
  }
  if (result === "INVALID_SLUG") {
    return NextResponse.json({ error: "Invalid tag slug" }, { status: 400 });
  }

  return NextResponse.json(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  const result = await tagsService.deleteTag(id);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result === "IN_USE") {
    return NextResponse.json(
      { error: "Tag is in use by cards or imports" },
      { status: 409 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
