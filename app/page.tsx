"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Badge, ProgressRing } from "@/components/ui/kit";
import { REGISTRY } from "@/content/registry";
import { useTapRead } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { STRINGS, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NODE_H = 92;
const AMP_FRAC = 0.135; // horizontal amplitude as a fraction of container width
const VB_W = 480;

function nodeFracX(index: number) {
  return 0.5 + Math.sin(index * 0.85) * AMP_FRAC;
}
function nodeY(index: number) {
  return 56 + index * NODE_H;
}

/** Dotted connector path through the winding node positions (in a 480-wide viewBox). */
function descendPath(count: number) {
  const pts = Array.from({ length: count }, (_, i) => ({
    x: nodeFracX(i) * VB_W,
    y: nodeY(i),
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const midY = (prev.y + cur.y) / 2;
    d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
  }
  return d;
}

export default function HomePage() {
  const state = useTapRead();
  const toast = useToast();
  const router = useRouter();
  const lang = state.settings.uiLang;

  const completedCount = Object.values(state.lessons).filter((l) => l.completedAt).length;
  const knownWords = Object.values(state.ratings).filter((r) => r === "know").length;
  const speakingAttempts = Object.values(state.lessons).reduce(
    (n, l) => n + (l.retelling?.audio ? 1 : 0) + Object.keys(l.discussion?.audio ?? {}).length,
    0
  );

  const stepsTotal = 6;
  const stepsDone = state.lessons["lesson-01"]?.stepsDone.length ?? 0;

  const totalLessons = REGISTRY.length;
  const summary = [
    { label: STRINGS.words_learned[lang], value: knownWords },
    { label: STRINGS.lessons_completed[lang], value: `${completedCount}/${totalLessons}` },
    { label: STRINGS.speaking_attempts[lang], value: speakingAttempts },
  ];

  return (
    <AppShell>
      <div className="px-4 pb-8">
        {/* Top bar */}
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-ink">TapRead</h1>
            <Badge className="bg-brand-soft text-brand-deep">A1</Badge>
          </div>
          <Link
            href="/settings"
            aria-label={STRINGS.settings.en}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-black/5"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M12 2.8l1 2.4a7 7 0 0 1 2.4 1l2.5-.7.9 1.6-1.6 1.9c.2.8.2 1.6 0 2.4l1.6 1.9-.9 1.6-2.5-.7a7 7 0 0 1-2.4 1l-1 2.4h-1.8l-1-2.4a7 7 0 0 1-2.4-1l-2.5.7-.9-1.6 1.6-1.9a7 7 0 0 1 0-2.4L4.5 7.1l.9-1.6 2.5.7a7 7 0 0 1 2.4-1l1-2.4h1.8z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </Link>
        </header>

        <p className="fa mb-3 text-sm text-muted">{STRINGS.tap_word.fa}</p>

        {/* Winding path */}
        <div className="relative mx-auto w-full" style={{ height: 56 + totalLessons * NODE_H + 40 }}>
          <svg
            className="absolute inset-0 h-full w-full"
            aria-hidden
            viewBox={`0 0 ${VB_W} ${56 + totalLessons * NODE_H + 40}`}
            preserveAspectRatio="none"
          >
            <path
              d={descendPath(totalLessons)}
              fill="none"
              stroke="#d8d5cd"
              strokeWidth="2.5"
              strokeDasharray="1 9"
              strokeLinecap="round"
            />
          </svg>

          {REGISTRY.map((lesson, i) => {
            const isReady = lesson.status === "ready";
            const pct = stepsTotal > 0 ? Math.min(1, stepsDone / stepsTotal) : 0;
            const labelAtRight = Math.sin(i * 0.85) <= 0;
            return (
              <div
                key={lesson.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
                style={{ left: `${nodeFracX(i) * 100}%`, top: nodeY(i) }}
              >
                {labelAtRight && <NodeLabel lesson={lesson} isReady={isReady} lang={lang} />}
                <NodeButton
                  label={lesson.title}
                  pctDone={isReady ? pct : undefined}
                  locked={!isReady}
                  completed={Boolean(state.lessons[lesson.id]?.completedAt)}
                  onClick={() => {
                    if (isReady) router.push(`/lesson/${lesson.id}`);
                    else toast(t(lang, "lesson_locked_toast"));
                  }}
                />
                {!labelAtRight && <NodeLabel lesson={lesson} isReady={isReady} lang={lang} />}
              </div>
            );
          })}
        </div>

        {/* Progress summary */}
        <div className="mt-4 rounded-2xl border border-line bg-white p-4">
          <dl className="divide-y divide-line">
            {summary.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <dt className="text-sm text-muted">{row.label}</dt>
                <dd className="text-sm font-semibold text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </AppShell>
  );
}

function NodeLabel({
  lesson,
  isReady,
  lang,
}: {
  lesson: { title: string };
  isReady: boolean;
  lang: "en" | "fa";
}) {
  return (
    <div className="w-[130px] text-start sm:w-[150px]">
      <p
        className={cn(
          "line-clamp-2 text-[13px] font-medium leading-snug",
          isReady ? "text-ink" : "text-muted"
        )}
      >
        {lesson.title}
      </p>
      {!isReady && (
        <Badge className="mt-1 bg-[#ecebe6] text-muted">{STRINGS.coming_soon[lang]}</Badge>
      )}
    </div>
  );
}

function NodeButton({
  label,
  pctDone,
  locked,
  completed,
  onClick,
}: {
  label: string;
  pctDone?: number;
  locked?: boolean;
  completed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
      data-locked={locked || undefined}
    >
      {locked ? (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7e5df] text-[#b3aea6] shadow-[0_2px_0_rgba(15,23,42,0.06)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="10" width="14" height="10" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </span>
      ) : (
        <ProgressRing value={pctDone ?? 0} size={64} stroke={5}>
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-[0_2px_0_var(--teal-deep)]",
              completed && "shadow-none opacity-90"
            )}
          >
            {completed ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 4h11a2 2 0 0 1 2 2v14l-5-3-5 3V4z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </ProgressRing>
      )}
    </button>
  );
}
