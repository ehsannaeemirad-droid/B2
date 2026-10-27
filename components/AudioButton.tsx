"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { speak, stopSpeaking, speechAvailable } from "@/lib/audio";

export function AudioButton({
  text,
  size = 44,
  className,
}: {
  text: string;
  size?: number;
  className?: string;
}) {
  const [playing, setPlaying] = React.useState(false);
  const available = speechAvailable();

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    speak(text, { onStart: () => setPlaying(true), onEnd: () => setPlaying(false) });
    // Fallback if onStart never fires (some engines)
    window.setTimeout(() => {
      setPlaying(false);
    }, 6000 + text.length * 120);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!available}
      aria-label={available ? "Play audio" : "Audio not available"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-all",
        available
          ? "bg-brand-soft text-brand-deep hover:bg-[#d5e7e6] active:scale-95"
          : "cursor-not-allowed bg-[#eceae4] text-[#b4b0a8]",
        playing && "ring-2 ring-brand/40",
        className
      )}
      style={{ width: size, height: size, minHeight: 44, minWidth: 44 }}
    >
      <SpeakerIcon width={Math.round(size * 0.45)} />
    </button>
  );
}

export function SpeakerIcon({ width = 18 }: { width?: number }) {
  return (
    <svg width={width} height={width} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9v6h4l5 4V5L8 9H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
