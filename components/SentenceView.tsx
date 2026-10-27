"use client";

import * as React from "react";
import type { Sentence, Token } from "@/content/types";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/AudioButton";

/** Strip trailing punctuation for dictionary-style display of a token surface. */
export function cleanSurface(surface: string): string {
  return surface.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}’']+$/gu, "");
}

type Props = {
  sentence: Sentence;
  verbsVisible: boolean;
  playing: boolean;
  supportMode: boolean;
  onWordTap: (token: Token, index: number) => void;
  onSentenceTap: () => void;
  activeTokenIndex?: number | null;
};

export function SentenceView({
  sentence,
  verbsVisible,
  playing,
  supportMode,
  onWordTap,
  onSentenceTap,
  activeTokenIndex,
}: Props) {
  const longPressTimer = React.useRef<number | null>(null);
  const longPressFired = React.useRef(false);

  const clearTimer = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  React.useEffect(() => clearTimer, []);

  const tokenHandlers = (index: number) => ({
    onPointerDown: () => {
      longPressFired.current = false;
      clearTimer();
      longPressTimer.current = window.setTimeout(() => {
        longPressFired.current = true;
        onSentenceTap();
      }, 500);
    },
    onPointerUp: clearTimer,
    onPointerLeave: clearTimer,
    onPointerCancel: clearTimer,
    onClick: () => {
      if (!longPressFired.current) onWordTap(sentence.tokens[index], index);
      longPressFired.current = false;
    },
  });

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-line bg-white p-4 pr-14 pb-5 transition-colors duration-150",
        playing && "border-brand/50 bg-brand-soft/40"
      )}
      data-sentence={sentence.id}
    >
      <p className="text-[17px] leading-loose text-ink">
        {sentence.tokens.map((token, i) => (
          <React.Fragment key={`${sentence.id}-t${i}`}>
            {i > 0 && " "}
            <button
              type="button"
              data-token-index={i}
              {...tokenHandlers(i)}
              className={cn(
                "word-hit cursor-pointer text-start transition-colors duration-150",
                "hover:text-brand-deep",
                token.isPhrase && "token-phrase",
                verbsVisible && token.presentSimple && "rounded bg-accent-soft px-0.5",
                activeTokenIndex === i && "rounded bg-accent-soft px-0.5"
              )}
            >
              {token.surface}
            </button>
          </React.Fragment>
        ))}
      </p>

      {supportMode && (
        <p className="fa mt-2 text-base leading-relaxed text-muted">{sentence.fa}</p>
      )}

      <AudioButton text={sentence.en} size={40} className="absolute right-2.5 top-2.5" />

      <button
        type="button"
        onClick={onSentenceTap}
        aria-label="Sentence translation"
        title="Sentence translation"
        className="absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 hover:text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 9h17M3.5 15h17" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </div>
  );
}
