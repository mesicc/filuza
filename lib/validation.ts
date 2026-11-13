export type Errors<K extends string> = Partial<Record<K, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailError(email: string): string | undefined {
  const v = email.trim();
  if (!v) return "Upiši email adresu.";
  if (!EMAIL_RE.test(v)) return "Email adresa nije ispravna.";
  return undefined;
}

export type LoginField = "email" | "password";

export function validateLogin(v: { email: string; password: string }): Errors<LoginField> {
  const e: Errors<LoginField> = {};
  const em = emailError(v.email);
  if (em) e.email = em;
  if (!v.password) e.password = "Upiši lozinku.";
  return e;
}

export type RegisterField = "firstName" | "lastName" | "email" | "password" | "confirm" | "terms";

export function validateRegister(v: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
}): Errors<RegisterField> {
  const e: Errors<RegisterField> = {};
  if (!v.firstName.trim()) e.firstName = "Upiši ime.";
  if (!v.lastName.trim()) e.lastName = "Upiši prezime.";
  const em = emailError(v.email);
  if (em) e.email = em;
  if (v.password.length < 8) e.password = "Lozinka mora imati barem 8 znakova.";
  if (!v.confirm) e.confirm = "Potvrdi lozinku.";
  else if (v.confirm !== v.password) e.confirm = "Lozinke se ne podudaraju.";
  if (!v.terms) e.terms = "Potrebno je prihvatiti uslove korištenja.";
  return e;
}

export type ResetField = "password" | "confirm";

export function validateReset(v: { password: string; confirm: string }): Errors<ResetField> {
  const e: Errors<ResetField> = {};
  if (v.password.length < 8) e.password = "Lozinka mora imati barem 8 znakova.";
  if (v.confirm !== v.password) e.confirm = "Lozinke se ne podudaraju.";
  return e;
}

export const STRENGTH = [
  { label: "Slaba", color: "#C96B62" },
  { label: "Osrednja", color: "#E6AA4E" },
  { label: "Dobra", color: "#6FB592" },
  { label: "Odlična", color: "#4F9D77" },
] as const;

/** Jačina lozinke 1–4 (0 za prazan unos). */
export function passwordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[a-zčćžšđ]/.test(pw) && /[A-ZČĆŽŠĐ]/.test(pw)) s += 1;
  const digit = /\d/.test(pw);
  const special = /[^A-Za-z0-9čćžšđČĆŽŠĐ\s]/.test(pw);
  if (digit && special) s += 1;
  else if (digit) s += 0.5;
  return Math.min(4, Math.max(1, Math.round(s))) as 1 | 2 | 3 | 4;
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;
