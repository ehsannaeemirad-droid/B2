"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { REGISTRY } from "@/content/registry";
import { useTapRead } from "@/lib/store";
import { STRINGS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NODE_GAP = 104;
const TOP = 58;
const AMP_FRAC = 0.13;
const VB_W = 480;

function nodeFracX(index: number) {
  return 0.5 + Math.sin(index * 0.9) * AMP_FRAC;
}
function nodeY(index: number) {
  return TOP + index * NODE_GAP;
}

/** Rounds so server and client serialize identical coordinates (no hydration drift). */
function round(n: number) {
  return Math.round(n * 100) / 100;
}

/** Dotted connector path through the winding node positions (480-wide viewBox). */
function descendPath(count: number) {
  const pts = Array.from({ length: count }, (_, i) => ({
    x: round(nodeFracX(i) * VB_W),
    y: round(nodeY(i)),
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const midY = round((prev.y + cur.y) / 2);
    d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
  }
  return d;
}

type NodeState = "done" | "current" | "todo";

export default function HomePage() {
  const state = useTapRead();
  const router = useRouter();
  const lang = state.settings.uiLang;

  const completedCount = REGISTRY.filter((l) => state.lessons[l.id]?.completedAt).length;
  const knownWords = Object.values(state.ratings).filter((r) => r === "know").length;
  const speakingAttempts = Object.values(state.lessons).reduce(
    (n, l) => n + (l.retelling?.audio ? 1 : 0) + Object.keys(l.discussion?.audio ?? {}).length,
    0
  );

  const firstUnfinished = REGISTRY.findIndex((l) => !state.lessons[l.id]?.completedAt);
  const current = REGISTRY[firstUnfinished >= 0 ? firstUnfinished : REGISTRY.length - 1];
  const currentSteps = state.lessons[current.id]?.stepsDone ?? [];
  const pathHeight = TOP + REGISTRY.length * NODE_GAP + 20;
  const pct = Math.round((completedCount / REGISTRY.length) * 100);

  return (
    <AppShell>
      <div className="pb-10">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-[#f0f0f0] bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[23px] font-black leading-none tracking-tight text-brand">TapRead</span>
            <span className="rounded-full bg-brand-soft px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.8px] text-[color:var(--success)]">
              Basic 2
            </span>
          </div>
          <Link
            href="/settings"
            aria-label={STRINGS.settings.en}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-line text-[#afafaf] transition-colors hover:bg-[#f7f7f7] hover:text-muted"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 2.8l1 2.4a7 7 0 0 1 2.4 1l2.5-.7.9 1.6-1.6 1.9c.2.8.2 1.6 0 2.4l1.6 1.9-.9 1.6-2.5-.7a7 7 0 0 1-2.4 1l-1 2.4h-1.8l-1-2.4a7 7 0 0 1-2.4-1l-2.5.7-.9-1.6 1.6-1.9a7 7 0 0 1 0-2.4L4.5 7.1l.9-1.6 2.5.7a7 7 0 0 1 2.4-1l1-2.4h1.8z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </Link>
        </header>

        {/* Unit banner */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-brand px-4 py-4 text-white shadow-[0_4px_0_var(--teal-deep)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[1.4px] text-white/80">
              Section 1 · Basic 2
            </p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <h1 className="text-xl font-black leading-tight">
                {STRINGS.unit_supplementary[lang]}
              </h1>
              <span className="shrink-0 text-[13px] font-extrabold">
                {completedCount}/{REGISTRY.length}
              </span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="relative h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${pct}%` }}
              >
                <span className="absolute inset-x-1 top-[3px] h-[3px] rounded-full bg-white/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Current lesson callout */}
        <div className="mt-4 px-4">
          <div className="rounded-2xl border-2 border-line bg-white p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[1.2px] text-muted">
              {currentSteps.length > 0 ? STRINGS.continue[lang] : STRINGS.start_here[lang]}
            </p>
            <p className="mt-1 text-[17px] font-extrabold leading-snug text-ink">{current.title}</p>

            <div className="mt-3 flex gap-1.5" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full",
                    currentSteps.includes(i + 1) ? "bg-brand" : "bg-[#e5e5e5]"
                  )}
                />
              ))}
            </div>

            <Button className="mt-4 w-full" onClick={() => router.push(`/lesson/${current.id}`)}>
              {currentSteps.length > 0 ? STRINGS.continue[lang] : STRINGS.start[lang]}
            </Button>
          </div>
        </div>

        {/* Winding path */}
        <div className="relative mx-auto mt-6 w-full" style={{ height: pathHeight }}>
          <svg
            className="absolute inset-0 h-full w-full"
            aria-hidden
            viewBox={`0 0 ${VB_W} ${pathHeight}`}
            preserveAspectRatio="none"
          >
            <path
              d={descendPath(REGISTRY.length)}
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="4"
              strokeDasharray="2 12"
              strokeLinecap="round"
            />
          </svg>

          {REGISTRY.map((lesson, i) => {
            const done = Boolean(state.lessons[lesson.id]?.completedAt);
            const isCurrent = !done && lesson.id === current.id;
            const nodeState: NodeState = done ? "done" : isCurrent ? "current" : "todo";
            return (
              <div
                key={lesson.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${round(nodeFracX(i) * 100)}%`, top: `${round(nodeY(i))}px` }}
              >
                <PathNode
                  state={nodeState}
                  order={lesson.order}
                  label={lesson.title}
                  onClick={() => router.push(`/lesson/${lesson.id}`)}
                />
              </div>
            );
          })}
        </div>

        {/* Progress summary */}
        <div className="grid grid-cols-3 gap-2 px-4">
          {[
            { label: STRINGS.words_learned[lang], value: knownWords, icon: "★" },
            { label: STRINGS.lessons_completed[lang], value: `${completedCount}/${REGISTRY.length}`, icon: "✓" },
            { label: STRINGS.speaking_attempts[lang], value: speakingAttempts, icon: "◍" },
          ].map((row) => (
            <div key={row.label} className="rounded-2xl border-2 border-line bg-white px-2 py-3 text-center">
              <p className="text-sm font-black text-[color:var(--amber)]">{row.icon}</p>
              <p className="mt-0.5 text-lg font-black leading-none text-ink">{row.value}</p>
              <p className="mt-1 text-[10px] font-extrabold uppercase leading-tight tracking-[0.4px] text-muted">
                {row.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function PathNode({
  state,
  order,
  label,
  onClick,
}: {
  state: NodeState;
  order: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${order}. ${label}`}
      title={label}
      className={cn(
        "flex h-[72px] w-[72px] items-center justify-center rounded-full transition-transform active:translate-y-[4px] active:shadow-none",
        state === "done" && "bg-brand text-white shadow-[0_6px_0_var(--teal-deep)]",
        state === "current" &&
          "node-current bg-brand text-white shadow-[0_6px_0_var(--teal-deep)] ring-4 ring-[#d7ffb8]",
        state === "todo" &&
          "bg-[#d7ffb8] text-[color:var(--success)] shadow-[0_6px_0_#b0e184]"
      )}
    >
      {state === "done" ? (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : state === "current" ? (
        <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <span className="text-xl font-black">{order}</span>
      )}
    </button>
  );
}
