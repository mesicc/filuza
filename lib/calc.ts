import { MIN_DATE, MONTHS, OPENING, TODAY, addDays, addMonths, daysInMonth, fmtDate, fmtDateLong, parts } from "./dates";
import { round2 } from "./format";
import { UNKNOWN_CAT } from "./types";
import type { Budget, Category, DateFormat, Goal, PMode, Transaction, TxPeriod } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Numerički dio ID-a (`t42` → 42). */
export const idNum = (id: string) => Number(id.replace(/\D/g, "")) || 0;

/** Najnovije prvo: datum silazno, pa numerički dio ID-a silazno. */
export function byNewest(a: Transaction, b: Transaction): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return idNum(b.id) - idNum(a.id);
}

export function catOf(cats: Category[], id: string): Category {
  return cats.find((c) => c.id === id) ?? UNKNOWN_CAT;
}

export interface Totals {
  inc: number;
  exp: number;
  net: number;
  n: number;
}

export function totals(txs: Transaction[]): Totals {
  let inc = 0;
  let exp = 0;
  for (const t of txs) {
    if (t.type === "prihod") inc += t.amount;
    else exp += t.amount;
  }
  return { inc: round2(inc), exp: round2(exp), net: round2(inc - exp), n: txs.length };
}

export const inRange = (txs: Transaction[], start: string, end: string) =>
  txs.filter((t) => t.date >= start && t.date <= end);

/** Stanje računa na dati datum: početno stanje + prihodi − rashodi. */
export function balanceAt(txs: Transaction[], date: string = TODAY): number {
  const t = totals(txs.filter((x) => x.date <= date));
  return round2(OPENING + t.net);
}

/* ───────── Periodi ───────── */

export interface Period {
  start: string;
  end: string;
}

export function periodOf(mode: PMode, anchor: string): Period {
  const { y, m } = parts(anchor);
  if (mode === "day") return { start: anchor, end: anchor };
  if (mode === "month") return { start: `${y}-${pad(m)}-01`, end: `${y}-${pad(m)}-${pad(daysInMonth(y, m))}` };
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

export function periodLabel(mode: PMode, anchor: string, format: DateFormat): string {
  const { y, m } = parts(anchor);
  if (mode === "day") return fmtDateLong(anchor, format);
  if (mode === "month") return `${MONTHS[m - 1]} ${y}`;
  return String(y);
}

/** Sidro susjednog perioda; u periodu koji sadrži TODAY sidro je TODAY. */
export function shiftAnchor(mode: PMode, anchor: string, dir: 1 | -1): string {
  let next: string;
  if (mode === "day") next = addDays(anchor, dir);
  else if (mode === "month") next = addMonths(`${anchor.slice(0, 7)}-01`, dir);
  else next = `${parts(anchor).y + dir}-01-01`;
  return anchorIn(mode, next);
}

/** Sidro za period koji sadrži `date`: zadnji dan perioda, ali ne poslije TODAY. */
export function anchorIn(mode: PMode, date: string): string {
  const p = periodOf(mode, date);
  if (mode === "day") return date;
  return p.end > TODAY ? (p.start > TODAY ? p.start : TODAY) : p.end;
}

export const canPrev = (mode: PMode, anchor: string) => periodOf(mode, shiftAnchor(mode, anchor, -1)).end >= MIN_DATE;
export const canNext = (mode: PMode, anchor: string) => periodOf(mode, shiftAnchor(mode, anchor, 1)).start <= TODAY;
export const hasToday = (p: Period) => p.start <= TODAY && TODAY <= p.end;

/** Procenat promjene u odnosu na prethodni period; `null` kad je prethodna vrijednost ≈ 0. */
export function pctChange(cur: number, prev: number): number | null {
  if (Math.abs(prev) < 0.005) return null;
  return Math.round(((cur - prev) / Math.abs(prev)) * 100);
}

export function signedPct(v: number | null): string {
  if (v === null) return "—";
  return `${v < 0 ? "−" : "+"}${Math.abs(v)}%`;
}

export function txPeriodRange(p: TxPeriod): Period | null {
  const { y, m } = parts(TODAY);
  switch (p) {
    case "danas":
      return { start: TODAY, end: TODAY };
    case "mjesec":
      return periodOf("month", TODAY);
    case "prosli-mjesec":
      return periodOf("month", addMonths(`${y}-${pad(m)}-01`, -1));
    case "godina":
      return periodOf("year", TODAY);
    case "prosla-godina":
      return periodOf("year", `${y - 1}-01-01`);
    default:
      return null;
  }
}

/* ───────── Budžeti ───────── */

/** Budžeti koji važe za mjesec `YYYY-MM`. */
export function budgetsFor(budgets: Budget[], month: string): Budget[] {
  return budgets.filter((b) => (b.recurring ? b.month <= month : b.month === month));
}

/** Zbir rashoda po kategoriji u mjesecu `YYYY-MM`. */
export function spentByCat(txs: Transaction[], month: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== "rashod" || !t.date.startsWith(month)) continue;
    map.set(t.cat, round2((map.get(t.cat) ?? 0) + t.amount));
  }
  return map;
}

export const usedPct = (spent: number, limit: number) => (limit > 0 ? Math.round((spent / limit) * 100) : 0);

/* ───────── Ciljevi ───────── */

export const goalSaved = (g: Goal) => round2(g.history.reduce((s, e) => s + e.amount, 0));
export const goalDone = (g: Goal) => g.done || goalSaved(g) >= g.target;

/** Broj mjeseci od `from` do `to` (najmanje 1). */
export function monthsUntil(from: string, to: string): number {
  const a = parts(from);
  const b = parts(to);
  return Math.max(1, (b.y - a.y) * 12 + (b.m - a.m));
}

/* ───────── Jezik ───────── */

/** Množina: 1 transakcija, 2–4 transakcije, 5+ transakcija. */
export function plural(n: number, one: string, few: string, many: string): string {
  const d = Math.abs(n) % 10;
  const h = Math.abs(n) % 100;
  if (d === 1 && h !== 11) return one;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few;
  return many;
}

export const txCount = (n: number) => `${n} ${plural(n, "transakcija", "transakcije", "transakcija")}`;

export { fmtDate };
