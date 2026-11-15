import { DAYS_SHORT, MONTHS, MONTHS_SHORT, TODAY, addDays, daysInMonth, parts, toDate } from "./dates";
import { round2 } from "./format";
import type { Transaction } from "./types";

/** Jedan stupac grafikona (dan ili mjesec). */
export interface ChartColumn {
  key: string;
  /** Oznaka ispod stupca. */
  label: string;
  /** Sakrij oznaku (npr. prikazuje se svaka peta). */
  hideLabel?: boolean;
  /** Naslov tooltipa i aria-label (npr. „Petak, 06.11.2026.“). */
  title: string;
  /** Prvi i zadnji datum koji stupac pokriva. */
  start: string;
  end: string;
  inc: number;
  exp: number;
  /** Budući dan/mjesec – blijedi stupci. */
  future?: boolean;
  /** Istaknut stupac (današnji / odabrani). */
  mark?: boolean;
}

export type ColumnSpec =
  | { kind: "day" | "month" | "year"; anchor: string }
  | { kind: "custom"; start: string; end: string };

const pad = (n: number) => String(n).padStart(2, "0");

export function daysBetween(start: string, end: string): number {
  return Math.round((toDate(end).getTime() - toDate(start).getTime()) / 86400000) + 1;
}

type Draft = Omit<ChartColumn, "inc" | "exp">;

function dayColumn(date: string, label: string, long: (iso: string) => string): Draft {
  return { key: date, label, title: long(date), start: date, end: date, future: date > TODAY };
}

function monthColumn(y: number, m: number, label: string): Draft {
  const key = `${y}-${pad(m)}`;
  return {
    key,
    label,
    title: `${MONTHS[m - 1]} ${y}`,
    start: `${key}-01`,
    end: `${key}-${pad(daysInMonth(y, m))}`,
    future: key > TODAY.slice(0, 7),
  };
}

/**
 * Stupci za grafikon prihoda i rashoda:
 * dan = zadnjih 7 dana, mjesec = svaki dan, godina = 12 mjeseci,
 * prilagođeno = po danu (≤ 62 dana) ili po mjesecu.
 */
export function buildColumns(txs: Transaction[], spec: ColumnSpec, long: (iso: string) => string): ChartColumn[] {
  let drafts: Draft[];
  let clip: { start: string; end: string } | null = null;

  if (spec.kind === "day") {
    drafts = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(spec.anchor, i - 6);
      return {
        ...dayColumn(date, `${DAYS_SHORT[toDate(date).getDay()]} ${parts(date).d}`, long),
        mark: date === spec.anchor,
      };
    });
  } else if (spec.kind === "month") {
    const { y, m } = parts(spec.anchor);
    const n = daysInMonth(y, m);
    drafts = Array.from({ length: n }, (_, i) => {
      const day = i + 1;
      const date = `${y}-${pad(m)}-${pad(day)}`;
      return {
        ...dayColumn(date, String(day), long),
        hideLabel: n > 16 && !(day === 1 || day % 5 === 0),
        mark: date === TODAY,
      };
    });
  } else if (spec.kind === "year") {
    const { y } = parts(spec.anchor);
    drafts = MONTHS_SHORT.map((short, i) => {
      const col = monthColumn(y, i + 1, short);
      return { ...col, mark: col.key === TODAY.slice(0, 7) };
    });
  } else {
    const r = spec as Extract<ColumnSpec, { kind: "custom" }>;
    clip = { start: r.start, end: r.end };
    const n = daysBetween(r.start, r.end);
    if (n <= 62) {
      const step = Math.max(1, Math.ceil(n / 8));
      drafts = Array.from({ length: n }, (_, i) => {
        const date = addDays(r.start, i);
        const { d, m } = parts(date);
        return { ...dayColumn(date, `${d}.${m}.`, long), hideLabel: n > 16 && i % step !== 0 };
      });
    } else {
      drafts = [];
      let { y, m } = parts(r.start);
      const last = r.end.slice(0, 7);
      while (`${y}-${pad(m)}` <= last) {
        const first = drafts.length === 0;
        const col = monthColumn(y, m, `${MONTHS_SHORT[m - 1]}${first || m === 1 ? ` ${String(y).slice(2)}` : ""}`);
        drafts.push({
          ...col,
          start: col.start < r.start ? r.start : col.start,
          end: col.end > r.end ? r.end : col.end,
        });
        m += 1;
        if (m > 12) {
          m = 1;
          y += 1;
        }
      }
    }
  }

  const cols: ChartColumn[] = drafts.map((d) => ({ ...d, inc: 0, exp: 0 }));
  const from = clip?.start ?? cols[0].start;
  const to = clip?.end ?? cols[cols.length - 1].end;
  for (const t of txs) {
    if (t.date < from || t.date > to) continue;
    const col = cols.find((c) => t.date >= c.start && t.date <= c.end);
    if (!col) continue;
    if (t.type === "prihod") col.inc += t.amount;
    else col.exp += t.amount;
  }
  for (const col of cols) {
    col.inc = round2(col.inc);
    col.exp = round2(col.exp);
  }
  return cols;
}
