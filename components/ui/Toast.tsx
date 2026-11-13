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
    timer.current = setTimeout(() => setItem(null), 3200);
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
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[120] flex justify-center px-4 tb:bottom-8"
      >
        {item && (
          <div
            key={item.id}
            className="pointer-events-auto flex max-w-[440px] items-center gap-2.5 rounded-[14px] bg-toast py-3 pr-4 pl-3.5 text-[14px] font-medium text-white shadow-popover animate-fz-pop"
          >
            {item.tone === "ok" ? (
              <CheckCircle size={20} aria-hidden="true" className="shrink-0 text-[#9FD8B8]" />
            ) : (
              <WarningCircle size={20} aria-hidden="true" className="shrink-0 text-[#F2B1AA]" />
            )}
            <span>{item.text}</span>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
