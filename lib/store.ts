"use client";

import { useSyncExternalStore } from "react";

export type VocabRating = "know" | "unsure" | "dontknow";
export type UiLang = "en" | "fa";
export type TextSize = "normal" | "large";

export type Settings = {
  supportMode: boolean;
  uiLang: UiLang;
  textSize: TextSize;
  teacherMode: boolean;
  editorEnabled: boolean;
};

export type LessonProgress = {
  stepsDone: number[];
  completedAt?: string;
  comprehension?: {
    score: number;
    total: number;
    answers: Record<string, { chosen: number; correct: boolean }>;
  };
  discussion?: {
    selected: string[];
    notes: Record<string, string>;
    audio: Record<string, string>;
  };
  retelling?: { audio?: string; checked: string[] };
  askTeacher?: { questions: string[]; submitted?: boolean };
};

export type MissingGloss = { surface: string; lemma?: string; lessonId: string; at: string };

export type TapReadState = {
  settings: Settings;
  ratings: Record<string, VocabRating>;
  reviewList: Record<string, string>; // en -> fa
  lessonOverrides: Record<string, unknown>; // lesson id -> edited lesson JSON
  lessons: Record<string, LessonProgress>;
  missingGlosses: MissingGloss[];
};

export const STORE_KEY = "tapread:v1";

export const DEFAULT_STATE: TapReadState = {
  settings: {
    supportMode: true,
    uiLang: "en",
    textSize: "normal",
    teacherMode: false,
    editorEnabled: false,
  },
  ratings: {},
  reviewList: {},
  lessonOverrides: {},
  lessons: {},
  missingGlosses: [],
};

let snapshot: TapReadState = DEFAULT_STATE;
const listeners = new Set<() => void>();

export function getState(): TapReadState {
  return snapshot;
}

export function setState(updater: (prev: TapReadState) => TapReadState) {
  const next = updater(getState());
  snapshot = next;
  persist(next);
  listeners.forEach((l) => l());
}

export function resetAll() {
  setState(() => ({ ...DEFAULT_STATE }));
}

function persist(state: TapReadState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("TapRead: could not persist state", e);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function reviveState(raw: any): TapReadState {
  if (!raw || typeof raw !== "object") return DEFAULT_STATE;
  return {
    settings: { ...DEFAULT_STATE.settings, ...(raw.settings ?? {}) },
    ratings: raw.ratings ?? {},
    reviewList: raw.reviewList ?? {},
    lessonOverrides: raw.lessonOverrides ?? {},
    lessons: raw.lessons ?? {},
    missingGlosses: Array.isArray(raw.missingGlosses) ? raw.missingGlosses : [],
  };
}

function ensureLoaded() {
  if (snapshot !== DEFAULT_STATE) return;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      snapshot = reviveState(JSON.parse(raw));
    } else {
      snapshot = { ...DEFAULT_STATE };
    }
  } catch (e) {
    console.warn("TapRead: could not load state", e);
    snapshot = { ...DEFAULT_STATE };
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getClientSnapshot() {
  ensureLoaded();
  return snapshot;
}

export function useTapRead(): TapReadState {
  return useSyncExternalStore(subscribe, getClientSnapshot, () => DEFAULT_STATE);
}

/* --- convenience mutators --- */

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function setRating(lessonId: string, word: string, rating: VocabRating) {
  setState((s) => ({ ...s, ratings: { ...s.ratings, [`${lessonId}:${word}`]: rating } }));
}

export function addToReviewList(en: string, fa: string) {
  setState((s) => (s.reviewList[en] === fa ? s : { ...s, reviewList: { ...s.reviewList, [en]: fa } }));
}

export function logMissingGloss(lessonId: string, surface: string, lemma?: string) {
  setState((s) => {
    if (s.missingGlosses.some((g) => g.surface === surface && g.lessonId === lessonId)) return s;
    return {
      ...s,
      missingGlosses: [
        { surface, lemma, lessonId, at: new Date().toISOString() },
        ...s.missingGlosses,
      ].slice(0, 200),
    };
  });
}

export function getLessonProgress(state: TapReadState, lessonId: string): LessonProgress {
  return state.lessons[lessonId] ?? { stepsDone: [] };
}

export function mutateLesson(
  lessonId: string,
  fn: (p: LessonProgress) => LessonProgress
) {
  setState((s) => {
    const prev = s.lessons[lessonId] ?? { stepsDone: [] };
    return { ...s, lessons: { ...s.lessons, [lessonId]: fn(prev) } };
  });
}

export function markStepDone(lessonId: string, step: number) {
  mutateLesson(lessonId, (p) => ({
    ...p,
    stepsDone: p.stepsDone.includes(step) ? p.stepsDone : [...p.stepsDone, step],
  }));
}

export function lessonCompleted(state: TapReadState, lessonId: string): boolean {
  const p = state.lessons[lessonId];
  return Boolean(p?.completedAt);
}

export function completeLesson(lessonId: string) {
  mutateLesson(lessonId, (p) =>
    p.completedAt ? p : { ...p, completedAt: new Date().toISOString() }
  );
}

export function saveLessonOverride(lessonId: string, lesson: unknown) {
  setState((s) => ({
    ...s,
    lessonOverrides: { ...s.lessonOverrides, [lessonId]: lesson },
  }));
}

export function clearLessonOverride(lessonId: string) {
  setState((s) => {
    const next = { ...s.lessonOverrides };
    delete next[lessonId];
    return { ...s, lessonOverrides: next };
  });
}

/* Applied side-effects that depend on settings (document attributes). */
export function applyDocumentSettings(state: TapReadState) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.textSize = state.settings.textSize;
  document.documentElement.lang = state.settings.uiLang === "fa" ? "fa" : "en";
}
