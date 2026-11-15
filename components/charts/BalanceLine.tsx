"use client";

import { km } from "@/lib/format";

export interface BalancePoint {
  key: string;
  label: string;
  value: number;
}

interface Props {
  points: BalancePoint[];
  /** Stanje prije prvog stupca. */
  start: number;
  height?: number;
}

const PAD = 12; // % praznog prostora iznad najviše i ispod najniže tačke

/** Linija kumulativnog stanja računa po stupcima perioda. */
export function BalanceLine({ points, start, height = 190 }: Props) {
  const values = [start, ...points.map((p) => p.value)];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const y = (v: number) => PAD + (1 - (v - min) / span) * (100 - 2 * PAD);
  const n = values.length;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const end = values[n - 1];

  return (
    <div>
      <div
        role="img"
        aria-label={`Kretanje stanja: od ${km(start)} do ${km(end)}; najviše ${km(max)}, najmanje ${km(min)}.`}
        className="relative"
        style={{ height }}
      >
        {[25, 50, 75].map((p) => (
          <span key={p} className="absolute inset-x-0 border-t border-dashed border-grid" style={{ top: `${p}%` }} />
        ))}
        <span className="absolute inset-x-0 bottom-0 border-t border-border" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
          <polygon points={`0,100 ${line} 100,100`} fill="var(--color-accent)" opacity="0.09" />
          <polyline
            points={line}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          className="absolute size-2.5 translate-x-[-50%] translate-y-[-50%] rounded-full border-2 border-surface bg-accent"
          style={{ left: "100%", top: `${y(end)}%` }}
        />
      </div>
      <div className="tnum mt-2 flex justify-between gap-3 text-[12px] leading-4 text-ink-2">
        <span>
          {points[0]?.label} · {km(start)}
        </span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
