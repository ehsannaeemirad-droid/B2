"use client";

import * as React from "react";
import type { Lesson } from "@/content/types";
import { StepChrome } from "./StepChrome";
import { markStepDone, mutateLesson } from "@/lib/store";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { SentenceSheet } from "@/components/WordSheet";
import { STRINGS, type UiLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function StepComprehension({
  lesson,
  lang,
  onDone,
}: {
  lesson: Lesson;
  lang: UiLang;
  onDone: () => void;
}) {
  const questions = lesson.comprehension;
  const [qi, setQi] = React.useState(0);
  const [chosen, setChosen] = React.useState<number | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, { chosen: number; correct: boolean }>>({});
  const [correctCount, setCorrectCount] = React.useState(0);
  const [showWhere, setShowWhere] = React.useState(false);

  const finished = qi >= questions.length;
  const q = !finished ? questions[qi] : null;
  const correct = q ? chosen === q.answerIndex : false;

  const sourceSentence = React.useMemo(() => {
    if (!q?.sourceSentence) return null;
    for (const c of lesson.reading.chunks) {
      for (const s of c.sentences) if (s.id === q.sourceSentence) return s;
    }
    return null;
  }, [q, lesson]);

  const choose = (index: number) => {
    if (chosen !== null) return;
    setChosen(index);
    const isCorrect = index === q!.answerIndex;
    setAnswers((a) => ({ ...a, [q!.id]: { chosen: index, correct: isCorrect } }));
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const finish = () => {
    const score = correctCount;
    mutateLesson(lesson.id, (p) => ({
      ...p,
      comprehension: { score, total: questions.length, answers },
    }));
    markStepDone(lesson.id, 3);
    onDone();
  };

  return (
    <>
      <AppShell>
        <Screen>
          <StepChrome lesson={lesson} step={3} lang={lang} />

          {!finished && q ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                  Question {qi + 1}/{questions.length}
                </span>
                <span className="text-sm font-medium text-brand-deep">{correctCount} ✓</span>
              </div>

              <h2 className="mt-4 text-xl font-semibold leading-snug text-ink">{q.prompt}</h2>

              <ul className="mt-5 flex flex-col gap-3">
                {q.options.map((opt, i) => {
                  const isChosen = chosen === i;
                  const isAnswer = i === q.answerIndex;
                  const state =
                    chosen === null
                      ? "idle"
                      : isAnswer
                        ? "correct"
                        : isChosen
                          ? "wrong"
                          : "dim";
                  return (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => choose(i)}
                        disabled={chosen !== null}
                        className={cn(
                          "min-h-12 w-full rounded-xl border px-4 py-3 text-start text-[15px] transition-colors duration-150",
                          state === "idle" && "border-line bg-white text-ink hover:border-brand/50",
                          state === "correct" && "border-success bg-success-soft text-success",
                          state === "wrong" && "border-danger bg-danger-soft text-danger",
                          state === "dim" && "border-line bg-white text-[#b6b2a9]"
                        )}
                      >
                        {opt}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {chosen !== null && (
                <div
                  className={cn(
                    "fade-enter mt-5 rounded-2xl border p-4",
                    correct ? "border-success/40 bg-success-soft" : "border-danger/40 bg-danger-soft"
                  )}
                >
                  <p className={cn("text-sm font-semibold", correct ? "text-success" : "text-danger")}>
                    {correct ? STRINGS.correct[lang] : STRINGS.incorrect[lang]}
                  </p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{q.explanation}</p>
                  <p className="fa mt-1.5 text-sm leading-relaxed text-ink-soft">{q.explanationFa}</p>

                  {!correct && q.sourceSentence && (
                    <button
                      type="button"
                      className="mt-2 text-sm font-medium text-brand-deep underline underline-offset-2"
                      onClick={() => setShowWhere(true)}
                    >
                      {STRINGS.show_me_where[lang]} · {STRINGS.show_me_where.en}
                    </button>
                  )}

                  <Button
                    className="mt-4 w-full"
                    onClick={() => {
                      setChosen(null);
                      setQi((i) => i + 1);
                    }}
                  >
                    {qi === questions.length - 1 ? STRINGS.done[lang] : STRINGS.continue[lang]}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Result card */
            <div className="mt-16 rounded-2xl border border-line bg-white p-8 text-center">
              <p className="text-sm text-muted">{STRINGS.your_score[lang]} · {STRINGS.your_score.fa}</p>
              <p className="mt-2 text-5xl font-bold text-ink">
                {correctCount} <span className="text-2xl text-muted">/ {questions.length}</span>
              </p>
              <Button className="mt-8 w-full" onClick={finish}>
                {STRINGS.continue[lang] + " · " + STRINGS.continue.fa}
              </Button>
            </div>
          )}
        </Screen>
      </AppShell>

      <SentenceSheet
        sentence={showWhere && sourceSentence ? sourceSentence : null}
        open={Boolean(showWhere && sourceSentence)}
        onClose={() => setShowWhere(false)}
      />
    </>
  );
}
