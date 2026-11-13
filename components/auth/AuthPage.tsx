"use client";

import {
  ArrowDownLeft,
  ArrowLeft,
  CheckCircle,
  EnvelopeSimple,
  EnvelopeSimpleOpen,
  Eye,
  EyeSlash,
  Key,
  LockSimple,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Coin, Logo } from "@/components/Logo";
import { Ring } from "@/components/charts/Ring";
import { Button } from "@/components/ui/Button";
import { Checkbox, TextField } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { cn } from "@/lib/cn";
import { skm } from "@/lib/format";
import { useFiluza } from "@/lib/store";
import {
  STRENGTH,
  emailError,
  hasErrors,
  passwordStrength,
  validateLogin,
  validateRegister,
  validateReset,
} from "@/lib/validation";
import type { Errors, LoginField, RegisterField, ResetField } from "@/lib/validation";

type AuthMode = "login" | "register" | "forgot" | "reset";

const HASH: Record<AuthMode, string> = {
  login: "prijava",
  register: "registracija",
  forgot: "forgot",
  reset: "reset",
};

function modeFromHash(hash: string): AuthMode {
  const h = hash.replace(/^#/, "").toLowerCase();
  if (h === "registracija" || h === "register") return "register";
  if (h === "zaboravljena" || h === "forgot") return "forgot";
  if (h === "reset") return "reset";
  return "login";
}

const SIDE: Record<AuthMode, { title: string; text: string }> = {
  login: {
    title: "Lijepo te ponovo vidjeti.",
    text: "Tvoji budžeti, ciljevi i transakcije te čekaju tačno tamo gdje si stao.",
  },
  register: {
    title: "Čuvaj svaku paru.",
    text: "Za minutu imaš jasan pregled prihoda, rashoda i štednje — sve u KM.",
  },
  forgot: { title: "Bez brige.", text: "Za par trenutaka ćeš ponovo imati pristup svom računu." },
  reset: { title: "Skoro gotovo.", text: "Postavi novu lozinku i vrati se svojim finansijama." },
};

const TABS = [
  { value: "login", label: "Prijava" },
  { value: "register", label: "Registracija" },
] as const;

const BUSY_MS = 700;
const LINK = "font-semibold text-primary underline-offset-4 transition-colors duration-150 hover:text-primary-hover hover:underline";

/** Pokreće `fn` nakon kratkog „busy“ stanja; bezbjedno i ako se forma u međuvremenu ukloni. */
function useBusy() {
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const run = useCallback((fn: () => void) => {
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      fn();
    }, BUSY_MS);
  }, []);
  return [busy, run] as const;
}

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [email, setEmail] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sync = () => setMode(modeFromHash(window.location.hash));
    sync();
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const go = useCallback((m: AuthMode) => {
    setMode(m);
    setFlash(null);
    window.history.replaceState(null, "", `#${HASH[m]}`);
  }, []);

  const showFlash = useCallback((text: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash(text);
    flashTimer.current = setTimeout(() => setFlash(null), 3500);
  }, []);

  const side = SIDE[mode ?? "login"];
  const tabbed = mode === "login" || mode === "register";

  return (
    <div className="min-h-dvh auth:grid auth:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
      {/* ───────── Lijevi ilustrativni panel ───────── */}
      <aside
        aria-hidden="true"
        className="sticky top-0 hidden h-dvh flex-col overflow-hidden bg-soft p-10 auth:flex"
      >
        <Link href="/" tabIndex={-1} className="self-start">
          <Logo size={42} textSize={30} shine />
        </Link>

        <div className="grid min-h-0 flex-1 place-items-center py-6">
          <div className="relative grid aspect-square w-[min(440px,100%,56dvh)] place-items-center">
            <span className="absolute inset-0 rounded-full border-2 border-dashed border-soft-2" />
            <span className="absolute inset-[14.8%] rounded-full bg-bg" />
            <Coin shine size={200} className="relative h-auto w-[45.5%] drop-shadow-[0_18px_24px_rgba(153,60,29,.28)]" />

            <div className="absolute top-[9%] right-[-3%] flex items-center gap-3 rounded-[18px] border border-border bg-surface py-3 pr-5 pl-3 shadow-popover animate-fz-float">
              <span className="grid size-10 place-items-center rounded-[12px] bg-income-soft text-income-strong">
                <ArrowDownLeft size={20} />
              </span>
              <span>
                <span className="block text-[13px] leading-[18px] text-ink-2">Plata</span>
                <span className="amount block text-[15.5px] leading-[22px] text-income-text">{skm(2000, "prihod")}</span>
              </span>
            </div>

            <div className="absolute bottom-[9%] left-[-3%] flex items-center gap-3 rounded-[18px] border border-border bg-surface py-3 pr-5 pl-3 shadow-popover animate-fz-float [animation-delay:-2.5s]">
              <Ring value={70} size={44} stroke={5} />
              <span>
                <span className="block text-[13px] leading-[18px] text-ink-2">Budžet za hranu</span>
                <span className="amount block text-[15.5px] leading-[22px] text-ink">350 / 500 KM</span>
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-[460px]">
          <p className="font-display text-[34px] leading-[1.08] font-bold tracking-[-0.022em] text-balance text-heading">
            {side.title}
          </p>
          <p className="mt-3 text-[16px] leading-[1.6] text-ink-2">{side.text}</p>
        </div>
      </aside>

      {/* ───────── Forma ───────── */}
      <main className="flex min-h-dvh flex-col px-5 py-5 auth:px-10 auth:py-8">
        <div className="mx-auto flex h-11 w-full max-w-[440px] items-center">
          <Link href="/" aria-label="Filuza – početna" className="-ml-1 rounded-control p-1 auth:hidden">
            <Logo size={34} textSize={24} />
          </Link>
          <Link
            href="/"
            className="-mr-3 ml-auto flex h-11 items-center gap-1.5 rounded-control px-3 text-[14.5px] font-semibold text-heading transition-colors duration-150 hover:bg-soft active:bg-soft-2/60"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Početna
          </Link>
        </div>

        <div className="flex flex-1 items-center py-8">
          <div className="mx-auto w-full max-w-[440px]">
            {mode && (
              <>
                {tabbed && (
                  <Segmented
                    tabs
                    block
                    size="lg"
                    idPrefix="auth"
                    label="Prijava ili registracija"
                    options={TABS}
                    value={mode}
                    onChange={go}
                    className="mb-8"
                  />
                )}
                <div
                  key={mode}
                  className="animate-fz-in"
                  {...(tabbed
                    ? { id: "auth-panel", role: "tabpanel", "aria-labelledby": `auth-tab-${mode}` }
                    : {})}
                >
                  {mode === "login" && <LoginForm email={email} setEmail={setEmail} go={go} />}
                  {mode === "register" && <RegisterForm email={email} setEmail={setEmail} go={go} />}
                  {mode === "forgot" && (
                    <ForgotForm email={email} setEmail={setEmail} go={go} showFlash={showFlash} />
                  )}
                  {mode === "reset" && (
                    <ResetForm
                      onDone={() => {
                        go("login");
                        showFlash("Lozinka je promijenjena. Prijavi se novom lozinkom.");
                      }}
                      go={go}
                    />
                  )}
                </div>
              </>
            )}
            <div role="status" aria-live="polite">
              {flash && (
                <p className="mt-5 flex items-start gap-2.5 rounded-control bg-income-soft px-3.5 py-3 text-[14px] leading-5 font-medium text-income-strong animate-fz-pop">
                  <CheckCircle size={20} aria-hidden="true" className="shrink-0" />
                  {flash}
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="mx-auto flex w-full max-w-[440px] items-center justify-center gap-1.5 text-[12px] leading-4 text-ink-2">
          <ShieldCheck size={16} aria-hidden="true" className="shrink-0 text-income-text" />
          Tvoji podaci su zaštićeni šifrovanom vezom.
        </p>
      </main>
    </div>
  );
}

/* ───────────────────────── Zajednički dijelovi ───────────────────────── */

function Heading({ title, text, icon }: { title: string; text?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-7">
      {icon}
      <h1 className="font-display text-[30px] leading-[1.1] font-bold tracking-[-0.022em] text-heading sm:text-[32px]">
        {title}
      </h1>
      {text && <p className="mt-2.5 text-[15.5px] leading-[1.55] text-ink-2">{text}</p>}
    </div>
  );
}

function EyeToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={shown ? "Sakrij lozinku" : "Prikaži lozinku"}
      aria-pressed={shown}
      onClick={onToggle}
      className="grid size-10 place-items-center rounded-[10px] text-ink-2 transition-colors duration-150 hover:bg-soft hover:text-heading active:bg-soft-2/60"
    >
      {shown ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
    </button>
  );
}

function TextLink({ onClick, children, className }: { onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn(LINK, "rounded-[4px]", className)}>
      {children}
    </button>
  );
}

interface FormProps {
  email: string;
  setEmail: (v: string) => void;
  go: (m: AuthMode) => void;
}

const MAIL_ICON = <EnvelopeSimple size={18} aria-hidden="true" />;
const LOCK_ICON = <LockSimple size={18} aria-hidden="true" />;

/** Briše grešku polja čim korisnik promijeni to polje. */
function useErrors<K extends string>() {
  const [errors, setErrors] = useState<Errors<K>>({});
  const clear = useCallback((k: K) => {
    setErrors((e) => {
      if (!(k in e)) return e;
      const next = { ...e };
      delete next[k];
      return next;
    });
  }, []);
  return [errors, setErrors, clear] as const;
}

/* ───────────────────────── Prijava ───────────────────────── */

function LoginForm({ email, setEmail, go }: FormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors, clear] = useErrors<LoginField>();
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, run] = useBusy();

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validateLogin({ email, password });
    setErrors(errs);
    setBanner(null);
    if (hasErrors(errs)) return;
    run(() => {
      if (password.length < 6) setBanner("Email ili lozinka nisu tačni. Pokušaj ponovo.");
      else router.push("/app");
    });
  }

  return (
    <form noValidate onSubmit={submit}>
      <Heading title="Lijepo te ponovo vidjeti." text="Prijavi se i nastavi pratiti svoj novac." />

      {banner && (
        <p
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-control border border-expense/40 bg-expense-soft px-3.5 py-3 text-[14px] leading-5 font-medium text-expense-strong animate-fz-in"
        >
          <WarningCircle size={20} aria-hidden="true" className="shrink-0" />
          {banner}
        </p>
      )}

      <div className="grid gap-[18px]">
        <TextField
          label="Email adresa"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ime@primjer.ba"
          autoFocus
          fieldSize="lg"
          icon={MAIL_ICON}
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clear("email");
          }}
        />
        <TextField
          label="Lozinka"
          type={show ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          fieldSize="lg"
          icon={LOCK_ICON}
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
          labelRight={
            <TextLink onClick={() => go("forgot")} className="text-[13.5px]">
              Zaboravio si lozinku?
            </TextLink>
          }
          trailing={<EyeToggle shown={show} onToggle={() => setShow((s) => !s)} />}
        />
        <Checkbox name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)}>
          Zapamti me
        </Checkbox>
      </div>

      <Button type="submit" size="lg" block busy={busy} busyText="Prijavljujem…" className="mt-6">
        Prijavi se
      </Button>

      <p className="mt-6 text-center text-[14.5px] text-ink-2">
        Još nemaš račun? <TextLink onClick={() => go("register")}>Registruj se.</TextLink>
      </p>
    </form>
  );
}

/* ───────────────────────── Registracija ───────────────────────── */

function StrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password);
  const level = score > 0 ? STRENGTH[score - 1] : null;
  return (
    <div className="mt-2.5 flex h-[18px] items-center gap-3">
      <div aria-hidden="true" className="flex flex-1 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-200"
            style={{ background: level && i <= score ? level.color : "#F4E4DD" }}
          />
        ))}
      </div>
      <span aria-live="polite" className="min-w-[66px] text-right text-[12.5px] leading-[18px] font-semibold text-ink-2">
        {level && (
          <>
            <span className="sr-only">Jačina lozinke: </span>
            {level.label}
          </>
        )}
      </span>
    </div>
  );
}

function RegisterForm({ email, setEmail, go }: FormProps) {
  const router = useRouter();
  const setProfile = useFiluza((s) => s.setProfile);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [show, setShow] = useState(false);
  const [errors, setErrors, clear] = useErrors<RegisterField>();
  const [busy, run] = useBusy();

  const matches = confirm.length > 0 && confirm === password;

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validateRegister({ firstName, lastName, email, password, confirm, terms });
    setErrors(errs);
    if (hasErrors(errs)) return;
    run(() => {
      setProfile({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      router.push("/app");
    });
  }

  return (
    <form noValidate onSubmit={submit}>
      <Heading title="Dobro došao u Filuzu." text="Počni pratiti svoj novac i čuvati svaku paru." />

      <div className="grid gap-[18px]">
        <div className="grid gap-[18px] min-[30rem]:grid-cols-2 min-[30rem]:gap-3.5">
          <TextField
            label="Ime"
            name="given-name"
            autoComplete="given-name"
            autoFocus
            fieldSize="lg"
            value={firstName}
            error={errors.firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clear("firstName");
            }}
          />
          <TextField
            label="Prezime"
            name="family-name"
            autoComplete="family-name"
            fieldSize="lg"
            value={lastName}
            error={errors.lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clear("lastName");
            }}
          />
        </div>
        <TextField
          label="Email adresa"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ime@primjer.ba"
          fieldSize="lg"
          icon={MAIL_ICON}
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clear("email");
          }}
        />
        <TextField
          label="Lozinka"
          type={show ? "text" : "password"}
          name="new-password"
          autoComplete="new-password"
          placeholder="Najmanje 8 znakova"
          fieldSize="lg"
          icon={LOCK_ICON}
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
          trailing={<EyeToggle shown={show} onToggle={() => setShow((s) => !s)} />}
          below={<StrengthMeter password={password} />}
        />
        <TextField
          label="Potvrda lozinke"
          type={show ? "text" : "password"}
          name="confirm-password"
          autoComplete="new-password"
          fieldSize="lg"
          icon={
            matches ? (
              <CheckCircle size={18} aria-hidden="true" className="text-income" />
            ) : (
              LOCK_ICON
            )
          }
          value={confirm}
          error={errors.confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            clear("confirm");
          }}
        />
        <Checkbox
          name="terms"
          checked={terms}
          error={errors.terms}
          onChange={(e) => {
            setTerms(e.target.checked);
            clear("terms");
          }}
        >
          Prihvatam{" "}
          <a href="/uslovi" target="_blank" rel="noopener" className={LINK}>
            uslove korištenja
          </a>{" "}
          i{" "}
          <a href="/privatnost" target="_blank" rel="noopener" className={LINK}>
            politiku privatnosti
          </a>
          .
        </Checkbox>
      </div>

      <Button type="submit" size="lg" block busy={busy} busyText="Kreiram račun…" className="mt-6">
        Kreiraj besplatan račun
      </Button>

      <p className="mt-6 text-center text-[14.5px] text-ink-2">
        Već imaš račun? <TextLink onClick={() => go("login")}>Prijavi se.</TextLink>
      </p>
    </form>
  );
}

/* ───────────────────────── Zaboravljena lozinka ───────────────────────── */

function BackToLogin({ go }: { go: (m: AuthMode) => void }) {
  return (
    <button
      type="button"
      onClick={() => go("login")}
      className="mx-auto mt-4 flex h-11 items-center gap-1.5 rounded-control px-3 text-[14.5px] font-semibold text-heading transition-colors duration-150 hover:bg-soft active:bg-soft-2/60"
    >
      <ArrowLeft size={18} aria-hidden="true" />
      Nazad na prijavu
    </button>
  );
}

function ForgotForm({ email, setEmail, go, showFlash }: FormProps & { showFlash: (t: string) => void }) {
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [busy, run] = useBusy();

  function submit(e: FormEvent) {
    e.preventDefault();
    const err = emailError(email);
    setError(err);
    if (err) return;
    run(() => setSent(true));
  }

  if (sent) {
    return (
      <div role="status" className="animate-fz-in">
        <Heading
          icon={
            <span className="mb-5 grid size-14 place-items-center rounded-[16px] bg-income-soft text-income-strong">
              <EnvelopeSimpleOpen size={28} aria-hidden="true" />
            </span>
          }
          title="Provjeri svoj email"
          text={
            <>
              Ako postoji račun za <strong className="font-semibold break-all text-ink">{email.trim()}</strong>, poslali
              smo link za resetovanje lozinke. Link važi 30 minuta.
            </>
          }
        />
        <Button size="lg" block onClick={() => go("reset")}>
          Otvori link iz emaila
        </Button>
        <p className="mt-6 text-center text-[14.5px] text-ink-2">
          Nisi dobio email? <TextLink onClick={() => showFlash("Link je ponovo poslan.")}>Pošalji ponovo</TextLink>
        </p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit}>
      <Heading
        icon={
          <span className="mb-5 grid size-[52px] place-items-center rounded-[14px] bg-soft text-accent">
            <Key size={24} aria-hidden="true" />
          </span>
        }
        title="Zaboravljena lozinka"
        text="Upiši email adresu i poslat ćemo ti link za resetovanje lozinke."
      />
      <TextField
        label="Email adresa"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="ime@primjer.ba"
        autoFocus
        fieldSize="lg"
        icon={MAIL_ICON}
        value={email}
        error={error}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(undefined);
        }}
      />
      <Button type="submit" size="lg" block busy={busy} className="mt-6">
        Pošalji link
      </Button>
      <BackToLogin go={go} />
    </form>
  );
}

/* ───────────────────────── Nova lozinka ───────────────────────── */

function ResetForm({ onDone, go }: { onDone: () => void; go: (m: AuthMode) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors, clear] = useErrors<ResetField>();
  const [busy, run] = useBusy();

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validateReset({ password, confirm });
    setErrors(errs);
    if (hasErrors(errs)) return;
    run(onDone);
  }

  return (
    <form noValidate onSubmit={submit}>
      <Heading title="Postavi novu lozinku" text="Izaberi lozinku koju nisi koristio ranije." />
      <div className="grid gap-[18px]">
        <TextField
          label="Nova lozinka"
          type={show ? "text" : "password"}
          name="new-password"
          autoComplete="new-password"
          placeholder="Najmanje 8 znakova"
          autoFocus
          fieldSize="lg"
          icon={LOCK_ICON}
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
          trailing={<EyeToggle shown={show} onToggle={() => setShow((s) => !s)} />}
        />
        <TextField
          label="Potvrdi novu lozinku"
          type={show ? "text" : "password"}
          name="confirm-password"
          autoComplete="new-password"
          fieldSize="lg"
          icon={LOCK_ICON}
          value={confirm}
          error={errors.confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            clear("confirm");
          }}
        />
      </div>
      <Button type="submit" size="lg" block busy={busy} className="mt-6">
        Sačuvaj novu lozinku
      </Button>
      <BackToLogin go={go} />
    </form>
  );
}
