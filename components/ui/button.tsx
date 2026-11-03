"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "default" | "sm" | "icon";

/**
 * Duolingo-style "chunky" button: solid colour with a hard bottom shadow that
 * collapses when the button is pressed, so it physically sinks.
 */
const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_4px_0_var(--teal-deep)] hover:brightness-105 active:translate-y-[4px] active:shadow-none",
  secondary:
    "border-2 border-line bg-white text-[color:var(--blue)] shadow-[0_4px_0_var(--line)] hover:bg-[#f7f7f7] active:translate-y-[4px] active:shadow-none",
  ghost: "bg-transparent text-[color:var(--blue)] shadow-none hover:bg-[#f0f9ff]",
  danger:
    "bg-[color:var(--danger)] text-white shadow-[0_4px_0_#c81e1e] hover:brightness-105 active:translate-y-[4px] active:shadow-none",
};

const sizes: Record<Size, string> = {
  default: "h-12 rounded-2xl px-5 text-[15px]",
  sm: "h-10 rounded-xl px-4 text-[13px]",
  icon: "h-11 w-11 rounded-2xl px-0",
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-extrabold uppercase tracking-[0.8px]",
        "transition-[transform,box-shadow,background-color,filter] duration-100",
        "disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
