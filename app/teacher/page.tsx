"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/kit";
import { getLesson } from "@/content/registry";
import { useTapRead, getLessonProgress, getState } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { STRINGS } from "@/lib/i18n";

export default function TeacherPage() {
  const state = useTapRead();
  const lang = state.settings.uiLang;
  const toast = useToast();

  if (!state.settings.teacherMode) {
    return (
      <AppShell>
        <Screen>
          <div className="mt-24 rounded-2xl border border-line bg-white p-6 text-center">
            <p className="fa text-[15px] leading-relaxed text-ink">{STRINGS.teacher_gate.fa}</p>
            <p className="mt-2 text-sm text-muted">{STRINGS.teacher_gate.en}</p>
            <Link href="/settings">
              <Button className="mt-5" variant="secondary">
                {STRINGS.settings.en} · <span className="fa">{STRINGS.settings.fa}</span>
              </Button>
            </Link>
          </div>
        </Screen>
      </AppShell>
    );
  }

  const lesson = getLesson("lesson-01", state.lessonOverrides);
  const progress = getLessonProgress(state, "lesson-01");
  const vocabulary = lesson?.vocabulary ?? [];
  const comprehension = lesson?.comprehension ?? [];
  const discussion = lesson?.discussion ?? [];

  const vocabRows = vocabulary.map((v) => ({
    en: v.en,
    fa: v.fa,
    rating: state.ratings[`lesson-01:${v.en}`] ?? null,
  }));

  const unknownWords = vocabRows.filter((r) => r.rating === "dontknow");
  const wrongQuestions = comprehension.filter(
    (q) => progress.comprehension?.answers[q.id] && progress.comprehension?.answers[q.id].correct === false
  );

  const copyData = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(getState(), null, 2));
      toast(STRINGS.copied[lang]);
    } catch {
      toast("Clipboard unavailable — press Ctrl+C on the exported JSON in the Editor.");
    }
  };

  const audioNote = (dataUrl?: string) =>
    dataUrl ? <audio controls preload="metadata" src={dataUrl} className="h-10 w-full max-w-[260px]" /> : (
      <span className="text-xs text-muted">—</span>
    );

  return (
    <AppShell>
      <Screen className="print-plan">
        <header className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-semibold text-ink">Teacher view</h1>
            <p className="text-sm text-muted">
              {lesson?.title} · Lesson 1 · A1
            </p>
          </div>
          <Badge className="bg-brand-soft text-brand-deep">{STRINGS.teacher_mode.en}</Badge>
        </header>

        {/* Summary chips */}
        <div className="grid grid-cols-3 gap-2">
          <SummaryTile label="Comprehension" value={progress.comprehension ? `${progress.comprehension.score}/${progress.comprehension.total}` : "—"} />
          <SummaryTile label="Vocab known" value={String(vocabRows.filter((r) => r.rating === "know").length)} />
          <SummaryTile label="Don’t know" value={String(unknownWords.length)} />
        </div>

        {/* Vocabulary ratings */}
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-muted">Vocabulary self-ratings</h2>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-1.5">Word</th>
                <th className="py-1.5">Rating</th>
              </tr>
            </thead>
            <tbody>
              {vocabRows.map((r) => (
                <tr key={r.en} className="border-t border-line">
                  <td className="py-1.5 font-medium text-ink">{r.en}</td>
                  <td className="py-1.5">
                    {r.rating === "know" && <span className="text-success">I know</span>}
                    {r.rating === "unsure" && <span className="text-[#8a6d00]">Not sure</span>}
                    {r.rating === "dontknow" && <span className="text-danger">I don’t know</span>}
                    {r.rating === null && <span className="text-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Comprehension per-question */}
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-muted">Comprehension</h2>
          <ul className="mt-2">
            {comprehension.map((q) => {
              const a = progress.comprehension?.answers[q.id];
              return (
                <li key={q.id} className="border-t border-line py-2 first:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] leading-snug text-ink">{q.prompt}</p>
                    {a ? (
                      <Badge className={a.correct ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}>
                        {a.correct ? "✓" : "✗"}
                      </Badge>
                    ) : (
                      <Badge className="bg-[#ecebe6] text-muted">—</Badge>
                    )}
                  </div>
                  {a && !a.correct && (
                    <p className="mt-1 text-xs text-muted">
                      Chosen: “{q.options[a.chosen]}” · Correct: “{q.options[q.answerIndex]}”
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Discussion submissions */}
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-muted">Discussion notes & audio</h2>
          {selectedCount(progress.discussion?.selected) === 0 && (
            <p className="mt-2 text-sm text-muted">No questions selected yet.</p>
          )}
          <ul className="mt-2">
            {discussion
              .filter((d) => progress.discussion?.selected?.includes(d.id))
              .map((d) => (
                <li key={d.id} className="border-t border-line py-2 first:border-0">
                  <p className="text-[15px] font-medium text-ink">{d.en}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">
                    {progress.discussion?.notes?.[d.id] || <span className="text-muted">No notes.</span>}
                  </p>
                  <div className="mt-1.5">{audioNote(progress.discussion?.audio?.[d.id])}</div>
                </li>
              ))}
          </ul>
        </Card>

        {/* Retelling */}
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-muted">Retelling</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Key words checked: {progress.retelling?.checked?.length ?? 0}/6
          </p>
          <p className="mt-0.5 text-xs text-muted">{(progress.retelling?.checked ?? []).join(" · ") || "—"}</p>
          <div className="mt-2">{audioNote(progress.retelling?.audio)}</div>
        </Card>

        {/* Ask your teacher */}
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-muted">Questions for the teacher</h2>
          <ol className="mt-2 list-decimal space-y-1 ps-5 text-sm text-ink-soft">
            {(progress.askTeacher?.questions ?? []).map((qq, i) => (
              <li key={i}>{qq.trim() || <span className="text-muted">—</span>}</li>
            ))}
          </ol>
        </Card>

        {/* Common problems */}
        <Card className="mt-4 border-danger/30">
          <h2 className="text-sm font-semibold text-danger">{STRINGS.common_problems.en} · <span className="fa">{STRINGS.common_problems.fa}</span></h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {unknownWords.length === 0 && wrongQuestions.length === 0 && (
              <p className="text-sm text-muted">Nothing flagged yet.</p>
            )}
            {unknownWords.map((w) => (
              <Badge key={w.en} className="bg-danger-soft text-danger">
                {w.en} <span className="fa font-normal">({w.fa})</span>
              </Badge>
            ))}
            {wrongQuestions.map((q) => (
              <Badge key={q.id} className="bg-accent-soft text-[#8a6d00]">Q: {q.prompt}</Badge>
            ))}
          </div>
          {state.missingGlosses.length > 0 && (
            <p className="mt-3 text-xs text-muted">
              Unresolved lookups: {state.missingGlosses.map((g) => g.surface).join(", ")}
            </p>
          )}
        </Card>

        <div className="no-print mt-6 flex gap-2 pb-8">
          <Button variant="secondary" className="flex-1 no-print" onClick={() => window.print()}>
            {STRINGS.print_plan.en} · <span className="fa">{STRINGS.print_plan.fa}</span>
          </Button>
          <Button variant="ghost" className="no-print" onClick={copyData}>
            {STRINGS.copy_data.en}
          </Button>
        </div>
      </Screen>
    </AppShell>
  );
}

function selectedCount(selected?: string[]) {
  return selected?.length ?? 0;
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2.5 text-center">
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
