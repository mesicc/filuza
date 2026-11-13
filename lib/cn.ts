export type ClassValue = string | false | null | undefined;

/** Spaja klase, preskače prazne vrijednosti. */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}
