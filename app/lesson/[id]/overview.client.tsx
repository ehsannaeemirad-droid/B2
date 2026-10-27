"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge, Progress } from "@/components/ui/kit";
import { getLesson, getBundledLesson } from "@/content/registry";
import { STRINGS, t } from "@/lib/i18n";
import { useTapRead } from "@/lib/store";
import { STEP_DEFS, STEP_TOTAL } from "@/components/steps/defs";
import { cn } from "@/lib/utils";

function grammarLabel(key: string, lang: "en" | "fa"): string {
  if (key === "present_simple") return STRINGS.present_simple[lang];
  if (key === "verb_be") return STRINGS.verb_be[lang];
  return key;
}

export default function LessonOverviewPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen justify-center bg-shell">
        <main className="w-full max-w-[480px] min-h-screen" />
      </div>
    }>
      <LessonOverviewInner />
    </React.Suspense>
  );
}

function LessonOverviewInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const state = useTapRead();
  const lang = state.settings.uiLang;

  const lesson = React.useMemo(() => getLesson(id ?? "lesson-01", state.lessonOverrides), [id, state.lessonOverrides]);

  if (!lesson) {
    return (
      <AppShell>
        <Screen>
          <p className="mt-16 text-center text-muted">Lesson not found.</p>
          <Button variant="ghost" className="mx-auto mt-4" onClick={() => router.push("/")}>
            {STRINGS.back[lang]}
          </Button>
        </Screen>
      </AppShell>
    );
  }

  const summary = getBundledLesson(id ?? "lesson-01");

  if (id !== "lesson-01" && !summary) {
    // Structurally present but locked lessons
    return (
      <AppShell>
        <Screen>
          <p className="mt-16 text-center text-muted">{t(lang, "coming_soon")}</p>
          <Button variant="ghost" className="mx-auto mt-4" onClick={() => router.push("/")}>
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
          <Button variant="ghost" onClick={() => router.push("/")} aria-label={STRINGS.back.en} className="px-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </header>

        <div className="mt-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-soft text-brand-deep">{lesson.level}</Badge>
            <span className="text-sm text-muted">
              · {lesson.estimatedMinutes} {STRINGS.time[lang]}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-ink">{lesson.title}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{lesson.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.grammarFocus.map((g) => (
              <Badge key={g} className="border border-line bg-white text-ink-soft">
                {grammarLabel(g, lang)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-white p-4">
          <h2 className="text-sm font-semibold text-muted">{STRINGS.steps[lang]}</h2>
          <ul className="mt-2 divide-y divide-line">
            {STEP_DEFS.map((s) => {
              const unlocked = s.n <= firstIncomplete;
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
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                        stepsDone.includes(s.n)
                          ? "border-brand bg-brand text-white"
                          : "border-[#d5d2ca] text-muted"
                      )}
                    >
                      {stepsDone.includes(s.n) ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span className="text-xs font-semibold">{s.n}</span>
                      )}
                    </span>
                    <span className="text-[15px] font-medium text-ink">{t(lang, s.key)}</span>
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
              <p className="mt-2 text-center text-sm text-muted">{t(lang, "done")}</p>
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
