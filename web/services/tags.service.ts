import type { Prisma } from "@prisma/client";

import {
  DAF_LEK_TAG_PREFIX,
  SYSTEM_TAGS,
  TAG_USER,
  lektionToDafTagLabel,
  lektionToDafTagSlug,
} from "@/lib/tags/constants";
import type { TagListQuery } from "@/lib/api/schemas";
import { buildPaginatedResponse } from "@/lib/api/types";
import type { PaginatedResponse } from "@/lib/api/types";
import { slugifyLabel, TAG_SLUG_PATTERN } from "@/lib/tags/slug";
import { canModifyTag } from "@/lib/tags/permissions";
import { prisma } from "@/lib/db/prisma";

export type TagDto = {
  id: string;
  slug: string;
  label: string;
  isSystem: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  cardCount?: number;
};

function rowToDto(
  row: {
    id: string;
    slug: string;
    label: string;
    isSystem: boolean;
    createdById: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count?: { cards: number };
  },
): TagDto {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    isSystem: row.isSystem,
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(row._count ? { cardCount: row._count.cards } : {}),
  };
}

export async function ensureSystemTags(): Promise<void> {
  for (const t of SYSTEM_TAGS) {
    await prisma.tag.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, label: t.label, isSystem: true },
      update: { label: t.label, isSystem: true },
    });
  }
}

export async function ensureTag(
  slugOrLabel: string,
  label?: string,
  options?: { isSystem?: boolean },
): Promise<TagDto> {
  const slug = TAG_SLUG_PATTERN.test(slugOrLabel)
    ? slugOrLabel
    : slugifyLabel(slugOrLabel);
  const resolvedLabel = label ?? slugOrLabel;
  const isSystem = options?.isSystem ?? false;

  const row = await prisma.tag.upsert({
    where: { slug },
    create: { slug, label: resolvedLabel, isSystem },
    update: {
      label: label ? resolvedLabel : undefined,
      ...(isSystem ? { isSystem: true } : {}),
    },
  });
  return rowToDto(row);
}

export async function ensureDafLekTag(lektion: number): Promise<TagDto> {
  return ensureTag(lektionToDafTagSlug(lektion), lektionToDafTagLabel(lektion), {
    isSystem: true,
  });
}

function buildTagSearchWhere(q: string | undefined): Prisma.TagWhereInput {
  const term = q?.trim();
  if (!term) return {};
  return {
    OR: [
      { label: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
    ],
  };
}

export async function listTagsPaginated(
  query: TagListQuery,
): Promise<PaginatedResponse<TagDto>> {
  const where = buildTagSearchWhere(query.q);
  const skip = (query.page - 1) * query.pageSize;
  const includeCardCount = query.counts === true;

  const [totalItems, rows] = await Promise.all([
    prisma.tag.count({ where }),
    prisma.tag.findMany({
      where,
      orderBy: [{ label: "asc" }],
      skip,
      take: query.pageSize,
      ...(includeCardCount
        ? { include: { _count: { select: { cards: true } } } }
        : {}),
    }),
  ]);

  const items = rows.map((r) => rowToDto(r as Parameters<typeof rowToDto>[0]));
  return buildPaginatedResponse(items, query.page, query.pageSize, totalItems);
}

export async function getTagBySlug(slug: string): Promise<TagDto | null> {
  const row = await prisma.tag.findUnique({ where: { slug } });
  return row ? rowToDto(row) : null;
}

export async function getTagById(id: string): Promise<TagDto | null> {
  const row = await prisma.tag.findUnique({ where: { id } });
  return row ? rowToDto(row) : null;
}

export type TagWriteInput = {
  slug?: string;
  label: string;
};

function isSuperAdminRole(role: string | undefined | null): boolean {
  return role === "super_admin";
}

export async function createTag(
  input: TagWriteInput,
  creator: { userId: string; role: string },
): Promise<TagDto | "SLUG_EXISTS" | "INVALID_SLUG"> {
  const slug = (input.slug?.trim() || slugifyLabel(input.label)).toLowerCase();
  if (!TAG_SLUG_PATTERN.test(slug)) return "INVALID_SLUG";

  const isSystem = isSuperAdminRole(creator.role);

  try {
    const row = await prisma.tag.create({
      data: {
        slug,
        label: input.label.trim(),
        isSystem,
        createdById: creator.userId,
      },
    });
    return rowToDto(row);
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return "SLUG_EXISTS";
    }
    throw err;
  }
}

export async function updateTag(
  id: string,
  input: Partial<TagWriteInput>,
  actor: { userId: string; role: string },
): Promise<TagDto | "NOT_FOUND" | "SLUG_EXISTS" | "INVALID_SLUG" | "FORBIDDEN"> {
  const existing = await prisma.tag.findUnique({ where: { id } });
  if (!existing) return "NOT_FOUND";
  if (!canModifyTag(existing, actor.userId, actor.role)) return "FORBIDDEN";

  const data: Prisma.TagUpdateInput = {};
  if (input.label !== undefined) data.label = input.label.trim();
  if (input.slug !== undefined) {
    const slug = input.slug.trim().toLowerCase();
    if (!TAG_SLUG_PATTERN.test(slug)) return "INVALID_SLUG";
    data.slug = slug;
  }

  try {
    const row = await prisma.tag.update({ where: { id }, data });
    return rowToDto(row);
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return "SLUG_EXISTS";
    }
    throw err;
  }
}

export async function deleteTag(
  id: string,
  actor: { userId: string; role: string },
): Promise<"OK" | "NOT_FOUND" | "IN_USE" | "FORBIDDEN"> {
  const existing = await prisma.tag.findUnique({
    where: { id },
    include: { _count: { select: { cards: true, userImports: true } } },
  });
  if (!existing) return "NOT_FOUND";
  if (!canModifyTag(existing, actor.userId, actor.role)) return "FORBIDDEN";
  if (existing._count.cards > 0 || existing._count.userImports > 0) {
    return "IN_USE";
  }

  await prisma.tag.delete({ where: { id } });
  return "OK";
}

export async function setCardTagsBySlugs(
  cardId: string,
  slugs: string[],
): Promise<void> {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
  if (unique.length === 0) {
    await prisma.cardTag.deleteMany({ where: { cardId } });
    return;
  }

  const tags = await Promise.all(unique.map((slug) => ensureTag(slug)));
  const tagIds = tags.map((t) => t.id);

  await prisma.$transaction(async (tx) => {
    await tx.cardTag.deleteMany({
      where: { cardId, tagId: { notIn: tagIds } },
    });
    for (const tagId of tagIds) {
      await tx.cardTag.upsert({
        where: { cardId_tagId: { cardId, tagId } },
        create: { cardId, tagId },
        update: {},
      });
    }
  });
}

export async function addCardTagBySlug(
  cardId: string,
  slug: string,
): Promise<void> {
  const tag = await ensureTag(slug);
  await prisma.cardTag.upsert({
    where: { cardId_tagId: { cardId, tagId: tag.id } },
    create: { cardId, tagId: tag.id },
    update: {},
  });
}

/** Tags for a community manifest card from lektion and/or explicit manifest tags. */
export function manifestCardTagSlugs(card: {
  tags?: string[] | null;
  lektion?: number | null;
}): string[] {
  const fromManifest = (card.tags ?? [])
    .map((t) => t.trim())
    .filter(Boolean);
  if (fromManifest.length > 0) return fromManifest;

  if (card.lektion != null && !Number.isNaN(card.lektion)) {
    return [lektionToDafTagSlug(card.lektion)];
  }
  return [];
}

export async function applyUserCardDefaultTag(cardId: string): Promise<void> {
  await addCardTagBySlug(cardId, TAG_USER);
}

export async function applyCommunityCardTags(
  cardId: string,
  card: { tags?: string[] | null; lektion?: number | null },
): Promise<void> {
  const slugs = manifestCardTagSlugs(card);
  if (slugs.length === 0) return;
  await setCardTagsBySlugs(cardId, slugs);
}

export function dafLekTagSlugsFromLektion(lektion: number): string {
  return `${DAF_LEK_TAG_PREFIX}${lektion}`;
}
