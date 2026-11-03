"use client";

import * as React from "react";
import type { Lesson, Sentence, Token } from "@/content/types";
import { StepChrome } from "./StepChrome";
import { markStepDone, useTapRead } from "@/lib/store";
import { AppShell, Screen } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/kit";
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
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-extrabold leading-snug text-ink">{chunk.heading}</h2>
                <span className="shrink-0 rounded-full bg-[#f7f7f7] px-2.5 py-1 text-[11px] font-extrabold text-muted">
                  {chunkIndex + 1}/{chunks.length}
                </span>
              </div>
              <Progress value={((chunkIndex + 1) / chunks.length) * 100} className="mt-2 h-2" />
            </div>

            <p className="mb-3 text-[13px] font-bold text-muted">
              {supportMode ? <span className="fa">{STRINGS.tap_word.fa}</span> : STRINGS.tap_word.en}
            </p>
          </div>

          <ul className="flex flex-col gap-3 px-4 pb-32">
            {chunk.sentences.map((sentence, i) => (
              <li key={sentence.id}>
                <SentenceView
                  sentence={sentence}
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
      <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-[#f0f0f0] bg-white">
        <div className="mx-auto flex max-w-[480px] gap-2 px-4 py-3">
          <Button variant="secondary" className="flex-1" onClick={playChunk}>
            {chunkPlaying ? `${STRINGS.stop[lang]} ■` : `${STRINGS.play[lang]} ▸`}
          </Button>
          <Button className="flex-1" onClick={nextChunk}>
            {chunkIndex < chunks.length - 1 ? `${STRINGS.next[lang]} →` : `${STRINGS.done[lang]} ✓`}
          </Button>
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
