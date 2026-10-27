"use client";

import * as React from "react";

type ToastMsg = { id: number; text: string };
const ToastCtx = React.createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMsg[]>([]);
  const idRef = React.useRef(0);

  const show = React.useCallback((text: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-enter pointer-events-auto max-w-[440px] rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastCtx);
}
