export function canModifyTag(
  tag: { isSystem: boolean; createdById: string | null },
  userId: string,
  role: string,
): boolean {
  if (tag.isSystem) return role === "super_admin";
  if (tag.createdById === userId) return true;
  return role === "super_admin";
}
