"use client";

/**
 * English audio via the browser SpeechSynthesis API (en-US, rate 0.85).
 * No bundled audio files. Graceful degradation when the API is unavailable.
 */

let voice: SpeechSynthesisVoice | null = null;
let voicePicked = false;

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

export function speechAvailable(): boolean {
  return synth() !== null;
}

function pickVoice(s: SpeechSynthesis): SpeechSynthesisVoice | null {
  if (voicePicked) return voice;
  voicePicked = true;
  const voices = s.getVoices();
  if (!voices.length) return null;
  voice =
    voices.find((v) => /en[-_]US/i.test(v.lang) && /female|samantha|zira|aria/i.test(v.name)) ??
    voices.find((v) => /en[-_]US/i.test(v.lang)) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;
  return voice;
}

export type SpeakOptions = {
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
};

export function stopSpeaking() {
  synth()?.cancel();
}

/** Speak one stretch of English text. No-ops (calls onEnd) when speech is unavailable. */
export function speak(text: string, options: SpeakOptions = {}) {
  const s = synth();
  if (!s) {
    options.onEnd?.();
    return;
  }
  s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = options.rate ?? 0.85;
  u.pitch = 1;
  const v = pickVoice(s);
  if (v) u.voice = v;
  u.onstart = () => options.onStart?.();
  u.onend = () => options.onEnd?.();
  u.onerror = () => options.onEnd?.();
  s.speak(u);
}

/** Speak a list of strings in order, reporting which index is playing. Returns a cancel function. */
export function speakSequence(
  texts: string[],
  handlers: { onIndexStart?: (i: number) => void; onDone?: () => void }
): () => void {
  const s = synth();
  if (!s) {
    handlers.onDone?.();
    return () => {};
  }
  let cancelled = false;
  let i = 0;
  const next = () => {
    if (cancelled || i >= texts.length) {
      handlers.onDone?.();
      return;
    }
    const idx = i++;
    const u = new SpeechSynthesisUtterance(texts[idx]);
    u.lang = "en-US";
    u.rate = 0.85;
    const v = pickVoice(s);
    if (v) u.voice = v;
    u.onstart = () => handlers.onIndexStart?.(idx);
    u.onend = next;
    u.onerror = next;
    s.speak(u);
  };
  next();
  return () => {
    cancelled = true;
    s.cancel();
  };
}
