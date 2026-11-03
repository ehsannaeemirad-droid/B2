"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Card: thick soft border, generous radius — Duolingo's surface style. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border-2 border-line bg-white p-4", className)}
      {...props}
    />
  );
}

/** Badge / pill */
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.6px]",
        className
      )}
      {...props}
    />
  );
}

/** Switch: green when on, like Duolingo's settings toggles. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-brand" : "bg-[#e5e5e5]",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-[26px] w-[26px] transform rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-transform duration-200",
          checked ? "translate-x-[27px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}

/** Progress bar with the Duolingo highlight strip inside the fill. */
export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-4 w-full overflow-hidden rounded-full bg-[#e5e5e5]", className)}>
      <div
        className="relative h-full rounded-full bg-brand transition-all duration-300"
        style={{ width: `${pct}%` }}
      >
        <span className="absolute inset-x-1 top-[3px] h-[4px] rounded-full bg-white/30" />
      </div>
    </div>
  );
}

/** Circular progress ring (SVG) */
export function ProgressRing({
  value,
  size = 56,
  stroke = 5,
  className,
  children,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, value)));
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e5e5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--teal)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/** Segmented control (2–4 options) */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-2xl border-2 border-line bg-white p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-9 grow rounded-xl px-3 text-[13px] font-extrabold transition-colors duration-150",
            value === o.value ? "bg-brand-soft text-[color:var(--success)]" : "text-muted hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
