"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getLesson, getBundledLesson } from "@/content/registry";
import { useTapRead } from "@/lib/store";
import { STRINGS } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { STEP_DEFS } from "@/components/steps/defs";
import { StepVocabulary } from "@/components/steps/StepVocabulary";
import { StepReading } from "@/components/steps/StepReading";
import { StepComprehension } from "@/components/steps/StepComprehension";
import { StepDiscussion } from "@/components/steps/StepDiscussion";
import { StepRetelling } from "@/components/steps/StepRetelling";
import { StepAskTeacher } from "@/components/steps/StepAskTeacher";

export default function LessonStepPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen justify-center bg-shell">
        <main className="w-full max-w-[480px] min-h-screen" />
      </div>
    }>
      <LessonStepInner />
    </React.Suspense>
  );
}

function LessonStepInner() {
  const { id, step } = useParams<{ id: string; step: string }>();
  const router = useRouter();
  const state = useTapRead();
  const lang = state.settings.uiLang;

  const lesson = getLesson(id ?? "lesson-01", state.lessonOverrides);
  const bundled = getBundledLesson(id ?? "lesson-01");
  const stepNum = Number(step);

  if (!lesson || !bundled || !(stepNum >= 1 && stepNum <= STEP_DEFS.length)) {
    return (
      <AppShell>
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
          <p className="text-center text-muted">{STRINGS.coming_soon[lang]}</p>
          <Button variant="ghost" className="mt-4" onClick={() => router.push("/")}>
            {STRINGS.back[lang]}
          </Button>
        </div>
      </AppShell>
    );
  }

  const goNext = () => {
    const next = stepNum + 1;
    if (next <= STEP_DEFS.length) {
      router.push(`/lesson/${lesson.id}/step/${next}`);
    } else {
      router.push(`/lesson/${lesson.id}`);
    }
  };

  const onDone = () => {
    // Steps mark themselves done; the final step completes the lesson.
    goNext();
  };

  const shared = { lesson, lang, onDone: onDone };

  switch (stepNum) {
    case 1:
      return <StepVocabulary {...shared} />;
    case 2:
      return <StepReading {...shared} />;
    case 3:
      return <StepComprehension {...shared} />;
    case 4:
      return <StepDiscussion {...shared} />;
    case 5:
      return <StepRetelling {...shared} />;
    case 6:
      return <StepAskTeacher {...shared} />;
    default:
      return null;
  }
}
