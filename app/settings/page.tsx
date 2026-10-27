"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Switch, Segmented } from "@/components/ui/kit";
import { STRINGS, t } from "@/lib/i18n";
import { useTapRead, updateSettings, resetAll } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

function Row({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 py-1">
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-ink">{title}</p>
        {hint && <p className="fa text-xs leading-relaxed text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const state = useTapRead();
  const lang = state.settings.uiLang;
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = React.useState(false);

  return (
    <AppShell>
      <Screen>
        <header className="flex items-center gap-2 pt-4">
          <Button variant="ghost" className="h-11 w-11 px-0" onClick={() => router.push("/")} aria-label={STRINGS.back.en}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          <h1 className="text-xl font-semibold text-ink">{STRINGS.settings[lang]}</h1>
        </header>

        <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white px-4">
          <Row title={STRINGS.support_mode.en} hint={STRINGS.support_mode_hint.fa}>
            <Switch
              checked={state.settings.supportMode}
              onCheckedChange={(v) => updateSettings({ supportMode: v })}
              label={STRINGS.support_mode.en}
            />
          </Row>

          <Row title={`${STRINGS.app_language.en} · ${STRINGS.app_language.fa.replace("زبان برنامه", "App language")}`}>
            <Segmented
              value={state.settings.uiLang}
              options={[
                { value: "en", label: "English" },
                { value: "fa", label: "فارسی" },
              ]}
              onChange={(v) => updateSettings({ uiLang: v })}
            />
          </Row>

          <Row title={STRINGS.text_size[lang]}>
            <Segmented
              value={state.settings.textSize}
              options={[
                { value: "normal", label: STRINGS.normal[lang] },
                { value: "large", label: STRINGS.large[lang] },
              ]}
              onChange={(v) => updateSettings({ textSize: v })}
            />
          </Row>

          <Row title={STRINGS.teacher_mode.en}>
            <Switch
              checked={state.settings.teacherMode}
              onCheckedChange={(v) => updateSettings({ teacherMode: v })}
              label={STRINGS.teacher_mode.en}
            />
          </Row>

          <Row title="Content editor · ویرایشگر محتوا">
            <Switch
              checked={state.settings.editorEnabled}
              onCheckedChange={(v) => updateSettings({ editorEnabled: v })}
              label="Content editor"
            />
          </Row>
        </div>

        {state.settings.teacherMode && (
          <Link href="/teacher" className="mt-3 block rounded-2xl border border-brand/40 bg-brand-soft px-4 py-3 text-[15px] font-medium text-brand-deep">
            Open teacher view → Teacher view
          </Link>
        )}
        {state.settings.editorEnabled && (
          <Link href="/editor" className="mt-3 block rounded-2xl border border-line bg-white px-4 py-3 text-[15px] font-medium text-ink">
            Open content editor → Edit lesson text
          </Link>
        )}

        <div className="mt-8">
          {confirming ? (
            <div className="rounded-2xl border border-danger/40 bg-danger-soft p-4 text-center">
              <p className="text-sm font-medium text-danger">{STRINGS.confirm_reset.en}</p>
              <p className="fa mt-1 text-sm text-danger">{STRINGS.confirm_reset.fa}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  {STRINGS.cancel[lang]}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    resetAll();
                    setConfirming(false);
                    toast(STRINGS.reset[lang] + " — " + t(lang, "saved"));
                  }}
                >
                  {STRINGS.reset[lang]}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" className="w-full text-danger" onClick={() => setConfirming(true)}>
              {STRINGS.reset_progress.en} · <span className="fa">{STRINGS.reset_progress.fa}</span>
            </Button>
          )}
        </div>
      </Screen>
    </AppShell>
  );
}
