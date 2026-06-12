import { z } from "zod";

import { CEFR_LEVELS } from "@/lib/vocab/levels";
import { VOCAB_POS_ORDER, type VocabPos } from "@/lib/vocab/types";

const posFilterValues = ["all", ...VOCAB_POS_ORDER] as const;

export const cardListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  tag: z.string().optional(),
  level: z.string().optional(),
  pos: z.enum(posFilterValues).optional(),
  studied: z.enum(["all", "true", "false"]).optional(),
  sort: z.preprocess(
    (val) => (val === "deck" ? "deck-desc" : val),
    z.enum(["deck-desc", "deck-asc", "date-asc", "date-desc"]),
  ).default("deck-desc"),
});

export type CardListQuery = z.infer<typeof cardListQuerySchema>;

export const progressPatchSchema = z.object({
  studied: z.boolean(),
});

const exampleSchema = z.object({
  german: z.string().min(1),
  english: z.string().nullable().optional(),
  audio: z.string().optional(),
});

export const cardWriteSchema = z.object({
  id: z.string().min(1).optional(),
  head: z.string().min(1),
  ipa: z.string().optional(),
  pos: z.enum(VOCAB_POS_ORDER as [VocabPos, ...VocabPos[]]).optional(),
  gloss: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
  examples: z.array(exampleSchema).default([]),
  pluralRule: z.string().optional(),
  plural: z.string().optional(),
  grammarTable: z
    .object({
      columns: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    })
    .nullable()
    .optional(),
  image: z.string().optional(),
  audio: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  level: z.enum(CEFR_LEVELS).default("A1"),
});

export const tagListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  counts: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export type TagListQuery = z.infer<typeof tagListQuerySchema>;

export const tagWriteSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  label: z.string().min(1),
});

export const tagUpdateSchema = tagWriteSchema.partial().extend({
  label: z.string().min(1).optional(),
});

export const tagImportBodySchema = z.object({
  slug: z.string().min(1),
});

export const cardUpdateSchema = cardWriteSchema.partial().extend({
  head: z.string().min(1).optional(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});
