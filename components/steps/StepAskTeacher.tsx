"use client";

import * as React from "react";
import type { Lesson } from "@/content/types";
import { StepChrome } from "./StepChrome";
import { mutateLesson, markStepDone, getLessonProgress, completeLesson, useTapRead } from "@/lib/store";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { STRINGS, type UiLang } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function StepAskTeacher({
  lesson,
  lang,
}: {
  lesson: Lesson;
  lang: UiLang;
  onDone: () => void;
}) {
  const state = useTapRead();
  const router = useRouter();
  const progress = getLessonProgress(state, lesson.id);
  const questions = progress.askTeacher?.questions ?? ["", "", ""];
  const submitted = progress.askTeacher?.submitted ?? false;

  const [local, setLocal] = React.useState<string[]>(questions);

  const save = (next: string[]) => {
    setLocal(next);
    mutateLesson(lesson.id, (p) => ({ ...p, askTeacher: { questions: next, submitted: p.askTeacher?.submitted } }));
  };

  const submit = () => {
    mutateLesson(lesson.id, (p) => ({ ...p, askTeacher: { questions: local, submitted: true } }));
    markStepDone(lesson.id, 6);
    completeLesson(lesson.id);
  };

  if (submitted) {
    return (
      <AppShell>
        <Screen>
          <StepChrome lesson={lesson} step={6} lang={lang} />
          <div className="mx-auto mt-20 max-w-sm rounded-2xl border border-line bg-white p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="mt-4 text-xl font-semibold text-ink">{STRINGS.submitted.en} · <span className="fa">{STRINGS.submitted.fa}</span></p>
            <p className="mt-2 text-sm text-muted">Lesson 1 complete.</p>
            <Button className="mt-6 w-full" onClick={() => router.push("/")}>
              {STRINGS.done[lang] + " · "}
              <span className="fa">{STRINGS.done.fa}</span>
            </Button>
          </div>
        </Screen>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell>
        <Screen>
          <StepChrome lesson={lesson} step={6} lang={lang} />
          <p className="text-[15px] font-semibold text-ink">{lesson.askTeacher.prompt}</p>
          <p className="mt-1 text-sm text-muted">
            {lesson.askTeacher.helper} · <span className="fa">{STRINGS.ask_teacher_helper.fa}</span>
          </p>

          <div className="mt-4 flex flex-col gap-4 pb-28">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-line bg-white p-4">
                <label className="mb-2 block text-sm font-medium text-muted">Question {i + 1}</label>
                <textarea
                  value={local[i]}
                  onChange={(e) => {
                    const next = [...local];
                    next[i] = e.target.value;
                    save(next);
                  }}
                  rows={2}
                  className="w-full resize-y rounded-xl border border-line bg-page px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-[#b6b2a9] focus:border-brand/60"
                  placeholder={i === 0 ? "e.g. What does “give up” mean?" : "Your question…"}
                />
              </div>
            ))}
          </div>
        </Screen>
      </AppShell>
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-[480px] border-t border-line bg-page px-4 py-3">
          <Button className={cn("w-full")} onClick={submit}>
            {STRINGS.done.en} · <span className="fa">{STRINGS.done.fa}</span> →
          </Button>
          {local.some((q) => q.trim()) === false && (
            <p className="mt-2 text-center text-xs text-muted">
              Tip: write your questions before pressing Done. <span className="fa">نکته: پیش از زدن تمام، سؤال‌هایت را بنویس.</span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
