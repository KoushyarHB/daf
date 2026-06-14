import type { UserRole } from "@prisma/client";

export type { UserRole };

export const USER_ROLES: UserRole[] = ["user", "admin", "super_admin"];

export function isAdminRole(role: UserRole | string | undefined | null): boolean {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdminRole(
  role: UserRole | string | undefined | null,
): boolean {
  return role === "super_admin";
}

export function roleLabel(role: UserRole): string {
  if (role === "super_admin") return "Super admin";
  if (role === "admin") return "Admin";
  return "User";
}

/** Comma-separated emails from SUPER_ADMIN_EMAILS env (auto-promote on register). */
export function superAdminEmailsFromEnv(): Set<string> {
  const raw = process.env.SUPER_ADMIN_EMAILS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => e.toLowerCase().trim())
      .filter(Boolean),
  );
}

export function resolveRegisterRole(email: string): UserRole {
  if (superAdminEmailsFromEnv().has(email.toLowerCase().trim())) {
    return "super_admin";
  }
  return "user";
}
