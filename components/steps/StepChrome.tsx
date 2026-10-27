"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/content/types";
import { Badge } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { STRINGS, t, type UiLang } from "@/lib/i18n";
import { STEP_DEFS } from "./defs";

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
    <div data-lesson-title={lesson.title} data-step-of={step} className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-2 border-b border-line bg-page/95 px-4 py-3 backdrop-blur">
      <Button variant="ghost" aria-label={STRINGS.back.en} className="h-11 w-11 px-0" onClick={() => router.push(`/lesson/${lesson.id}`)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-tight text-ink">{lesson.title}</p>
        <p className="text-xs text-muted">{t(lang, def.key)}</p>
      </div>
      <Badge className="bg-[#ecebe6] text-muted">
        {step}/{STEP_DEFS.length}
      </Badge>
    </div>
  );
}
