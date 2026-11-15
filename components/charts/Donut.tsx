"use client";

import type { ReactNode } from "react";

export interface DonutSegment {
  key: string;
  color: string;
  /** Udio 0–100. */
  pct: number;
}

interface Props {
  segments: DonutSegment[];
  size?: number;
  /** `false` drži segmente na nuli da bi narasli pri ulasku. */
  on?: boolean;
  label: string;
  children?: ReactNode;
}

const R = 15.9155; // obim = 100, pa je procenat jednak dužini luka
const GAP = 0.8;

/** Donut: segmenti u bojama kategorija s malim razmakom, počinje od vrha. */
export function Donut({ segments, size = 196, on = true, label, children }: Props) {
  let acc = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label={label} className="block">
        <circle cx="21" cy="21" r={R} fill="none" stroke="var(--color-soft)" strokeWidth="6" />
        {segments.map((s) => {
          const start = acc;
          acc += s.pct;
          const len = Math.max(0, s.pct - (segments.length > 1 ? GAP : 0));
          return (
            <circle
              key={s.key}
              cx="21"
              cy="21"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="6"
              strokeDasharray={`${on ? len : 0} ${100 - (on ? len : 0)}`}
              strokeDashoffset={25 - start}
              style={{ transition: "stroke-dasharray .35s cubic-bezier(.3,.7,.3,1)" }}
            />
          );
        })}
      </svg>
      {children && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>{children}</div>
        </div>
      )}
    </div>
  );
}
