import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";

import type { z } from "zod";
import type {
  adminUserListQuerySchema,
  adminUserWriteSchema,
  adminUserUpdateSchema,
} from "@/lib/api/schemas";
import { buildPaginatedResponse } from "@/lib/api/types";
import type { PaginatedResponse } from "@/lib/api/types";
import { prisma } from "@/lib/db/prisma";
import { ensureDefaultDeck } from "@/services/decks.service";
import { findUserByEmail } from "@/services/users.service";

const BCRYPT_ROUNDS = 12;

type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
type AdminUserWriteInput = z.infer<typeof adminUserWriteSchema>;
type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;

export type AdminUserDto = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};

function rowToDto(row: {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
}): AdminUserDto {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  };
}

const DEFAULT_IMPORT_EMAIL = "system@import.local";

export async function listUsersAdmin(
  query: AdminUserListQuery,
): Promise<PaginatedResponse<AdminUserDto>> {
  const q = query.q?.trim();
  const where = {
    email: { not: DEFAULT_IMPORT_EMAIL },
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.pageSize;
  const [totalItems, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  return buildPaginatedResponse(
    rows.map(rowToDto),
    query.page,
    query.pageSize,
    totalItems,
  );
}

export async function createUserAdmin(
  input: AdminUserWriteInput,
): Promise<AdminUserDto | "EMAIL_TAKEN"> {
  const email = input.email.toLowerCase().trim();
  const existing = await findUserByEmail(email);
  if (existing) return "EMAIL_TAKEN";

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: input.name?.trim() || null,
      role: input.role ?? "user",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  await ensureDefaultDeck(user.id);
  return rowToDto(user);
}

export async function updateUserAdmin(
  userId: string,
  input: AdminUserUpdateInput,
  actorRole: UserRole,
): Promise<AdminUserDto | "NOT_FOUND" | "FORBIDDEN"> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!existing) return "NOT_FOUND";
  if (existing.email === DEFAULT_IMPORT_EMAIL) return "FORBIDDEN";

  if (
    input.role !== undefined &&
    existing.role === "super_admin" &&
    actorRole !== "super_admin"
  ) {
    return "FORBIDDEN";
  }

  const data: {
    name?: string | null;
    role?: UserRole;
    passwordHash?: string;
  } = {};

  if (input.name !== undefined) {
    data.name = input.name?.trim() || null;
  }
  if (input.role !== undefined) {
    data.role = input.role;
  }
  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  return rowToDto(user);
}

export async function deleteUserAdmin(
  userId: string,
  actorUserId: string,
): Promise<"OK" | "NOT_FOUND" | "FORBIDDEN"> {
  if (userId === actorUserId) return "FORBIDDEN";

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!existing) return "NOT_FOUND";
  if (existing.email === DEFAULT_IMPORT_EMAIL) return "FORBIDDEN";

  await prisma.user.delete({ where: { id: userId } });
  return "OK";
}
