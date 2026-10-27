"use client";

import * as React from "react";
import type { Lesson, Sentence, Token } from "@/content/types";
import { StepChrome } from "./StepChrome";
import { markStepDone, useTapRead } from "@/lib/store";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Switch, Progress } from "@/components/ui/kit";
import { SentenceView } from "@/components/SentenceView";
import { WordSheet, SentenceSheet } from "@/components/WordSheet";
import { useToast } from "@/components/ui/toast";
import { speakSequence, speechAvailable, stopSpeaking } from "@/lib/audio";
import { STRINGS, type UiLang } from "@/lib/i18n";

export function StepReading({
  lesson,
  lang,
  onDone,
}: {
  lesson: Lesson;
  lang: UiLang;
  onDone: () => void;
}) {
  const { settings } = useTapRead();
  const supportMode = settings.supportMode;
  const toast = useToast();

  const [chunkIndex, setChunkIndex] = React.useState(0);
  const [verbsVisible, setVerbsVisible] = React.useState(false);
  const [wordToken, setWordToken] = React.useState<Token | null>(null);
  const [wordIndex, setWordIndex] = React.useState<number | null>(null);
  const [sheetSentence, setSheetSentence] = React.useState<Sentence | null>(null);
  const [playingIndex, setPlayingIndex] = React.useState<number | null>(null);
  const [chunkPlaying, setChunkPlaying] = React.useState(false);
  const cancelRef = React.useRef<(() => void) | null>(null);

  const chunks = lesson.reading.chunks;
  const chunk = chunks[chunkIndex];

  React.useEffect(() => {
    return () => {
      cancelRef.current?.();
      stopSpeaking();
    };
  }, [chunkIndex]);

  const playChunk = () => {
    if (chunkPlaying) {
      cancelRef.current?.();
      setChunkPlaying(false);
      setPlayingIndex(null);
      return;
    }
    if (!speechAvailable()) {
      toast(STRINGS.audio_note_fallback[lang]);
      return;
    }
    setChunkPlaying(true);
    cancelRef.current = speakSequence(
      chunk.sentences.map((s) => s.en),
      {
        onIndexStart: (i) => setPlayingIndex(i),
        onDone: () => {
          setChunkPlaying(false);
          setPlayingIndex(null);
        },
      }
    );
  };

  const nextChunk = () => {
    cancelRef.current?.();
    stopSpeaking();
    setChunkPlaying(false);
    setPlayingIndex(null);
    if (chunkIndex < chunks.length - 1) {
      setChunkIndex(chunkIndex + 1);
    } else {
      markStepDone(lesson.id, 2);
      onDone();
    }
  };

  return (
    <>
      <AppShell>
        <Screen className="px-0">
          <div className="px-4">
            <StepChrome lesson={lesson} step={2} lang={lang} />

            <div className="mb-3">
              <Progress value={((chunkIndex + 1) / chunks.length) * 100} />
              <div className="mt-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">{chunk.heading}</h2>
                <span className="text-sm text-muted">
                  {chunkIndex + 1}/{chunks.length}
                </span>
              </div>
            </div>

            {/* Show-the-verbs toggle with legend */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-line bg-white px-4 py-2.5">
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
                <Switch checked={verbsVisible} onCheckedChange={setVerbsVisible} label={STRINGS.show_verbs.en} />
                {STRINGS.show_verbs[lang]}
              </label>
              <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-[#8a6d00]">
                <span className="fa">«{STRINGS.present_simple.fa}»</span> · {STRINGS.present_simple.en}
              </span>
            </div>

            {supportMode ? (
              <p className="fa mb-3 text-sm text-muted">{STRINGS.tap_word.fa}</p>
            ) : (
              <p className="mb-3 text-sm text-muted">{STRINGS.tap_word.en}</p>
            )}
          </div>

          <ul className="flex flex-col gap-3 px-4 pb-28">
            {chunk.sentences.map((sentence, i) => (
              <li key={sentence.id}>
                <SentenceView
                  sentence={sentence}
                  verbsVisible={verbsVisible}
                  playing={playingIndex === i}
                  supportMode={supportMode}
                  onWordTap={(token, index) => {
                    setWordToken(token);
                    setWordIndex(index);
                  }}
                  onSentenceTap={() => setSheetSentence(sentence)}
                  activeTokenIndex={wordToken ? wordIndex : null}
                />
              </li>
            ))}
          </ul>
        </Screen>
      </AppShell>

      {/* Sticky controls */}
      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto max-w-[480px] border-t border-line bg-page px-4 py-3">
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={playChunk}>
              {chunkPlaying ? `${STRINGS.stop[lang]} ■` : `${STRINGS.play[lang]} ▸`}
            </Button>
            <Button className="flex-1" onClick={nextChunk}>
              {chunkIndex < chunks.length - 1 ? `${STRINGS.next[lang]} →` : `${STRINGS.done[lang]} ✓`}
            </Button>
          </div>
        </div>
      </div>

      {/* Word sheet */}
      <WordSheet
        token={wordToken}
        lessonId={lesson.id}
        open={Boolean(wordToken)}
        onClose={() => {
          setWordToken(null);
          setWordIndex(null);
        }}
      />

      {/* Sentence sheet (translate icon or long-press a word) */}
      <SentenceSheet sentence={sheetSentence} open={Boolean(sheetSentence)} onClose={() => setSheetSentence(null)} />
    </>
  );
}
