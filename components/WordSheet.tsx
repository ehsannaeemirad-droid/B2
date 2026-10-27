"use client";

import * as React from "react";
import type { Sentence, Token } from "@/content/types";
import { lookupDictionary } from "@/content/registry";
import { addToReviewList, logMissingGloss, useTapRead } from "@/lib/store";
import { AudioButton } from "@/components/AudioButton";
import { BottomSheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { STRINGS, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { cleanSurface } from "@/components/SentenceView";

export function WordSheet({
  token,
  lessonId,
  open,
  onClose,
}: {
  token: Token | null;
  lessonId: string;
  open: boolean;
  onClose: () => void;
}) {
  const state = useTapRead();
  const toast = useToast();
  const surface = token ? cleanSurface(token.surface) : "";
  const entry = token?.lemma ? lookupDictionary(token.lemma) : undefined;

  React.useEffect(() => {
    if (open && token && token.lemma && !entry) {
      logMissingGloss(lessonId, token.surface, token.lemma);
    }
  }, [open, token, entry, lessonId]);

  if (!token) return null;

  const lang = state.settings.uiLang;
  const displaySurface = token.inflectionFa?.startsWith("it’s") ? token.surface : surface;
  const audioText = token.isPhrase ? token.surface.replace(/[.,]/g, "") : surface;

  const addWord = () => {
    if (entry) addToReviewList(surface, entry.fa);
    toast(t(lang, "added_word"));
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} label="Word meaning">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-2xl font-semibold text-ink">{displaySurface}</h3>
        <AudioButton text={audioText} />
      </div>

      {entry ? (
        <>
          <p className="fa mt-3 text-xl leading-relaxed text-ink">{entry.fa}</p>
          <p className="mt-1 text-sm text-muted">{entry.pos}</p>
          {entry.def && <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{entry.def}</p>}
          {entry.note && <p className="fa mt-1 text-sm text-muted">{entry.note}</p>}
        </>
      ) : (
        <>
          <p className="fa mt-3 text-xl leading-relaxed text-ink">{STRINGS.translation_pending.fa}</p>
          <p className="mt-1 text-sm text-muted">{STRINGS.translation_pending.en}</p>
        </>
      )}

      {token.inflectionFa && (
        <p className="fa mt-3 rounded-xl bg-[#f1efea] px-3 py-2 text-sm text-ink-soft">
          {displaySurface} <span aria-hidden>→</span> {token.inflectionFa}
        </p>
      )}

      {entry && (
        <Button variant="secondary" className="mt-5 w-full" onClick={addWord}>
          {STRINGS.add_word.fa} · {STRINGS.add_word.en}
        </Button>
      )}
    </BottomSheet>
  );
}

export function SentenceSheet({
  sentence,
  open,
  onClose,
}: {
  sentence: Sentence | null;
  open: boolean;
  onClose: () => void;
}) {
  const state = useTapRead();
  if (!sentence) return null;
  const lang = state.settings.uiLang;
  return (
    <BottomSheet open={open} onClose={onClose} label="Sentence translation">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[17px] leading-relaxed text-ink">{sentence.en}</p>
        <AudioButton text={sentence.en} />
      </div>
      <div className="mt-4 border-t border-line pt-4">
        <p className={cn("text-xs font-medium uppercase tracking-wide text-muted", lang === "fa" && "fa")}>
          {t(lang, "sentence_translation")}
        </p>
        <p className="fa mt-2 text-lg leading-loose text-ink">{sentence.fa}</p>
      </div>
    </BottomSheet>
  );
}
