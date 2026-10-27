import type { Lesson, Dictionary, DictEntry } from "./types";
import lesson01Json from "./lessons/lesson-01.json";

export type LessonStatus = "ready" | "coming-soon";

export type LessonSummary = {
  id: string;
  order: number;
  title: string;
  status: LessonStatus;
};

export const LESSON_TITLES: string[] = [
  "Marta’s New Career",
  "Tired in the Mornings",
  "5 Habits That Help People Save Money",
  "Stuck on My Phone",
  "5 Hobbies People Often Miss",
  "A Musician’s Routine",
  "5 Popular Areas to Live in the City",
  "A Real Estate Agent",
  "Sleepless Downstairs",
  "5 Common Reasons People Move to a New Country",
  "Training for a Marathon",
  "Afraid to Start Again",
  "5 Habits That Can Improve Your Health",
  "A Physiotherapist",
  "Overspending and Embarrassed",
  "5 Simple Ways to Spend Less While Shopping",
  "A Personal Stylist",
  "5 Good Reasons to Learn a New Language",
  "Homesick and Tired",
  "Learning a New Language as an Adult",
];

export const REGISTRY: LessonSummary[] = LESSON_TITLES.map((title, i) => ({
  id: `lesson-${String(i + 1).padStart(2, "0")}`,
  order: i + 1,
  title,
  status: i === 0 ? ("ready" as const) : ("coming-soon" as const),
}));

const bundled = new Map<string, Lesson>([
  ["lesson-01", lesson01Json as unknown as Lesson],
]);

export function getBundledLesson(id: string): Lesson | null {
  return bundled.get(id) ?? null;
}

/**
 * Returns the lesson, preferring an edited override saved in localStorage over
 * the bundled JSON. Client-only (needs the store); falls back to bundled JSON.
 */
export function getLesson(id: string, overrides?: Record<string, unknown>): Lesson | null {
  const override = overrides?.[id];
  if (override && typeof override === "object" && "id" in (override as object)) {
    return override as unknown as Lesson;
  }
  return getBundledLesson(id);
}

let dictionaryIndex: Map<string, DictEntry> | null = null;
import dictionaryJson from "./dictionary.json";

export function getDictionary(): Map<string, DictEntry> {
  if (!dictionaryIndex) {
    dictionaryIndex = new Map<string, DictEntry>();
    for (const entry of dictionaryJson as unknown as Dictionary) {
      dictionaryIndex.set(entry.lemma, entry);
    }
  }
  return dictionaryIndex;
}

export function lookupDictionary(lemma: string): DictEntry | undefined {
  return getDictionary().get(lemma);
}

/** Total number of reading chunks in a lesson (for progress math). */
export function chunkCount(lesson: Lesson): number {
  return lesson.reading.chunks.length;
}
