import type {
  DictEntry,
  DiscussionPrompt,
  Lesson,
  Question,
  ReadingChunk,
  Sentence,
  Token,
  VocabCard,
} from "../types";

/**
 * Compact, human-editable source for the supplementary lessons. A seed is turned
 * into a full `Lesson` by `buildLesson`, which tokenizes every sentence and
 * resolves lemmas against the glossy dictionary.
 */
export type Seed = {
  /** 1-based lesson number; decides the id (`lesson-02`, …). */
  n: number;
  title: string;
  subtitle: string;
  minutes: number;
  grammar: string[];
  /** [en, fa, pos, example, exampleFa] */
  vocab: [string, string, string, string, string][];
  chunks: { h: string; s: [string, string][] }[];
  /** ["mcq", prompt, options, answerIndex, explanation, explanationFa] */
  quiz: (
    | ["mcq", string, string[], number, string, string]
    | ["tf", string, number, string, string]
  )[];
  /** [en, fa, frame, frameFa] */
  discussion: [string, string, string, string][];
  /** [en, fa] */
  keywords: [string, string][];
};

/** Multi-word units worth keeping together as one tappable token. */
const EXTRA_PHRASES = [
  "a few",
  "a little",
  "a lot of",
  "according to",
  "add up",
  "as well as",
  "ask for",
  "at home",
  "at night",
  "at the same time",
  "at work",
  "because of",
  "blood flow",
  "every day",
  "every week",
  "eye strain",
  "feel like",
  "find out",
  "for example",
  "get up",
  "give up",
  "go to bed",
  "grow up",
  "in front of",
  "in the morning",
  "in the evening",
  "instead of",
  "listen to",
  "look at",
  "look forward to",
  "once a week",
  "on weekends",
  "pay for",
  "pick up",
  "public transportation",
  "put on",
  "real estate agent",
  "right away",
  "save money",
  "set a goal",
  "spend less",
  "stay up",
  "strength training",
  "such as",
  "take care of",
  "talk about",
  "talk to",
  "think about",
  "three times a week",
  "turn off",
  "turn on",
  "twice a week",
  "wait for",
  "wake up",
];

/** Lower-case a word and strip surrounding punctuation, keeping inner apostrophes. */
function normalize(word: string): string {
  return word
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "");
}

/**
 * Maps an inflected surface to the base form used as the dictionary key.
 * Falls back to the surface itself so the missing-gloss log can report it.
 */
function resolveLemma(word: string, gloss: Map<string, DictEntry>): string | undefined {
  if (!word) return undefined;
  const bases = new Set<string>([word]);
  if (word.endsWith("n't")) bases.add("not");
  if (word.endsWith("'s")) bases.add(word.slice(0, -2));
  if (word.endsWith("ies")) bases.add(`${word.slice(0, -3)}y`);
  if (/(ches|shes|xes|sses|ses)$/.test(word)) bases.add(word.slice(0, -2));
  if (word.endsWith("s")) bases.add(word.slice(0, -1));
  if (word.endsWith("ing")) {
    bases.add(word.slice(0, -3));
    bases.add(`${word.slice(0, -3)}e`);
  }
  if (word.endsWith("ed")) {
    bases.add(word.slice(0, -2));
    bases.add(word.slice(0, -1));
  }
  for (const base of bases) if (gloss.has(base)) return base;
  return word;
}

function tokenize(en: string, phrases: Set<string>, gloss: Map<string, DictEntry>): Token[] {
  const words = en.split(/\s+/).filter(Boolean);
  const tokens: Token[] = [];
  let i = 0;
  while (i < words.length) {
    let matched = 0;
    for (let len = Math.min(4, words.length - i); len >= 2; len--) {
      const joined = words
        .slice(i, i + len)
        .map(normalize)
        .join(" ");
      if (joined && phrases.has(joined)) {
        matched = len;
        break;
      }
    }
    if (matched) {
      const surface = words.slice(i, i + matched).join(" ");
      tokens.push({ surface, lemma: resolveLemma(normalize(surface), gloss), isPhrase: true });
      i += matched;
    } else {
      const surface = words[i];
      tokens.push({ surface, lemma: resolveLemma(normalize(surface), gloss) });
      i++;
    }
  }
  return tokens;
}

/** Every phrase used across a set of seeds, for phrase-aware tokenization. */
function phraseSet(seeds: Seed[]): Set<string> {
  const set = new Set(EXTRA_PHRASES);
  for (const seed of seeds) {
    for (const [en] of seed.vocab) {
      const normalized = normalize(en);
      if (normalized.includes(" ")) set.add(normalized);
    }
  }
  return set;
}

/** Vocabulary of every seeded lesson, used to gloss words the base dictionary lacks. */
export function buildVocabGlossary(seeds: Seed[]): Map<string, DictEntry> {
  const map = new Map<string, DictEntry>();
  for (const seed of seeds) {
    for (const [en, fa, pos, example] of seed.vocab) {
      const lemma = normalize(en);
      if (lemma && !map.has(lemma)) map.set(lemma, { lemma, fa, pos, def: example });
    }
  }
  return map;
}

export function lessonIdFor(n: number): string {
  return `lesson-${String(n).padStart(2, "0")}`;
}

export function buildLesson(seed: Seed, phrases: Set<string>, gloss: Map<string, DictEntry>): Lesson {
  const vocabulary: VocabCard[] = seed.vocab.map(([en, fa, pos, example, exampleFa]) => ({
    en,
    fa,
    pos,
    example,
    exampleFa,
  }));

  let sentenceNumber = 0;
  const chunks: ReadingChunk[] = seed.chunks.map((chunk, ci) => ({
    id: `chunk-${ci + 1}`,
    heading: chunk.h,
    sentences: chunk.s.map(([en, fa]): Sentence => {
      sentenceNumber += 1;
      return {
        id: `s${sentenceNumber}`,
        en,
        fa,
        tokens: tokenize(en, phrases, gloss),
      };
    }),
  }));

  const comprehension: Question[] = seed.quiz.map((item, qi) => {
    const id = `q${qi + 1}`;
    if (item[0] === "tf") {
      return {
        id,
        type: "truefalse",
        prompt: item[1],
        options: ["True", "False"],
        answerIndex: item[2],
        explanation: item[3],
        explanationFa: item[4],
      };
    }
    return {
      id,
      type: "mcq",
      prompt: item[1],
      options: item[2],
      answerIndex: item[3],
      explanation: item[4],
      explanationFa: item[5],
    };
  });

  const discussion: DiscussionPrompt[] = seed.discussion.map(([en, fa, frame, frameFa], di) => ({
    id: `d${di + 1}`,
    en,
    fa,
    frame,
    frameFa,
  }));

  return {
    id: lessonIdFor(seed.n),
    order: seed.n,
    title: seed.title,
    subtitle: seed.subtitle,
    level: "A1",
    grammarFocus: seed.grammar,
    estimatedMinutes: seed.minutes,
    vocabulary,
    reading: { chunks },
    comprehension,
    discussion,
    retelling: {
      prompt: `Retell “${seed.title}” in 30–60 seconds. Use at least 6 key words.`,
      keyWords: seed.keywords.map(([en, fa]) => ({ en, fa })),
    },
  };
}

/** Builds every seeded lesson with a shared phrase list and glossary. */
export function buildLessons(seeds: Seed[]): Lesson[] {
  const phrases = phraseSet(seeds);
  const gloss = buildVocabGlossary(seeds);
  return seeds.map((seed) => buildLesson(seed, phrases, gloss));
}
