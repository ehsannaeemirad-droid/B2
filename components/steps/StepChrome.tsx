"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/content/types";
import { Progress } from "@/components/ui/kit";
import { STRINGS, t, type UiLang } from "@/lib/i18n";
import { STEP_DEFS } from "./defs";

/** Duolingo-style lesson header: close button, step progress, step name. */
export function StepChrome({
  lesson,
  step,
  lang,
}: {
  lesson: Lesson;
  step: number;
  lang: UiLang;
}) {
  const router = useRouter();
  const def = STEP_DEFS[step - 1];
  return (
    <div
      data-lesson-title={lesson.title}
      data-step-of={step}
      className="sticky top-0 z-10 -mx-4 mb-5 border-b-2 border-[#f0f0f0] bg-white/95 px-4 py-3 backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={STRINGS.back.en}
          onClick={() => router.push(`/lesson/${lesson.id}`)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#afafaf] transition-colors hover:bg-[#f7f7f7] hover:text-[#777]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <p className="truncate text-[13px] font-extrabold uppercase tracking-[0.8px] text-[#afafaf]">
              {t(lang, def.key)}
            </p>
            <span className="shrink-0 text-[12px] font-extrabold text-[color:var(--success)]">
              {step}/{STEP_DEFS.length}
            </span>
          </div>
          <Progress value={((step - 1) / STEP_DEFS.length) * 100} className="h-3" />
        </div>
      </div>
    </div>
  );
}
