import type { Lesson, Dictionary, DictEntry } from "./types";
import lesson01Json from "./lessons/lesson-01.json";
import dictionaryJson from "./dictionary.json";
import { CORE_LEXICON } from "./lexicon";
import { buildLessons, buildVocabGlossary, lessonIdFor, type Seed } from "./lessons/build";
import { SUPPLEMENTARY_1 } from "./lessons/supplementary-1";
import { SUPPLEMENTARY_2 } from "./lessons/supplementary-2";

export type LessonStatus = "ready" | "coming-soon";

export type LessonSummary = {
  id: string;
  order: number;
  title: string;
  status: LessonStatus;
};

const SEEDS: Seed[] = [...SUPPLEMENTARY_1, ...SUPPLEMENTARY_2];

export const REGISTRY: LessonSummary[] = [
  { id: "lesson-01", order: 1, title: "Marta’s New Career", status: "ready" },
  ...SEEDS.map((seed) => ({
    id: lessonIdFor(seed.n),
    order: seed.n,
    title: seed.title,
    status: "ready" as const,
  })),
];

const bundled = new Map<string, Lesson>([
  ["lesson-01", lesson01Json as unknown as Lesson],
  ...buildLessons(SEEDS).map((lesson): [string, Lesson] => [lesson.id, lesson]),
]);

/** Glosses contributed by each lesson's vocabulary table (word → meaning + example). */
const vocabGlossary = buildVocabGlossary(SEEDS);

export function getBundledLesson(id: string): Lesson | null {
  return bundled.get(id) ?? null;
}

/**
 * Returns the lesson, preferring an edited override saved in localStorage over
 * the bundled content. Client-only (needs the store); falls back to bundled data.
 */
export function getLesson(id: string, overrides?: Record<string, unknown>): Lesson | null {
  const override = overrides?.[id];
  if (override && typeof override === "object" && "id" in (override as object)) {
    return override as unknown as Lesson;
  }
  return getBundledLesson(id);
}

let dictionaryIndex: Map<string, DictEntry> | null = null;
let coreIndex: Map<string, DictEntry> | null = null;

export function getDictionary(): Map<string, DictEntry> {
  if (!dictionaryIndex) {
    dictionaryIndex = new Map<string, DictEntry>();
    for (const entry of dictionaryJson as unknown as Dictionary) {
      dictionaryIndex.set(entry.lemma, entry);
    }
  }
  return dictionaryIndex;
}

/** Shared high-frequency words, used after the base dictionary and lesson vocabulary. */
function getCoreLexicon(): Map<string, DictEntry> {
  if (!coreIndex) {
    coreIndex = new Map<string, DictEntry>();
    for (const [lemma, fa, pos] of CORE_LEXICON) {
      if (!coreIndex.has(lemma)) coreIndex.set(lemma, { lemma, fa, pos });
    }
  }
  return coreIndex;
}

export function lookupDictionary(lemma: string): DictEntry | undefined {
  return getDictionary().get(lemma) ?? vocabGlossary.get(lemma) ?? getCoreLexicon().get(lemma);
}

/** Total number of reading chunks in a lesson (for progress math). */
export function chunkCount(lesson: Lesson): number {
  return lesson.reading.chunks.length;
}
