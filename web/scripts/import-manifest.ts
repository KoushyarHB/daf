/**
 * Idempotent import: vocab.manifest.json + lesson-pages.manifest.json → Postgres.
 * Run from web/: npm run db:import-manifest
 */
import { readFileSync } from "fs";
import path from "path";

import { PrismaClient } from "@prisma/client";

import {
  enrichCards,
  validCards,
  cardDomId,
} from "../lib/vocab/card-utils";
import type { VocabCard, LessonPageEntry, VocabPos } from "../lib/vocab/types";
import { normalizeVocabPos } from "../lib/vocab/types";
import { ensureDefaultImportUser } from "../services/users.service";

const prisma = new PrismaClient();

function repoRoot(): string {
  const fromEnv = process.env.MANIFEST_ROOT?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(process.cwd(), "..");
}

function readJson<T>(filename: string): T {
  const filePath = path.join(repoRoot(), filename);
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

function toPrismaPos(pos: string | undefined): VocabPos {
  return normalizeVocabPos(pos);
}

function parseDate(iso: string | undefined, fallback: Date): Date {
  if (!iso?.trim()) return fallback;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

async function importCards(defaultUserId: string): Promise<number> {
  const raw = readJson<unknown[]>("vocab.manifest.json");
  const cards = enrichCards(validCards(raw as VocabCard[]));
  const now = new Date();

  let count = 0;
  for (let index = 0; index < cards.length; index++) {
    const card = cards[index];
    const id = cardDomId(card, card.deckNo);
    const createdAt = parseDate(card.createdAt, now);
    const updatedAt = parseDate(card.updatedAt, createdAt);

    await prisma.card.upsert({
      where: { id },
      create: {
        id,
        userId: defaultUserId,
        head: card.head,
        ipa: card.ipa ?? null,
        pos: toPrismaPos(card.pos ?? "other"),
        pluralRule: card.pluralRule ?? null,
        pluralForm: card.plural ?? null,
        imagePath: card.image ?? null,
        audioPath: card.audio ?? null,
        lektion: card.lektion,
        level: card.level,
        sortOrder: index,
        grammarTable: card.grammarTable ?? undefined,
        createdAt,
        updatedAt,
      },
      update: {
        userId: defaultUserId,
        head: card.head,
        ipa: card.ipa ?? null,
        pos: toPrismaPos(card.pos ?? "other"),
        pluralRule: card.pluralRule ?? null,
        pluralForm: card.plural ?? null,
        imagePath: card.image ?? null,
        audioPath: card.audio ?? null,
        lektion: card.lektion,
        level: card.level,
        sortOrder: index,
        grammarTable: card.grammarTable ?? undefined,
        createdAt,
        updatedAt,
      },
    });

    await prisma.cardGloss.deleteMany({ where: { cardId: id } });
    await prisma.cardNote.deleteMany({ where: { cardId: id } });
    await prisma.cardExample.deleteMany({ where: { cardId: id } });

    const glosses = (card.gloss ?? []).filter((g) => g.trim());
    if (glosses.length > 0) {
      await prisma.cardGloss.createMany({
        data: glosses.map((text, sortOrder) => ({
          cardId: id,
          text: text.trim(),
          sortOrder,
        })),
      });
    }

    const notes = (card.notes ?? []).filter((n) => n.trim());
    if (notes.length > 0) {
      await prisma.cardNote.createMany({
        data: notes.map((text, sortOrder) => ({
          cardId: id,
          text: text.trim(),
          sortOrder,
        })),
      });
    }

    if (card.examples.length > 0) {
      await prisma.cardExample.createMany({
        data: card.examples.map((ex, sortOrder) => ({
          cardId: id,
          german: ex.german,
          english: ex.english,
          audioPath: ex.audio ?? null,
          sortOrder,
        })),
      });
    }

    count++;
  }

  return count;
}

function parseLessonManifest(blob: unknown): LessonPageEntry[] {
  if (!Array.isArray(blob)) return [];
  const out: LessonPageEntry[] = [];
  for (const item of blob) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const lek = Number(rec.lektion);
    if (Number.isNaN(lek)) continue;
    const title = String(rec.title ?? `Lektion ${lek}`).trim();
    const wp = rec.wordPage as Record<string, unknown> | undefined;
    const gp = rec.grammarPage as Record<string, unknown> | undefined;
    if (!wp || !gp) continue;
    const wpImg = String(wp.image ?? "").trim();
    const gpImg = String(gp.image ?? "").trim();
    if (!wpImg || !gpImg) continue;
    out.push({
      lektion: lek,
      title,
      wordPage: {
        label: String(wp.label ?? "Words page").trim() || "Words page",
        image: wpImg,
      },
      grammarPage: {
        label: String(gp.label ?? "Grammar page").trim() || "Grammar page",
        image: gpImg,
      },
    });
  }
  return out.sort((a, b) => a.lektion - b.lektion);
}

async function importLessons(): Promise<number> {
  const lessons = parseLessonManifest(
    readJson<unknown>("lesson-pages.manifest.json"),
  );
  let count = 0;
  for (const lesson of lessons) {
    await prisma.lesson.upsert({
      where: { lektion: lesson.lektion },
      create: { lektion: lesson.lektion, title: lesson.title },
      update: { title: lesson.title },
    });

    await prisma.lessonPage.upsert({
      where: {
        lessonId_kind: { lessonId: lesson.lektion, kind: "word" },
      },
      create: {
        lessonId: lesson.lektion,
        kind: "word",
        label: lesson.wordPage.label,
        imagePath: lesson.wordPage.image,
      },
      update: {
        label: lesson.wordPage.label,
        imagePath: lesson.wordPage.image,
      },
    });

    await prisma.lessonPage.upsert({
      where: {
        lessonId_kind: { lessonId: lesson.lektion, kind: "grammar" },
      },
      create: {
        lessonId: lesson.lektion,
        kind: "grammar",
        label: lesson.grammarPage.label,
        imagePath: lesson.grammarPage.image,
      },
      update: {
        label: lesson.grammarPage.label,
        imagePath: lesson.grammarPage.image,
      },
    });

    count++;
  }
  return count;
}

async function main(): Promise<void> {
  const defaultUserId = await ensureDefaultImportUser();
  console.log(`Default import user: ${defaultUserId}`);
  const cardCount = await importCards(defaultUserId);
  const lessonCount = await importLessons();
  console.log(`Imported ${cardCount} cards and ${lessonCount} lessons.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
