"use client";

/**
 * Prati zadnji element na koji je korisnik kliknuo ili dodirnuo.
 * Safari (macOS i iOS) ne fokusira dugme na klik, pa `document.activeElement`
 * u trenutku otvaranja dijaloga nije dugme koje ga je otvorilo.
 */
let lastTrigger: HTMLElement | null = null;
let installed = false;

const INTERACTIVE = 'button, a[href], [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function installInputModality(): void {
  if (installed || typeof document === "undefined") return;
  installed = true;
  document.addEventListener(
    "pointerdown",
    (e) => {
      lastTrigger = (e.target as Element | null)?.closest?.<HTMLElement>(INTERACTIVE) ?? null;
    },
    true,
  );
}

/** Element koji je otvorio dijalog: fokusirani element, a u Safariju zadnje kliknuto dugme. */
export function opener(): HTMLElement | null {
  const active = document.activeElement as HTMLElement | null;
  if (active && active !== document.body) return active;
  return lastTrigger;
}

/** Vraća fokus na element koji je otvorio dijalog, ako je još na stranici. */
export function restoreFocus(el: HTMLElement | null): void {
  if (el?.isConnected) el.focus({ preventScroll: true });
}
