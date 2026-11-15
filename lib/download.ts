/** Preuzimanje tekstualne datoteke iz preglednika. */
export function downloadText(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const nf = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Iznos za CSV: `-90,00` (ASCII minus, da ga tablični programi čitaju kao broj). */
export const csvAmount = (n: number) => `${n < 0 ? "-" : ""}${nf.format(Math.abs(n))}`;

/** Polje CSV-a sa separatorom `;` – navodnici samo kad su potrebni. */
export function csvField(value: string): string {
  return /[;"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export const csvLine = (...fields: string[]) => fields.map(csvField).join(";");

const FLASH_KEY = "filuza-flash";

/** Toast koji se prikaže nakon prelaska na drugu stranicu (npr. nakon odjave). */
export function flashToast(text: string): void {
  try {
    sessionStorage.setItem(FLASH_KEY, text);
  } catch {
    /* privatni način rada – toast se preskače */
  }
}

export function takeFlash(): string | null {
  try {
    const text = sessionStorage.getItem(FLASH_KEY);
    if (text) sessionStorage.removeItem(FLASH_KEY);
    return text;
  } catch {
    return null;
  }
}
