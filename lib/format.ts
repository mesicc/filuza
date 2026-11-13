const MINUS = "−"; // pravi minus „−“, ne crtica

const nf2 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const nf02 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const nf01 = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** `1.259,50` bez valute i predznaka. */
export const num = (n: number) => nf2.format(Math.abs(round2(n)));

/** `1.259,50 KM`, negativno `−1.259,50 KM`. */
export function km(n: number): string {
  const v = round2(n);
  return `${v < 0 ? MINUS : ""}${nf2.format(Math.abs(v))} KM`;
}

/** Iznos transakcije s predznakom po tipu: `+800,00 KM` / `−60,00 KM`. */
export function skm(n: number, tip: "prihod" | "rashod"): string {
  return `${tip === "prihod" ? "+" : MINUS}${nf2.format(Math.abs(round2(n)))} KM`;
}

/** Neto vrijednost s predznakom: `+490,00 KM` / `−120,00 KM`. */
export function nkm(n: number): string {
  const v = round2(n);
  return `${v < 0 ? MINUS : "+"}${nf2.format(Math.abs(v))} KM`;
}

/** Kratko, bez `,00`: `350` ili `45,5`. Jedinica se dodaje na mjestu upotrebe (`350 / 500 KM`). */
export function kmS(n: number): string {
  const v = round2(n);
  const abs = Math.abs(v);
  const body = Number.isInteger(abs) ? nf02.format(abs) : nf2.format(abs);
  return `${v < 0 ? MINUS : ""}${body}`;
}

/** Oznake ose grafikona: `1,5k`, `2k`, `500`. */
export function kS(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? MINUS : "";
  if (abs >= 1000) return `${sign}${nf01.format(abs / 1000)}k`;
  return `${sign}${nf01.format(abs)}`;
}

/** `27,8%` – jedna decimala, zarez, bez `,0`. */
export function pctS(v: number): string {
  return `${v < 0 ? MINUS : ""}${nf01.format(Math.abs(v))}%`;
}

/**
 * Parsira korisnički unos iznosa. Uklanja razmake i „KM“; ako postoji zarez,
 * tačke su hiljadarke (`2.000,50` → 2000.5), inače je tačka decimalna.
 * Vraća `null` kad unos nije broj.
 */
export function parseAmount(input: string): number | null {
  let s = input.replace(/\s| /g, "").replace(/km/gi, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  if (!/^[+\-−]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s.replace(MINUS, "-"));
  return Number.isFinite(n) ? round2(n) : null;
}

/** Vokativ imena: ime na suglasnik dobija „e“ (`Kemal` → `Kemale`). */
export function vocative(name: string): string {
  const n = name.trim();
  if (!n) return n;
  return /[aeiou]$/i.test(n) ? n : `${n}e`;
}

const NICE = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/** „Lijepa“ gornja granica ose: najmanji od NICE × 10^n koji je ≥ max. */
export function niceMax(max: number): number {
  if (!(max > 0)) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  for (const m of NICE) {
    const v = m * pow;
    if (v >= max - 1e-9) return v;
  }
  return 10 * pow;
}

/** Linije mreže na 100/75/50/25/0 %. */
export const GRID_STEPS = [1, 0.75, 0.5, 0.25, 0] as const;
