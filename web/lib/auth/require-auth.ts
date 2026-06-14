import { NextResponse } from "next/server";

import type { UserRole } from "@/lib/auth/roles";
import { isAdminRole, isSuperAdminRole } from "@/lib/auth/roles";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export type AuthSession = {
  userId: string;
  role: UserRole;
};

export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  let role = session.user?.role as UserRole | undefined;
  if (!role) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    role = user?.role ?? "user";
  }

  return { userId, role };
}

export async function getAuthUserId(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.userId ?? null;
}

export async function requireAuthUserId(): Promise<
  string | NextResponse<{ error: string }>
> {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session.userId;
}

export async function requireAuthSession(): Promise<
  AuthSession | NextResponse<{ error: string }>
> {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireAdminSession(): Promise<
  AuthSession | NextResponse<{ error: string }>
> {
  const session = await requireAuthSession();
  if (session instanceof NextResponse) return session;
  if (!isAdminRole(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export async function requireSuperAdminSession(): Promise<
  AuthSession | NextResponse<{ error: string }>
> {
  const session = await requireAuthSession();
  if (session instanceof NextResponse) return session;
  if (!isSuperAdminRole(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export function isAuthError(
  result: string | AuthSession | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
