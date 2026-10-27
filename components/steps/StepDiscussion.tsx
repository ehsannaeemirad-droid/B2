"use client";

import * as React from "react";
import type { Lesson } from "@/content/types";
import { StepChrome } from "./StepChrome";
import { useTapRead, mutateLesson, markStepDone, getLessonProgress } from "@/lib/store";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Recorder } from "@/components/Recorder";
import { STRINGS, type UiLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function StepDiscussion({
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
  const selected = progress.discussion?.selected ?? [];
  const notes = progress.discussion?.notes ?? {};
  const audio = progress.discussion?.audio ?? {};

  const toggle = (id: string) => {
    mutateLesson(lesson.id, (p) => {
      const d = p.discussion ?? { selected: [], notes: {}, audio: {} };
      const next = d.selected.includes(id)
        ? d.selected.filter((x) => x !== id)
        : d.selected.length < 2
          ? [...d.selected, id]
          : [...d.selected.slice(1), id];
      return { ...p, discussion: { ...d, selected: next } };
    });
  };

  const setNote = (id: string, text: string) => {
    mutateLesson(lesson.id, (p) => {
      const d = p.discussion ?? { selected: [id], notes: {}, audio: {} };
      return { ...p, discussion: { ...d, notes: { ...d.notes, [id]: text } } };
    });
  };

  const setAudio = (id: string, value: string | undefined) => {
    mutateLesson(lesson.id, (p) => {
      const d = p.discussion ?? { selected: [id], notes: {}, audio: {} };
      const nextAudio = { ...d.audio };
      if (value) nextAudio[id] = value;
      else delete nextAudio[id];
      return { ...p, discussion: { ...d, audio: nextAudio } };
    });
  };

  const canContinue = selected.length === 2;

  return (
    <>
      <AppShell>
        <Screen>
          <StepChrome lesson={lesson} step={4} lang={lang} />
          <p className="mb-4 text-sm font-medium text-ink">
            {STRINGS.choose_two.en} · <span className="fa">{STRINGS.choose_two.fa}</span> ({selected.length}/2)
          </p>

          <ul className="flex flex-col gap-3 pb-24">
            {lesson.discussion.map((d) => {
              const isSel = selected.includes(d.id);
              return (
                <li
                  key={d.id}
                  className={cn(
                    "rounded-2xl border bg-white p-4 transition-colors",
                    isSel ? "border-brand/60" : "border-line"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(d.id)}
                    className="flex min-h-12 w-full items-start gap-3 text-start"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                        isSel ? "border-brand bg-brand text-white" : "border-[#cfcfc8]"
                      )}
                    >
                      {isSel && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span>
                      <span className="block text-[15px] font-medium leading-snug text-ink">{d.en}</span>
                      <span className="fa mt-1 block text-sm leading-relaxed text-muted">{d.fa}</span>
                    </span>
                  </button>

                  {isSel && (
                    <div className="fade-enter mt-4 border-t border-line pt-4">
                      {/* Frame sentence starter (tap to insert) */}
                      <button
                        type="button"
                        onClick={() => setNote(d.id, `${notes[d.id] ?? ""}${d.frame} `)}
                        className="w-full rounded-xl bg-brand-soft px-3 py-2.5 text-start text-[15px] text-brand-deep"
                      >
                        <span className="block">{d.frame}</span>
                        <span className="fa mt-1 block text-sm opacity-80">{d.frameFa}</span>
                        <span className="mt-1 block text-xs text-muted">{STRINGS.insert_frame.en} · <span className="fa">{STRINGS.insert_frame.fa}</span></span>
                      </button>

                      <textarea
                        value={notes[d.id] ?? ""}
                        onChange={(e) => setNote(d.id, e.target.value)}
                        placeholder={`${STRINGS.type_here.en}
${STRINGS.type_here.fa}`}
                        rows={4}
                        className="mt-3 w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-[#b6b2a9] focus:border-brand/60"
                      />

                      <div className="mt-3">
                        <Recorder lang={lang} audio={audio[d.id]} onChange={(a) => setAudio(d.id, a)} seconds={60} />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Screen>
      </AppShell>

      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-[480px] border-t border-line bg-page px-4 py-3">
          <Button
            className="w-full"
            disabled={!canContinue}
            onClick={() => {
              markStepDone(lesson.id, 4);
              onDone();
            }}
          >
            {STRINGS.next[lang]} →
          </Button>
        </div>
      </div>
    </>
  );
}
