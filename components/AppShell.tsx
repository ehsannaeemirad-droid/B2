"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTapRead, applyDocumentSettings } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";

/** Centers a 480px column on a neutral desktop background; applies text-size setting. */
export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const state = useTapRead();

  React.useEffect(() => {
    applyDocumentSettings(state);
  }, [state]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen justify-center bg-shell">
        <main
          className={cn(
            "w-full max-w-[480px] min-h-screen bg-page shadow-[0_0_40px_rgba(15,23,42,0.06)]",
            className
          )}
        >
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

export function Screen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex min-h-screen flex-col px-4 pb-10", className)}>{children}</div>;
}
