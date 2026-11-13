/** Demo konstante – kasnije se mogu zamijeniti stvarnim datumom / podacima s API-ja. */
export const TODAY = "2026-11-06";
export const MIN_DATE = "2025-01-01";
export const OPENING = 850;

export const MONTHS = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "August",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
] as const;

export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Maj",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
] as const;

export const DAYS = [
  "Nedjelja",
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
] as const;

export const DAYS_SHORT = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"] as const;

/** ISO datum `YYYY-MM-DD`. */
export type ISODate = string;

const pad = (n: number) => String(n).padStart(2, "0");

export function parts(iso: ISODate): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

/** Lokalni Date u podne – izbjegava pomjeranje dana zbog vremenskih zona i ljetnog računanja. */
export function toDate(iso: ISODate): Date {
  const { y, m, d } = parts(iso);
  return new Date(y, m - 1, d, 12);
}

export function toISO(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `06.11.2026.` */
export function fmtDate(iso: ISODate): string {
  const { y, m, d } = parts(iso);
  return `${pad(d)}.${pad(m)}.${y}.`;
}

/** `Petak, 06.11.2026.` */
export function fmtDateLong(iso: ISODate): string {
  return `${DAYS[toDate(iso).getDay()]}, ${fmtDate(iso)}`;
}

/** `Novembar 2026` */
export function fmtMonth(iso: ISODate): string {
  const { y, m } = parts(iso);
  return `${MONTHS[m - 1]} ${y}`;
}

export function addDays(iso: ISODate, n: number): ISODate {
  const d = toDate(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function addMonths(iso: ISODate, n: number): ISODate {
  const { y, m, d } = parts(iso);
  const first = new Date(y, m - 1 + n, 1, 12);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  first.setDate(Math.min(d, last));
  return toISO(first);
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/** `2026-11` */
export function monthKey(iso: ISODate): string {
  return iso.slice(0, 7);
}

export function clampDate(iso: ISODate, min: ISODate = MIN_DATE, max: ISODate = TODAY): ISODate {
  return iso < min ? min : iso > max ? max : iso;
}
