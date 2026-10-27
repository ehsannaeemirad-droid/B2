"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label?: string;
}) {
  // Keep mounted a beat for the exit feel; simple approach: unmount immediately.
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label}>
      <button
        aria-label="Close"
        className="fade-enter absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div
        className={cn(
          "sheet-enter relative w-full max-w-[480px] rounded-t-3xl border-t border-line bg-page px-5 pb-8 pt-3",
          "shadow-[0_-8px_30px_rgba(15,23,42,0.15)]",
          "max-h-[80vh] overflow-y-auto"
        )}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#d9d6cf]" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-3 flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-black/5"
          aria-label="Close sheet"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
