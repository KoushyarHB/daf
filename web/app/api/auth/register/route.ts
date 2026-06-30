import { NextResponse } from "next/server";

import { registerSchema } from "@/lib/api/schemas";
import { registerUser } from "@/services/backend/users.service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await registerUser(parsed.data);
  if ("error" in result) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  return NextResponse.json({ user: result.user }, { status: 201 });
}
