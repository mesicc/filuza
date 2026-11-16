"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { GRID_STEPS, kS, km, niceMax, nkm } from "@/lib/format";
import type { ChartColumn } from "@/lib/columns";
import { useGrow } from "@/lib/useGrow";

export type { ChartColumn };

interface Props {
  columns: ChartColumn[];
  style?: "stupci" | "linije";
  /** Planirani prihod i limit rashoda po stupcu; `null` = bez linija plana. */
  plan?: { inc: number; exp: number } | null;
  /** Mijenja se pri promjeni perioda – pokreće animaciju rasta. */
  growKey: string;
  label: string;
  height?: number;
}

const short = (n: number) => (n >= 1000 ? kS(n) : String(Math.round(n)));

export function BarLineChart({ columns, style = "stupci", plan, growKey, label, height = 260 }: Props) {
  const on = useGrow(growKey);
  const [active, setActive] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => setActive(null), [growKey]);

  // Klik izvan grafikona zatvara tooltip otvoren dodirom.
  useEffect(() => {
    if (active === null) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [active]);

  const n = columns.length;
  const top = niceMax(
    Math.max(0, ...columns.map((c) => Math.max(c.inc, c.exp)), plan ? Math.max(plan.inc, plan.exp) : 0),
  );
  const pct = (v: number) => (v / top) * 100;
  const dense = n > 16;
  const cur = active !== null ? columns[active] : null;
  const pos = active !== null ? ((active + 0.5) / n) * 100 : 0;
  const align = pos < 28 ? "left" : pos > 72 ? "right" : "center";

  const past = columns.map((c, i) => ({ c, i })).filter((x) => !x.c.future);
  const pts = (key: "inc" | "exp") =>
    past.map(({ c, i }) => `${((i + 0.5) / n) * 100},${100 - (on ? pct(c[key]) : 0)}`).join(" ");
  const area =
    past.length > 1
      ? `${((past[0].i + 0.5) / n) * 100},100 ${pts("inc")} ${((past[past.length - 1].i + 0.5) / n) * 100},100`
      : "";

  return (
    <div className="flex gap-2 tb:gap-3">
      {/* Osa */}
      <div aria-hidden="true" className="relative w-8 shrink-0" style={{ height }}>
        {GRID_STEPS.map((s) => (
          <span
            key={s}
            className="tnum absolute right-0 translate-y-1/2 text-[11px] leading-none text-ink-2"
            style={{ bottom: `${s * 100}%` }}
          >
            {kS(top * s)}
          </span>
        ))}
      </div>

      <div ref={wrap} className="relative min-w-0 flex-1">
        <div className="relative" style={{ height }} onMouseLeave={() => setActive(null)}>
          {/* Mreža */}
          <div role="img" aria-label={label} className="absolute inset-0">
            {GRID_STEPS.map((s) => (
              <span
                key={s}
                className={cn("absolute inset-x-0 border-t", s === 0 ? "border-border" : "border-dashed border-grid")}
                style={{ bottom: `${s * 100}%` }}
              />
            ))}
          </div>

          {/* Stupci (i površine za hover/fokus) */}
          <div className="absolute inset-0 flex">
            {columns.map((c, i) => (
              <button
                key={c.key}
                type="button"
                aria-label={`${c.title}: prihodi ${km(c.inc)}, rashodi ${km(c.exp)}`}
                aria-pressed={active === i}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive((a) => (a === i ? null : a))}
                onClick={() => setActive(i)}
                className={cn(
                  "relative flex h-full min-w-0 flex-1 items-end justify-center rounded-t-[6px] transition-colors duration-150 focus-visible:outline-offset-[-2px]",
                  dense ? "gap-px" : "gap-[2px]",
                  active === i ? "bg-soft" : c.mark ? "bg-[#FFF1EB]" : "bg-transparent",
                  c.future && "opacity-35",
                )}
              >
                {style === "stupci" &&
                  (["inc", "exp"] as const).map((k) => (
                    <span
                      key={k}
                      className={cn(
                        "w-[38%] max-w-4 rounded-[5px_5px_2px_2px] transition-[height] duration-[350ms] ease-bar",
                        k === "inc" ? "bg-income" : "bg-expense",
                      )}
                      style={{ height: on && c[k] > 0 ? `max(3px, ${pct(c[k])}%)` : 0 }}
                    />
                  ))}
              </button>
            ))}
          </div>

          {/* Linije */}
          {style === "linije" && (
            <>
              <svg
                aria-hidden="true"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 size-full overflow-visible"
              >
                {area && <polygon points={area} fill="var(--color-income)" opacity="0.1" />}
                {(["inc", "exp"] as const).map((k) => (
                  <polyline
                    key={k}
                    points={pts(k)}
                    fill="none"
                    stroke={k === "inc" ? "var(--color-income)" : "var(--color-expense)"}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: "all .35s cubic-bezier(.3,.7,.3,1)" }}
                  />
                ))}
              </svg>
              {cur &&
                !cur.future &&
                (["inc", "exp"] as const).map((k) => (
                  <span
                    key={k}
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-surface",
                      k === "inc" ? "bg-income" : "bg-expense",
                    )}
                    style={{ left: `${pos}%`, bottom: `${pct(cur[k])}%` }}
                  />
                ))}
            </>
          )}

          {/* Linije plana */}
          {plan && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <span
                className="absolute inset-x-0 border-t-2 border-dashed border-income"
                style={{ bottom: `${pct(plan.inc)}%` }}
              >
                <span className="tnum absolute right-0 bottom-[3px] rounded-full bg-income-soft px-2 text-[11px] leading-[18px] font-semibold text-income-strong">
                  Plan {short(plan.inc)}
                </span>
              </span>
              <span
                className="absolute inset-x-0 border-t-2 border-dashed border-expense"
                style={{ bottom: `${pct(plan.exp)}%` }}
              >
                <span className="tnum absolute bottom-[3px] left-0 rounded-full bg-expense-soft px-2 text-[11px] leading-[18px] font-semibold text-expense-strong">
                  Limit {short(plan.exp)}
                </span>
              </span>
            </div>
          )}

          {/* Tooltip */}
          {cur && (
            <div
              aria-hidden="true"
              data-chart-tooltip
              className={cn(
                "pointer-events-none absolute top-1 z-10 w-[220px] max-w-full rounded-control border border-border bg-surface p-3 text-left shadow-popover animate-fz-fade",
                align === "center" && "-translate-x-1/2",
              )}
              style={
                align === "left"
                  ? { left: 0 }
                  : align === "right"
                    ? { right: 0 }
                    : { left: `${pos}%` }
              }
            >
              <p className="text-[13px] leading-[18px] font-semibold text-ink">{cur.title}</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px] leading-[18px]">
                <dt className="flex items-center gap-1.5 text-ink-2">
                  <span className="size-2 rounded-[3px] bg-income" />
                  Prihodi
                </dt>
                <dd className="amount text-right text-ink">{km(cur.inc)}</dd>
                <dt className="flex items-center gap-1.5 text-ink-2">
                  <span className="size-2 rounded-[3px] bg-expense" />
                  Rashodi
                </dt>
                <dd className="amount text-right text-ink">{km(cur.exp)}</dd>
                <dt className="text-ink-2">Neto</dt>
                <dd
                  className={cn(
                    "amount text-right",
                    cur.inc - cur.exp >= 0 ? "text-income-text" : "text-expense-text",
                  )}
                >
                  {nkm(cur.inc - cur.exp)}
                </dd>
              </dl>
              {plan && (
                <p className="tnum mt-2 border-t border-divider pt-2 text-[12px] leading-4 text-ink-2">
                  Plan: {km(plan.inc)} · Limit: {km(plan.exp)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Oznake */}
        <div aria-hidden="true" className="mt-2 flex">
          {columns.map((c) => (
            <span
              key={c.key}
              className={cn(
                "tnum min-w-0 flex-1 text-center text-[11px] leading-4 whitespace-nowrap",
                n >= 12 && !dense && "max-sm:text-[9.5px] max-sm:tracking-[-0.02em]",
                c.mark ? "font-bold text-primary" : "text-ink-2",
                c.future && !c.mark && "opacity-60",
              )}
            >
              {c.hideLabel && !c.mark ? "" : c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
