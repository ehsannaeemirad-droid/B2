"use client";

import type { StringKey } from "@/lib/i18n";

export const STEP_TOTAL = 6;

export const STEP_DEFS: { n: number; key: StringKey }[] = [
  { n: 1, key: "step_vocab" },
  { n: 2, key: "step_reading" },
  { n: 3, key: "step_comprehension" },
  { n: 4, key: "step_discussion" },
  { n: 5, key: "step_retelling" },
  { n: 6, key: "step_ask_teacher" },
];
