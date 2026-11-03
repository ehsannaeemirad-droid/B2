"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge, Progress } from "@/components/ui/kit";
import { getLesson } from "@/content/registry";
import { STRINGS, GRAMMAR_LABELS } from "@/lib/i18n";
import { useTapRead } from "@/lib/store";
import { STEP_DEFS, STEP_TOTAL } from "@/components/steps/defs";
import { cn } from "@/lib/utils";

export default function LessonOverviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen justify-center bg-shell">
          <main className="w-full max-w-[480px] min-h-screen" />
        </div>
      }
    >
      <LessonOverviewInner />
    </React.Suspense>
  );
}

function grammarLabel(key: string, lang: "en" | "fa"): string {
  const label = GRAMMAR_LABELS[key];
  return label ? label[lang] : key;
}

function LessonOverviewInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const state = useTapRead();
  const lang = state.settings.uiLang;

  const lesson = React.useMemo(
    () => getLesson(id ?? "lesson-01", state.lessonOverrides),
    [id, state.lessonOverrides]
  );

  if (!lesson) {
    return (
      <AppShell>
        <Screen>
          <p className="mt-16 text-center font-bold text-muted">Lesson not found.</p>
          <Button variant="secondary" className="mx-auto mt-4" onClick={() => router.push("/")}>
            {STRINGS.back[lang]}
          </Button>
        </Screen>
      </AppShell>
    );
  }

  const progress = state.lessons[lesson.id];
  const stepsDone = progress?.stepsDone ?? [];
  const firstIncomplete = STEP_DEFS.find((s) => !stepsDone.includes(s.n))?.n ?? STEP_TOTAL + 1;
  const allDone = firstIncomplete > STEP_TOTAL;

  return (
    <AppShell>
      <Screen>
        <header className="flex items-center pt-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label={STRINGS.back.en}
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-[#afafaf] transition-colors hover:bg-[#f7f7f7] hover:text-muted"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </header>

        <div className="mt-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-soft text-[color:var(--success)]">Basic 2</Badge>
            <span className="text-[13px] font-bold text-muted">
              {lesson.estimatedMinutes} {STRINGS.time[lang]}
            </span>
          </div>
          <h1 className="mt-2 text-[26px] font-black leading-tight text-ink">{lesson.title}</h1>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink-soft">{lesson.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.grammarFocus.map((g) => (
              <Badge key={g} className="border-2 border-line bg-white text-muted">
                {grammarLabel(g, lang)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-extrabold uppercase tracking-[1px] text-muted">
              {STRINGS.steps[lang]}
            </h2>
            <span className="text-[11px] font-extrabold text-[color:var(--success)]">
              {stepsDone.length}/{STEP_TOTAL}
            </span>
          </div>
          <Progress value={(stepsDone.length / STEP_TOTAL) * 100} className="mt-2 h-2" />
          <ul className="mt-3 divide-y divide-line">
            {STEP_DEFS.map((s) => {
              const unlocked = s.n <= firstIncomplete;
              const done = stepsDone.includes(s.n);
              return (
                <li key={s.n}>
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => unlocked && router.push(`/lesson/${lesson.id}/step/${s.n}`)}
                    className={cn(
                      "flex min-h-12 w-full items-center gap-3 py-2 text-start",
                      !unlocked && "opacity-40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-extrabold",
                        done
                          ? "border-brand bg-brand text-white"
                          : "border-line text-[#afafaf]"
                      )}
                    >
                      {done ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        s.n
                      )}
                    </span>
                    <span className="text-[15px] font-bold text-ink">{STRINGS[s.key][lang]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6">
          {allDone && (
            <div className="mb-4">
              <Progress value={100} />
              <p className="mt-2 text-center text-[13px] font-bold text-muted">{STRINGS.done[lang]}</p>
            </div>
          )}
          <Button
            className="w-full"
            onClick={() => router.push(`/lesson/${lesson.id}/step/${Math.min(firstIncomplete, STEP_TOTAL)}`)}
          >
            {stepsDone.length === 0 ? STRINGS.start[lang] : STRINGS.continue[lang]}
          </Button>
        </div>
      </Screen>
    </AppShell>
  );
}
