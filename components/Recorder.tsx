"use client";

import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { STRINGS } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Voice recorder: MediaRecorder, 60s cap, playback + re-record.
 * Stores the audio as a base64 data URL string (localStorage-friendly).
 */
export function Recorder({
  lang,
  audio,
  onChange,
  seconds = 60,
  className,
}: {
  lang: "en" | "fa";
  /** Current stored recording (data URL) or undefined. */
  audio?: string;
  onChange: (audio: string | undefined) => void;
  seconds?: number;
  className?: string;
}) {
  const [recording, setRecording] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<number | null>(null);
  const toast = useToast();

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  React.useEffect(() => stopTimer, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => onChange(typeof reader.result === "string" ? reader.result : undefined);
        reader.readAsDataURL(blob);
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= seconds) {
            stop();
            return seconds;
          }
          return e + 1;
        });
      }, 1000);
    } catch {
      toast(STRINGS.mic_denied[lang]);
    }
  };

  const stop = () => {
    stopTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(1, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={cn("flex items-center gap-3", className)} data-recording={recording || undefined}>
      {recording ? (
        <>
          <Button variant="danger" onClick={stop} className="min-w-28">
            ■ {STRINGS.stop[lang]} · {mmss(elapsed)}
          </Button>
          <span className="fa text-sm text-muted">{STRINGS.recording[lang]}</span>
        </>
      ) : (
        <>
          <Button variant="secondary" onClick={start} className="min-w-28">
            ● {STRINGS.record[lang]}
          </Button>
          {audio && (
            <>
              <audio controls src={audio} preload="metadata" className="h-11 min-w-44 flex-1" />
              <Button variant="ghost" onClick={() => onChange(undefined)} className="shrink-0">
                {STRINGS.rerecord[lang]}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
