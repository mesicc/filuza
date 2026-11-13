"use client";

import { useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SegOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface Props<T extends string> {
  options: readonly SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  /** Naziv grupe za čitače ekrana. */
  label: string;
  /** Renderuj kao tabove (`role="tablist"`); `idPrefix` povezuje tab s panelom `${idPrefix}-panel`. */
  tabs?: boolean;
  idPrefix?: string;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  className?: string;
}

const HEIGHT = { sm: "h-8 px-3 text-[13px]", md: "h-9 px-3.5 text-[14px]", lg: "h-11 px-4 text-[15px]" };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  tabs,
  idPrefix = "seg",
  size = "md",
  block,
  className,
}: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.value === value);
    const n = options.length;
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    onChange(options[next].value);
    ref.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  }

  return (
    <div
      ref={ref}
      role={tabs ? "tablist" : "group"}
      aria-label={label}
      onKeyDown={onKey}
      className={cn("gap-1 rounded-[14px] bg-soft p-1", block ? "flex w-full" : "inline-flex", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            {...(tabs
              ? {
                  role: "tab",
                  id: `${idPrefix}-tab-${o.value}`,
                  "aria-selected": active,
                  "aria-controls": `${idPrefix}-panel`,
                  tabIndex: active ? 0 : -1,
                }
              : { "aria-pressed": active })}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-[10px] font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-150",
              HEIGHT[size],
              block && "flex-1",
              active
                ? "bg-surface text-heading shadow-segment"
                : "text-ink-2 hover:bg-white/55 hover:text-ink active:bg-white/80",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
