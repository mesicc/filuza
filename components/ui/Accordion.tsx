"use client";

import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/cn";

export interface AccordionItem {
  q: string;
  a: string;
}

/** Accordion s jednim otvorenim odgovorom; prvo pitanje je otvoreno po defaultu. */
export function Accordion({
  items,
  idPrefix,
  accentIcon,
}: {
  items: AccordionItem[];
  idPrefix: string;
  /** Ikona plus/minus u boji `accent` (aplikacija) umjesto sekundarne (početna). */
  accentIcon?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className={cn(i > 0 && "border-t border-divider")}>
            <h3>
              <button
                type="button"
                id={`${idPrefix}-pitanje-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${idPrefix}-odgovor-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex min-h-[68px] w-full items-center justify-between gap-4 py-4 text-left text-[16.5px] leading-6 font-semibold text-ink transition-colors duration-150 hover:text-heading"
              >
                <span>{it.q}</span>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-[10px] transition-colors duration-150",
                    isOpen ? "bg-soft" : "group-hover:bg-soft",
                    accentIcon
                      ? "text-accent"
                      : isOpen
                        ? "text-heading"
                        : "text-ink-2 group-hover:text-heading",
                  )}
                >
                  {isOpen ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
                </span>
              </button>
            </h3>
            <div
              id={`${idPrefix}-odgovor-${i}`}
              role="region"
              aria-labelledby={`${idPrefix}-pitanje-${i}`}
              hidden={!isOpen}
              className="animate-fz-in pr-12 pb-5 text-[15.5px] leading-[1.6] text-ink-2"
            >
              <p>{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
