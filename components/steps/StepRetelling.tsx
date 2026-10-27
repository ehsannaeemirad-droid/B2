"use client";

import * as React from "react";
import type { Lesson, RetellingKeyWord } from "@/content/types";
import { StepChrome } from "./StepChrome";
import { mutateLesson, markStepDone, getLessonProgress, useTapRead } from "@/lib/store";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/sheet";
import { Recorder } from "@/components/Recorder";
import { STRINGS, type UiLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TARGET = 6;

export function StepRetelling({
  lesson,
  lang,
  onDone,
}: {
  lesson: Lesson;
  lang: UiLang;
  onDone: () => void;
}) {
  const state = useTapRead();
  const progress = getLessonProgress(state, lesson.id);
  const checked = progress.retelling?.checked ?? [];
  const audio = progress.retelling?.audio;

  const [gloss, setGloss] = React.useState<RetellingKeyWord | null>(null);

  const toggleCheck = (en: string) => {
    mutateLesson(lesson.id, (p) => {
      const r = p.retelling ?? { checked: [] };
      const next = r.checked.includes(en) ? r.checked.filter((x) => x !== en) : [...r.checked, en];
      return { ...p, retelling: { ...r, checked: next } };
    });
  };

  const setAudio = (value: string | undefined) => {
    mutateLesson(lesson.id, (p) => {
      const r = p.retelling ?? { checked: [] };
      return { ...p, retelling: { ...r, audio: value } };
    });
  };

  return (
    <>
      <AppShell>
        <Screen>
          <StepChrome lesson={lesson} step={5} lang={lang} />

          <p className="text-[15px] font-medium leading-relaxed text-ink">{lesson.retelling.prompt}</p>
          <p className="mt-2 text-sm text-muted">
            Record · play · re-record — 30–60 s. <span className="fa">{STRINGS.retell_prompt.fa}.</span>
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-soft px-4 py-2.5">
            <span className="text-sm font-medium text-brand-deep">
              {STRINGS.keywords_used[lang]} · {STRINGS.keywords_used.en}
            </span>
            <span
              className={cn(
                "text-lg font-bold",
                checked.length >= TARGET ? "text-success" : "text-[#8a6d00]"
              )}
            >
              {checked.length} / {TARGET}
            </span>
          </div>

          <ul className="mt-4 flex flex-wrap gap-2">
            {lesson.retelling.keyWords.map((kw) => {
              const isChecked = checked.includes(kw.en);
              return (
                <li key={kw.en} className="flex items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      if (e.shiftKey) return;
                      setGloss(kw);
                    }}
                    className="h-11 min-w-11 rounded-full border border-line bg-white px-3 text-sm font-medium text-ink hover:border-brand/50"
                    aria-label={`${kw.en} — ${kw.fa}`}
                  >
                    {kw.en}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCheck(kw.en)}
                    aria-label={`Mark ${kw.en} as used`}
                    className={cn(
                      "ms-1 flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                      isChecked ? "border-brand bg-brand text-white" : "border-line bg-white text-muted"
                    )}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 rounded-2xl border border-line bg-white p-4">
            <Recorder lang={lang} audio={audio} onChange={setAudio} seconds={60} />
          </div>

          <div className="mt-4 pb-4">
            <Button
              className="w-full"
              onClick={() => {
                markStepDone(lesson.id, 5);
                onDone();
              }}
            >
              {STRINGS.done[lang]} ✓
            </Button>
          </div>
        </Screen>
      </AppShell>

      <BottomSheet open={Boolean(gloss)} onClose={() => setGloss(null)} label="Key word gloss">
        {gloss && (
          <>
            <h3 className="text-2xl font-semibold text-ink">{gloss.en}</h3>
            <p className="fa mt-3 text-xl leading-relaxed text-ink">{gloss.fa}</p>
            <p className="mt-2 text-sm text-muted">{STRINGS.retell_prompt.en} · <span className="fa">{STRINGS.retell_prompt.fa}</span></p>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => {
                toggleCheck(gloss.en);
                setGloss(null);
              }}
            >
              {checked.includes(gloss.en) ? "Unmark" : "Mark as used"} · <span className="fa">{checked.includes(gloss.en) ? "لغو علامت" : "علامت بزن"}</span>
            </Button>
          </>
        )}
      </BottomSheet>
    </>
  );
}
