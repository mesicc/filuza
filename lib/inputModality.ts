"use client";

/**
 * Prati način unosa (miš/dodir ili tastatura) i zadnji element na koji je korisnik kliknuo.
 * Način unosa se upisuje u `<html data-input="pointer|keyboard">`; CSS po njemu prikazuje
 * okvir fokusa samo korisnicima tastature (Safari ga inače crta i nakon klika ili dodira).
 * Safari (macOS i iOS) ne fokusira dugme na klik, pa `document.activeElement`
 * u trenutku otvaranja dijaloga nije dugme koje ga je otvorilo.
 */
let lastTrigger: HTMLElement | null = null;
let installed = false;

const NAV_KEYS = new Set(["Tab", "Enter", " ", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"]);

const INTERACTIVE = 'button, a[href], [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function installInputModality(): void {
  if (installed || typeof document === "undefined") return;
  installed = true;
  const root = document.documentElement;
  root.dataset.input = "pointer";
  document.addEventListener(
    "keydown",
    (e) => {
      if (NAV_KEYS.has(e.key) && !e.metaKey && !e.ctrlKey) root.dataset.input = "keyboard";
    },
    true,
  );
  document.addEventListener(
    "pointerdown",
    (e) => {
      root.dataset.input = "pointer";
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
