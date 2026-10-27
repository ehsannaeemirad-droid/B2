"use client";

import * as React from "react";
import type { Lesson } from "@/content/types";
import { STEP_TOTAL } from "./defs";
import { StepChrome } from "./StepChrome";
import { markStepDone } from "@/lib/store";
import { AudioButton } from "@/components/AudioButton";
import { Button } from "@/components/ui/button";
import { STRINGS, type UiLang } from "@/lib/i18n";
import { useTapRead, setRating, getLessonProgress } from "@/lib/store";
import type { VocabRating } from "@/lib/store";
import { AppShell, Screen } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export function StepVocabulary({
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
  const [revealed, setRevealed] = React.useState<Record<string, boolean>>({});

  const rate = (en: string, rating: VocabRating) => setRating(lesson.id, en, rating);

  const ratingButtons: { value: VocabRating; label: string; activeColor: string }[] = [
    { value: "know", label: `می‌دانم · ${STRINGS.i_know.en}`, activeColor: "bg-success-soft text-success border-success" },
    { value: "unsure", label: `مطمئن نیستم · ${STRINGS.not_sure.en}`, activeColor: "bg-accent-soft text-[#8a6d00] border-accent" },
    { value: "dontknow", label: `نمی‌دانم · ${STRINGS.dont_know.en}`, activeColor: "bg-danger-soft text-danger border-danger" },
  ];

  return (
    <>
      <AppShell>
        <Screen className="px-0">
          <div className="px-4">
            <StepChrome lesson={lesson} step={1} lang={lang} />
            <p className="mb-3 text-sm text-muted">
              {STRINGS.tap_word.en} · <span className="fa">{STRINGS.tap_word.fa}</span>
            </p>
          </div>

        <ul className="flex flex-col gap-3 px-4 pb-28">
        {lesson.vocabulary.map((card) => {
          const key = `${lesson.id}:${card.en}`;
          const rating = state.ratings[key];
          const open = Boolean(revealed[card.en]);
          return (
            <li key={card.en} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="min-h-11 flex-1 text-start text-xl font-semibold text-ink"
                  onClick={() => setRevealed((r) => ({ ...r, [card.en]: !r[card.en] }))}
                >
                  {card.en}
                </button>
                <AudioButton text={card.en} />
              </div>

              {open ? (
                <div className="mt-3 border-t border-line pt-3">
                  <p className="fa text-lg leading-relaxed text-ink">{card.fa}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted">{card.pos}</p>
                  <p className="mt-2 text-[15px] text-ink-soft">
                    {card.example}
                  </p>
                  <p className="fa mt-1 text-sm text-muted">{card.exampleFa}</p>
                </div>
              ) : (
                <button
                  type="button"
                  className="fa mt-3 min-h-11 text-sm text-muted"
                  onClick={() => setRevealed((r) => ({ ...r, [card.en]: true }))}
                >
                  {STRINGS.tap_word.fa}
                </button>
              )}

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {ratingButtons.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => rate(card.en, b.value)}
                    className={cn(
                      "fa min-h-11 rounded-xl border px-2 py-2 text-[13px] font-medium transition-colors",
                      rating === b.value
                        ? b.activeColor
                        : "border-line bg-white text-muted hover:bg-black/[0.03]"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
        </ul>
        </Screen>
      </AppShell>
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-[480px] bg-page px-4">
          <div className="border-t border-line bg-page px-0 py-3">
          <Button
            className="w-full"
            onClick={() => {
              markStepDone(lesson.id, 1);
              onDone();
            }}
          >
            {STRINGS.next[lang]} · {(progress.stepsDone ?? []).length}/{STEP_TOTAL}
          </Button>
          </div>
        </div>
      </div>
    </>
  );
}
