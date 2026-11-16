"use client";

import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { IconButton } from "@/components/ui/Button";
import { anchorIn, canNext, canPrev, shiftAnchor } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { MIN_DATE, TODAY, monthOptions, parts } from "@/lib/dates";
import type { PMode } from "@/lib/types";

const YEARS = Array.from(
  { length: parts(TODAY).y - parts(MIN_DATE).y + 1 },
  (_, i) => parts(MIN_DATE).y + i,
);

const MONTH_OPTIONS = monthOptions(MIN_DATE.slice(0, 7), TODAY.slice(0, 7)).reverse();

/** Navigacija perioda: ‹ birač (dan / mjesec / godina) ›, ograničeno na MIN_DATE…TODAY. */
export function PeriodNav({
  mode,
  anchor,
  onChange,
  className,
}: {
  mode: PMode;
  anchor: string;
  onChange: (anchor: string) => void;
  className?: string;
}) {
  const pick = (date: string) => {
    if (!date || date < MIN_DATE || date > TODAY) return;
    onChange(anchorIn(mode, date));
  };

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <IconButton
        bordered
        size={44}
        label="Prethodni period"
        disabled={!canPrev(mode, anchor)}
        onClick={() => onChange(shiftAnchor(mode, anchor, -1))}
      >
        <CaretLeft size={18} aria-hidden="true" />
      </IconButton>
      {mode === "day" && (
        <input
          type="date"
          aria-label="Odaberi dan"
          className="fz-field h-11 min-w-0 flex-1 tb:w-[168px] tb:flex-none"
          min={MIN_DATE}
          max={TODAY}
          value={anchor}
          onChange={(e) => pick(e.target.value)}
        />
      )}
      {mode === "month" && (
        <div className="relative min-w-0 flex-1 tb:w-[190px] tb:flex-none">
          <select
            aria-label="Odaberi mjesec"
            className="fz-field tnum h-11"
            value={anchor.slice(0, 7)}
            onChange={(e) => pick(`${e.target.value}-01`)}
          >
            {MONTH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <CaretDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-2"
          />
        </div>
      )}
      {mode === "year" && (
        <div className="relative min-w-0 flex-1 tb:w-[120px] tb:flex-none">
          <select
            aria-label="Odaberi godinu"
            className="fz-field tnum h-11"
            value={parts(anchor).y}
            onChange={(e) => onChange(anchorIn("year", `${e.target.value}-01-01`))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <CaretDown
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-2"
          />
        </div>
      )}
      <IconButton
        bordered
        size={44}
        label="Sljedeći period"
        disabled={!canNext(mode, anchor)}
        onClick={() => onChange(shiftAnchor(mode, anchor, 1))}
      >
        <CaretRight size={18} aria-hidden="true" />
      </IconButton>
    </div>
  );
}
