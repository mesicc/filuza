"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Tone = "ok" | "error";
interface ToastItem {
  id: number;
  text: string;
  tone: Tone;
}

const Ctx = createContext<(text: string, tone?: Tone) => void>(() => {});

/** `const toast = useToast(); toast("Transakcija je sačuvana.")` */
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<ToastItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, tone: Tone = "ok") => {
    if (timer.current) clearTimeout(timer.current);
    setItem({ id: Date.now(), text, tone });
    timer.current = setTimeout(() => setItem(null), 3400);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <Ctx.Provider value={show}>
      {children}
      {/* Mobitel: iznad donje navigacije, pune širine. Tablet/desktop: dolje desno. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-[92px] z-[120] flex justify-center tb:inset-x-auto tb:right-6 tb:bottom-6"
      >
        {item && (
          <div
            key={item.id}
            className="pointer-events-auto flex w-full items-center gap-2.5 rounded-[14px] bg-toast py-3 pr-4 pl-3.5 text-[14px] leading-5 font-medium text-white shadow-popover animate-fz-pop tb:w-auto tb:max-w-[420px]"
          >
            {item.tone === "ok" ? (
              <CheckCircle size={20} aria-hidden="true" className="shrink-0 text-[#9FD3B8]" />
            ) : (
              <WarningCircle size={20} aria-hidden="true" className="shrink-0 text-[#F5C4B3]" />
            )}
            <span>{item.text}</span>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
