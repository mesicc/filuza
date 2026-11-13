"use client";

import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { cn } from "@/lib/cn";

const ITEMS = [
  {
    q: "Da li je Filuza besplatna?",
    a: "Da, možeš besplatno kreirati račun i odmah početi pratiti prihode, rashode, budžete i ciljeve.",
  },
  {
    q: "Moraju li moji podaci biti povezani s bankom?",
    a: "Ne. Transakcije unosiš sam, za par sekundi. Ti odlučuješ šta i kada bilježiš.",
  },
  {
    q: "Radi li Filuza na telefonu?",
    a: "Da. Filuza je web aplikacija prilagođena telefonu, tabletu i računaru — bez instalacije.",
  },
  {
    q: "Mogu li izvesti svoje podatke?",
    a: "Naravno. Izvještaje preuzimaš kao CSV, a sve lične podatke možeš izvesti iz postavki u bilo kojem trenutku.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="rounded-card border border-border bg-surface px-5 shadow-card sm:px-7">
      {ITEMS.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className={cn(i > 0 && "border-t border-divider")}>
            <h3>
              <button
                type="button"
                id={`pitanje-${i}`}
                aria-expanded={isOpen}
                aria-controls={`odgovor-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex min-h-[68px] w-full items-center justify-between gap-4 py-4 text-left text-[16.5px] leading-6 font-semibold text-ink transition-colors duration-150 hover:text-heading"
              >
                <span>{it.q}</span>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-[10px] transition-colors duration-150",
                    isOpen ? "bg-soft text-heading" : "text-ink-2 group-hover:bg-soft group-hover:text-heading",
                  )}
                >
                  {isOpen ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
                </span>
              </button>
            </h3>
            <div
              id={`odgovor-${i}`}
              role="region"
              aria-labelledby={`pitanje-${i}`}
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
