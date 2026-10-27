"use client";

import * as React from "react";
import Link from "next/link";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/kit";
import { getBundledLesson } from "@/content/registry";
import { useTapRead, getState, saveLessonOverride, clearLessonOverride } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { STRINGS } from "@/lib/i18n";
import type { Lesson } from "@/content/types";
import dictionaryJson from "@/content/dictionary.json";

/** Everything editable lives in this one draft object. */
type Draft = Lesson;

/** Quick set of dictionary lemmas for validation. */
const DICT_LEMMAS: Set<string> = new Set(
  (dictionaryJson as { lemma: string }[]).map((e) => e.lemma)
);

function EditorForm({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (patch: (d: Draft) => Draft) => void;
}) {
  const field =
    "w-full rounded-xl border border-line bg-page px-3 py-2 text-[15px] text-ink outline-none focus:border-brand/60";
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-muted";
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="grid gap-3">
          <div>
            <label className={label}>Title</label>
            <input className={field} value={draft.title} onChange={(e) => onChange((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div>
            <label className={label}>Subtitle</label>
            <input className={field} value={draft.subtitle} onChange={(e) => onChange((d) => ({ ...d, subtitle: e.target.value }))} />
          </div>
        </div>
      </Card>

      {draft.reading.chunks.map((chunk, ci) => (
        <Card key={chunk.id}>
          <h3 className="text-sm font-semibold text-ink">{chunk.heading}</h3>
          <div className="mt-3 flex flex-col gap-4">
            {chunk.sentences.map((s, si) => (
              <div key={s.id} className="rounded-xl border border-line p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">{s.id}</span>
                  <span className="text-[11px] text-muted">{s.tokens.length} tokens</span>
                </div>
                <input
                  className={`${field} mb-2 bg-white`}
                  value={s.en}
                  onChange={(e) =>
                    onChange((d) => {
                      d.reading.chunks[ci].sentences[si].en = e.target.value;
                      return { ...d };
                    })
                  }
                />
                <div className="fa">
                  <textarea
                    dir="rtl"
                    className={`${field} text-base`}
                    value={s.fa}
                    rows={2}
                    onChange={(e) =>
                      onChange((d) => {
                        d.reading.chunks[ci].sentences[si].fa = e.target.value;
                        return { ...d };
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <h3 className="text-sm font-semibold text-ink">Vocabulary</h3>
        <div className="mt-3 flex flex-col gap-3">
          {draft.vocabulary.map((v, vi) => (
            <div key={v.en} className="grid grid-cols-2 gap-2 rounded-xl border border-line p-3">
              <input className={field} value={v.en} onChange={(e) => onChange((d) => ({ ...d, vocabulary: d.vocabulary.map((c, i) => (i === vi ? { ...c, en: e.target.value } : c)) }))} />
              <input className={`${field} fa`} dir="rtl" value={v.fa} onChange={(e) => onChange((d) => ({ ...d, vocabulary: d.vocabulary.map((c, i) => (i === vi ? { ...c, fa: e.target.value } : c)) }))} />
              <input className={field} value={v.example} onChange={(e) => onChange((d) => ({ ...d, vocabulary: d.vocabulary.map((c, i) => (i === vi ? { ...c, example: e.target.value } : c)) }))} />
              <input className={`${field} fa`} dir="rtl" value={v.exampleFa} onChange={(e) => onChange((d) => ({ ...d, vocabulary: d.vocabulary.map((c, i) => (i === vi ? { ...c, exampleFa: e.target.value } : c)) }))} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-ink">Comprehension</h3>
        <div className="mt-3 flex flex-col gap-3">
          {draft.comprehension.map((q, qi2) => (
            <div key={q.id} className="rounded-xl border border-line p-3">
              <input className={`${field} mb-2`} value={q.prompt} onChange={(e) => onChange((d) => ({ ...d, comprehension: d.comprehension.map((c, i) => (i === qi2 ? { ...c, prompt: e.target.value } : c)) }))} />
              <div className="grid grid-cols-3 gap-2">
                {q.options.map((o, oi) => (
                  <input
                    key={oi}
                    className={field}
                    value={o}
                    onChange={(e) =>
                      onChange((d) => ({
                        ...d,
                        comprehension: d.comprehension.map((c, i) =>
                          i === qi2 ? { ...c, options: c.options.map((oo, j) => (j === oi ? e.target.value : oo)) } : c
                        ),
                      }))
                    }
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted">Answer index: {q.answerIndex}</p>
              <input className={`${field} mt-2`} value={q.explanation} onChange={(e) => onChange((d) => ({ ...d, comprehension: d.comprehension.map((c, i) => (i === qi2 ? { ...c, explanation: e.target.value } : c)) }))} />
              <input className={`${field} fa mt-2`} dir="rtl" value={q.explanationFa} onChange={(e) => onChange((d) => ({ ...d, comprehension: d.comprehension.map((c, i) => (i === qi2 ? { ...c, explanationFa: e.target.value } : c)) }))} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function validate(draft: Draft, dictionary: Set<string>): { missingFa: string[]; missingDict: string[]; missingAnswer: string[] } {
  const missingFa: string[] = [];
  const missingDict: string[] = [];
  const missingAnswer: string[] = [];
  for (const c of draft.reading.chunks) {
    for (const s of c.sentences) {
      if (!s.fa.trim()) missingFa.push(s.id);
      for (const t of s.tokens) {
        if (t.lemma && !dictionary.has(t.lemma)) missingDict.push(`${s.id}:${t.surface}→${t.lemma}`);
      }
    }
  }
  for (const q of draft.comprehension) {
    if (q.answerIndex < 0 || q.answerIndex >= q.options.length || !q.explanation.trim()) missingAnswer.push(q.id);
  }
  return { missingFa, missingDict, missingAnswer };
}

export default function EditorPage() {
  const state = useTapRead();
  const lang = state.settings.uiLang;
  const toast = useToast();

  const bundled = getBundledLesson("lesson-01");
  const override = state.lessonOverrides["lesson-01"] as Lesson | undefined;
  const [draft, setDraft] = React.useState<Draft>(() => override ?? (bundled as Lesson));
  const [hasChanges, setHasChanges] = React.useState(false);

  if (!state.settings.editorEnabled) {
    return (
      <AppShell>
        <Screen>
          <div className="mt-24 rounded-2xl border border-line bg-white p-6 text-center">
            <p className="fa text-[15px] leading-relaxed text-ink">{STRINGS.editor_gate.fa}</p>
            <p className="mt-2 text-sm text-muted">{STRINGS.editor_gate.en}</p>
            <Link href="/settings">
              <Button className="mt-5" variant="secondary">{STRINGS.settings.en}</Button>
            </Link>
          </div>
        </Screen>
      </AppShell>
    );
  }

  const problems = validate(draft, DICT_LEMMAS);
  const allGood = problems.missingFa.length === 0 && problems.missingDict.length === 0 && problems.missingAnswer.length === 0;

  const save = () => {
    saveLessonOverride("lesson-01", draft);
    setHasChanges(false);
    toast(STRINGS.saved[lang]);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lesson-01.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefault = () => {
    clearLessonOverride("lesson-01");
    setDraft(bundled as Lesson);
    setHasChanges(false);
    toast(STRINGS.reset_default[lang]);
  };

  return (
    <AppShell>
      <Screen>
        <header className="flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold text-ink">Content editor</h1>
          <Link href="/settings" className="text-sm text-brand-deep underline underline-offset-2">
            Settings
          </Link>
        </header>

        {/* Validation panel */}
        <div className={`rounded-2xl border p-4 ${allGood ? "border-success/40 bg-success-soft" : "border-accent/50 bg-accent-soft"}`}>
          <h2 className="text-sm font-semibold text-ink">{STRINGS.validation.en} · <span className="fa">{STRINGS.validation.fa}</span></h2>
          {allGood ? (
            <p className="mt-1 text-sm text-success">All checks pass — every token resolves and every translation is present.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-ink-soft">
              {problems.missingFa.length > 0 && (
                <li>Sentences without a Farsi translation: {problems.missingFa.join(", ")}</li>
              )}
              {problems.missingDict.length > 0 && (
                <li>Tokens without a dictionary entry: {problems.missingDict.join(", ")}</li>
              )}
              {problems.missingAnswer.length > 0 && (
                <li>Questions without an answer/explanation: {problems.missingAnswer.join(", ")}</li>
              )}
            </ul>
          )}
        </div>

        {/* Missing glosses log */}
        <Card className="mt-3">
          <h2 className="text-sm font-semibold text-ink">{STRINGS.missing_glosses.en} · <span className="fa">{STRINGS.missing_glosses.fa}</span></h2>
          {state.missingGlosses.length === 0 ? (
            <p className="mt-1 text-sm text-muted">No unresolved taps logged.</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {state.missingGlosses.map((g, i) => (
                <li key={`${g.surface}-${i}`} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-[#8a6d00]">
                  {g.surface} {g.lemma && <span className="opacity-60">→ {g.lemma}</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <EditorForm draft={draft} onChange={(patch) => { setDraft((d) => patch(d)); setHasChanges(true); }} />

        <div className="sticky bottom-0 mt-6 border-t border-line bg-page py-3">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={save} disabled={!hasChanges}>{STRINGS.save.en}</Button>
            <Button variant="secondary" onClick={exportJson}>{STRINGS.export_json.en}</Button>
            <Button variant="ghost" onClick={() => copyAll(draft, toast, lang)}>{STRINGS.copy_data.en}</Button>
            <Button variant="ghost" onClick={resetToDefault}>{STRINGS.reset_default.en}</Button>
          </div>
        </div>
      </Screen>
    </AppShell>
  );
}

async function copyAll(draft: Draft, toast: (s: string) => void, lang: string) {
  try {
    await navigator.clipboard.writeText(JSON.stringify({ lesson: draft, appState: getState(), }, null, 2));
    toast(STRINGS.copied[lang as "en" | "fa"] ?? "Copied");
  } catch {
    toast("Clipboard unavailable");
  }
}
