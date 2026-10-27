"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "default" | "sm" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-deep active:bg-brand-deep",
  secondary: "bg-brand-soft text-brand-deep hover:bg-[#d8e9e8]",
  ghost: "bg-transparent text-ink hover:bg-black/5",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  default: "h-11 px-5 text-[15px]",
  sm: "h-10 px-4 text-sm",
  icon: "h-11 w-11",
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
        "inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium",
        "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
