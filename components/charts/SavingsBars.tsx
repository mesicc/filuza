"use client";

import { cn } from "@/lib/cn";
import { useGrow } from "@/lib/useGrow";

export interface SavingsItem {
  key: string;
  label: string;
  /** Tekst za `title` i čitače ekrana, npr. „Novembar 2026: +3.240,50 KM, stopa štednje 72%“. */
  title: string;
  net: number;
}

/** Neto ušteda po mjesecima: pozitivni stupci iznad nulte linije, negativni ispod. */
export function SavingsBars({ items, growKey, height = 190 }: { items: SavingsItem[]; growKey: string; height?: number }) {
  const on = useGrow(growKey);
  const maxPos = Math.max(0, ...items.map((i) => i.net));
  const maxNeg = Math.max(0, ...items.map((i) => -i.net));
  const total = maxPos + maxNeg || 1;
  const zero = (maxPos / total) * 100; // položaj nulte linije od vrha, u %

  return (
    <div>
      <ul className="relative flex" style={{ height }}>
        <li aria-hidden="true" className="absolute inset-x-0 border-t border-border" style={{ top: `${zero}%` }} />
        {items.map((it) => {
          const pos = it.net >= 0;
          const size = (Math.abs(it.net) / total) * 100;
          return (
            <li
              key={it.key}
              role="img"
              aria-label={it.title}
              title={it.title}
              className="relative min-w-0 flex-1 rounded-[6px] transition-colors duration-150 hover:bg-soft"
            >
              <span
                className={cn(
                  "absolute left-1/2 w-[46%] max-w-5 -translate-x-1/2 transition-[height] duration-[350ms] ease-bar",
                  pos ? "rounded-[5px_5px_2px_2px] bg-income" : "rounded-[2px_2px_5px_5px] bg-expense",
                )}
                style={{
                  ...(pos ? { bottom: `${100 - zero}%` } : { top: `${zero}%` }),
                  height: on && it.net !== 0 ? `max(3px, ${size}%)` : 0,
                }}
              />
            </li>
          );
        })}
      </ul>
      <div aria-hidden="true" className="mt-2 flex">
        {items.map((it) => (
          <span key={it.key} className="min-w-0 flex-1 text-center text-[11px] leading-4 whitespace-nowrap text-ink-2">
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}
