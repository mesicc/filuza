"use client";

import {
  Check,
  DownloadSimple,
  Trash,
  UploadSimple,
} from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Select, TextField } from "@/components/ui/Field";
import { StrengthMeter } from "@/components/ui/StrengthMeter";
import { useToast } from "@/components/ui/Toast";
import { avatarFileError, avatarFromFile } from "@/lib/avatarImage";
import { Card, Chip } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { downloadText, flashToast } from "@/lib/download";
import { km, num, parseAmount, round2 } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { signOut, useFiluza } from "@/lib/store";
import type { DateFormat, Prefs } from "@/lib/types";
import { emailError } from "@/lib/validation";
import { ScreenHeader } from "../ScreenHeader";
import { Avatar, CardHead } from "../common";
import { AmountField, focusFirstInvalid } from "../modals/parts";

const DAYS_PER_MONTH = 30.44;

function Section({
  title,
  sub,
  icon,
  children,
}: {
  title: string;
  sub?: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start gap-3.5">
        {icon && (
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-soft text-accent"
          >
            <Icon name={icon} size={20} />
          </span>
        )}
        <CardHead title={title} sub={sub} className="flex-1" />
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

const Actions = ({ children }: { children: ReactNode }) => (
  <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
    {children}
  </div>
);

export function Postavke() {
  return (
    <>
      <ScreenHeader
        title="Postavke"
        sub="Upravljaj svojim računom, preferencijama i sigurnošću."
      />
      <div className="grid max-w-[920px] gap-5">
        <ProfileForm />
        <PrefsForm />
        <PlanForm />
        <SecurityForm />
        <Appearance />
        <Account />
      </div>
    </>
  );
}

/* ───────────────────────── 1. Lični podaci ───────────────────────── */

function PhotoPicker() {
  const slika = useFiluza((s) => s.profile.slika);
  const setProfile = useFiluza((s) => s.setProfile);
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = avatarFileError(file);
    setError(err ?? "");
    if (err) return;
    setBusy(true);
    try {
      setProfile({ slika: await avatarFromFile(file) });
      toast("Profilna slika je promijenjena.");
    } catch {
      setError("Sliku nije moguće učitati. Pokušaj s drugom.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size={72} />
        <div className="min-w-0">
          <p className="text-[14.5px] leading-5 font-semibold text-ink">
            Profilna slika
          </p>
          <p
            id={hintId}
            className="mt-0.5 text-[13px] leading-[18px] text-ink-2"
          >
            JPG ili PNG, najviše 2 MB.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2.5 sm:ml-auto sm:w-auto">
          {slika && (
            <Button
              variant="ghost"
              onClick={() => {
                setProfile({ slika: undefined });
                setError("");
                toast("Profilna slika je uklonjena.");
              }}
            >
              <Trash size={18} aria-hidden="true" />
              Ukloni
            </Button>
          )}
          <Button
            variant="secondary"
            busy={busy}
            busyText="Učitavam…"
            aria-describedby={hintId}
            onClick={() => input.current?.click()}
          >
            <UploadSimple size={18} aria-hidden="true" />
            Promijeni sliku
          </Button>
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={pick}
        />
      </div>
      {error && (
        <p
          role="alert"
          className="mt-2.5 text-[13.5px] leading-5 font-medium text-expense-text"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function ProfileForm() {
  const profile = useFiluza((s) => s.profile);
  const setProfile = useFiluza((s) => s.setProfile);
  const toast = useToast();
  const formId = useId();
  const [ime, setIme] = useState(profile.ime);
  const [prezime, setPrezime] = useState(profile.prezime);
  const [email, setEmail] = useState(profile.email);
  const [errors, setErrors] = useState<{
    ime?: string;
    prezime?: string;
    email?: string;
  }>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!ime.trim()) errs.ime = "Upiši ime.";
    if (!prezime.trim()) errs.prezime = "Upiši prezime.";
    if (emailError(email)) errs.email = "Upiši ispravnu email adresu.";
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstInvalid(formId);
    setProfile({
      ime: ime.trim(),
      prezime: prezime.trim(),
      email: email.trim(),
    });
    toast("Lični podaci su sačuvani.");
  }

  return (
    <Section
      title="Lični podaci"
      sub="Ovi podaci se prikazuju na tvom profilu."
    >
      <form id={formId} noValidate onSubmit={submit}>
        <PhotoPicker />
        <div className="mt-6 grid gap-[18px] sm:grid-cols-2 sm:gap-x-3.5">
          <TextField
            label="Ime"
            autoComplete="given-name"
            value={ime}
            error={errors.ime}
            onChange={(e) => {
              setIme(e.target.value);
              setErrors((x) => ({ ...x, ime: undefined }));
            }}
          />
          <TextField
            label="Prezime"
            autoComplete="family-name"
            value={prezime}
            error={errors.prezime}
            onChange={(e) => {
              setPrezime(e.target.value);
              setErrors((x) => ({ ...x, prezime: undefined }));
            }}
          />
          <TextField
            wrapClassName="sm:col-span-2"
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            error={errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((x) => ({ ...x, email: undefined }));
            }}
          />
        </div>
        <Actions>
          <Button type="submit">Sačuvaj promjene</Button>
        </Actions>
      </form>
    </Section>
  );
}

/* ───────────────────────── 2. Preferencije ───────────────────────── */

function PrefsForm() {
  const prefs = useFiluza((s) => s.prefs);
  const setPrefs = useFiluza((s) => s.setPrefs);
  const toast = useToast();
  const [draft, setDraft] = useState<Prefs>(prefs);

  return (
    <Section title="Preferencije">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPrefs(draft);
          toast("Preferencije su sačuvane.");
        }}
      >
        <div className="grid gap-[18px] sm:grid-cols-2 sm:gap-x-3.5">
          <Select
            label="Valuta"
            value={draft.valuta}
            onChange={() => undefined}
          >
            <option value="KM">Konvertibilna marka (KM)</option>
          </Select>
          <Select label="Jezik" value={draft.jezik} onChange={() => undefined}>
            <option value="Bosanski">Bosanski</option>
          </Select>
          <Select
            label="Prvi dan sedmice"
            value={draft.prviDan}
            onChange={(e) =>
              setDraft({
                ...draft,
                prviDan: e.target.value as Prefs["prviDan"],
              })
            }
          >
            <option value="Ponedjeljak">Ponedjeljak</option>
            <option value="Nedjelja">Nedjelja</option>
          </Select>
          <Select
            label="Format datuma"
            value={draft.format}
            onChange={(e) =>
              setDraft({ ...draft, format: e.target.value as DateFormat })
            }
          >
            <option value="DD.MM.YYYY.">06.11.2026.</option>
            <option value="D. M. YYYY.">6. 11. 2026.</option>
          </Select>
        </div>
        <Actions>
          <Button type="submit">Sačuvaj preferencije</Button>
        </Actions>
      </form>
    </Section>
  );
}

/* ───────────────────────── 3. Iznosi za grafikone ───────────────────────── */

function PlanForm() {
  const plan = useFiluza((s) => s.plan);
  const setPlan = useFiluza((s) => s.setPlan);
  const go = useFiluza((s) => s.go);
  const toast = useToast();
  const formId = useId();
  const [inc, setInc] = useState(plan.inc ? num(plan.inc) : "");
  const [exp, setExp] = useState(plan.exp ? num(plan.exp) : "");
  const [show, setShow] = useState(plan.show);
  const [errors, setErrors] = useState<{
    inc?: string;
    exp?: string;
    show?: string;
  }>({});

  const parse = (raw: string) => (raw.trim() ? parseAmount(raw) : 0);
  const vInc = parse(inc);
  const vExp = parse(exp);
  const pInc = vInc !== null && vInc >= 0 ? vInc : 0;
  const pExp = vExp !== null && vExp >= 0 ? vExp : 0;
  const max = Math.max(pInc, pExp) || 1;
  const saving = round2(pInc - pExp);

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (vInc === null || vInc < 0)
      errs.inc = "Upiši ispravan iznos, npr. 2.000,00.";
    if (vExp === null || vExp < 0)
      errs.exp = "Upiši ispravan iznos, npr. 1.500,00.";
    if (!errs.inc && !errs.exp && show && pInc === 0 && pExp === 0) {
      errs.show = "Upiši barem jedan iznos ili isključi prikaz.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstInvalid(formId);
    setPlan({ inc: pInc, exp: pExp, show });
    toast("Iznosi za grafikone su sačuvani. Pogledaj ih na pregledu.");
  }

  const bar = (label: string, value: number, tone: string) => (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[13.5px] leading-5">
        <span className="text-ink-2">{label}</span>
        <span className="amount text-[14px] text-ink">{km(value)}</span>
      </div>
      <div
        aria-hidden="true"
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-white"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-[350ms] ease-bar",
            tone,
          )}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <Section title="Iznosi za grafikone" icon="chart-column">
      <form id={formId} noValidate onSubmit={submit}>
        <p className="max-w-[640px] text-[14.5px] leading-[1.6] text-ink-2">
          Unesi koliko mjesečno očekuješ zaraditi i koliko najviše želiš
          potrošiti. Ovi iznosi se prikazuju na pregledu kao linije plana na
          grafikonu i kao poređenje sa stvarnim stanjem.
        </p>
        <div className="mt-5 grid gap-[18px] sm:grid-cols-2 sm:gap-x-3.5">
          <AmountField
            icon="arrow-down-left"
            label="Očekivani mjesečni prihodi"
            placeholder="npr. 2.000,00"
            value={inc}
            error={errors.inc}
            onChange={(v) => {
              setInc(v);
              setErrors((x) => ({ ...x, inc: undefined, show: undefined }));
            }}
          />
          <AmountField
            icon="arrow-up-right"
            label="Maksimalni mjesečni rashodi"
            placeholder="npr. 1.500,00"
            value={exp}
            error={errors.exp}
            onChange={(v) => {
              setExp(v);
              setErrors((x) => ({ ...x, exp: undefined, show: undefined }));
            }}
          />
        </div>

        <div
          className="mt-5 grid gap-3.5 rounded-[16px] bg-bg p-4"
          aria-live="polite"
        >
          {bar("Očekivani prihodi", pInc, "bg-income")}
          {bar("Maksimalni rashodi", pExp, "bg-expense")}
          <div className="flex items-baseline justify-between gap-3 border-t border-divider pt-3 text-[14px] leading-5">
            <span className="font-semibold text-ink">Planirana ušteda</span>
            <span
              className={cn(
                "amount text-[15px]",
                saving >= 0 ? "text-income-text" : "text-expense-text",
              )}
            >
              {km(saving)}
            </span>
          </div>
          <p className="tnum text-[12.5px] leading-[18px] text-ink-2">
            Dnevno: {km(pInc / DAYS_PER_MONTH)} / {km(pExp / DAYS_PER_MONTH)} ·
            Godišnje: {km(pInc * 12)} / {km(pExp * 12)}
          </p>
        </div>

        <Checkbox
          className="mt-5"
          checked={show}
          error={errors.show}
          onChange={(e) => {
            setShow(e.target.checked);
            setErrors((x) => ({ ...x, show: undefined }));
          }}
        >
          <span className="block font-semibold">
            Prikaži plan na grafikonima
          </span>
          <span className="block text-[13px] leading-[18px] text-ink-2">
            Linije se automatski preračunavaju za dnevni, mjesečni i godišnji
            prikaz.
          </span>
        </Checkbox>

        <Actions>
          <Button variant="secondary" onClick={() => go("pregled")}>
            Pogledaj na pregledu
          </Button>
          <Button type="submit">Sačuvaj iznose</Button>
        </Actions>
      </form>
    </Section>
  );
}

/* ───────────────────────── 4. Sigurnost ───────────────────────── */

function SecurityForm() {
  const askConfirm = useFiluza((s) => s.askConfirm);
  const toast = useToast();
  const formId = useId();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    cur?: string;
    next?: string;
    confirm?: string;
  }>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!cur) errs.cur = "Upiši trenutnu lozinku.";
    if (next.length < 8) errs.next = "Nova lozinka mora imati barem 8 znakova.";
    else if (next === cur)
      errs.next = "Nova lozinka mora se razlikovati od trenutne.";
    if (confirm !== next) errs.confirm = "Lozinke se ne podudaraju.";
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstInvalid(formId);
    setCur("");
    setNext("");
    setConfirm("");
    toast("Lozinka je promijenjena.");
  }

  return (
    <Section title="Sigurnost">
      <form id={formId} noValidate onSubmit={submit}>
        <div className="grid gap-[18px] sm:grid-cols-2 sm:gap-x-3.5">
          <TextField
            wrapClassName="sm:col-span-2"
            label="Trenutna lozinka"
            type="password"
            autoComplete="current-password"
            value={cur}
            error={errors.cur}
            onChange={(e) => {
              setCur(e.target.value);
              setErrors((x) => ({ ...x, cur: undefined }));
            }}
          />
          <TextField
            label="Nova lozinka"
            type="password"
            autoComplete="new-password"
            value={next}
            error={errors.next}
            below={<StrengthMeter password={next} />}
            onChange={(e) => {
              setNext(e.target.value);
              setErrors((x) => ({ ...x, next: undefined }));
            }}
          />
          <TextField
            label="Potvrdi novu lozinku"
            type="password"
            autoComplete="new-password"
            value={confirm}
            error={errors.confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((x) => ({ ...x, confirm: undefined }));
            }}
          />
        </div>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="secondary"
            onClick={() =>
              askConfirm({
                title: "Odjaviti se sa svih uređaja?",
                text: "Bit ćeš odjavljen na svim telefonima, tabletima i računarima. Na ovom uređaju ostaješ prijavljen.",
                confirmLabel: "Odjavi sve uređaje",
                onConfirm: () => toast("Odjavljen si sa svih ostalih uređaja."),
              })
            }
          >
            <Icon name="monitor-smartphone" size={18} />
            Odjavi se sa svih uređaja
          </Button>
          <Button type="submit">Promijeni lozinku</Button>
        </div>
      </form>
    </Section>
  );
}

/* ───────────────────────── 5. Izgled ───────────────────────── */

function ThemePreview({ dark }: { dark?: boolean }) {
  const c = dark
    ? {
        bg: "#2B1A14",
        side: "#3A241C",
        card: "#3A241C",
        line: "#54372C",
        accent: "#D85A30",
      }
    : {
        bg: "#FFF8F5",
        side: "#FFFFFF",
        card: "#FFFFFF",
        line: "#EFD8CF",
        accent: "#D85A30",
      };
  return (
    <span
      aria-hidden="true"
      className="flex h-[84px] overflow-hidden rounded-[10px] border"
      style={{ background: c.bg, borderColor: c.line }}
    >
      <span
        className="flex w-[26%] flex-col gap-1.5 border-r p-2"
        style={{ background: c.side, borderColor: c.line }}
      >
        <span
          className="h-1.5 w-3/4 rounded-full"
          style={{ background: c.accent }}
        />
        <span
          className="h-1.5 w-full rounded-full"
          style={{ background: c.line }}
        />
        <span
          className="h-1.5 w-2/3 rounded-full"
          style={{ background: c.line }}
        />
      </span>
      <span className="grid flex-1 grid-cols-2 gap-1.5 p-2">
        <span
          className="rounded-[5px] border"
          style={{ background: c.card, borderColor: c.line }}
        />
        <span
          className="rounded-[5px] border"
          style={{ background: c.card, borderColor: c.line }}
        />
        <span
          className="col-span-2 rounded-[5px] border"
          style={{ background: c.card, borderColor: c.line }}
        />
      </span>
    </span>
  );
}

function Appearance() {
  const group = useId();
  const card =
    "relative block rounded-[16px] border-2 p-3 transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent";
  return (
    <Section title="Izgled">
      <div
        role="radiogroup"
        aria-label="Tema"
        className="grid gap-3.5 sm:grid-cols-2"
      >
        <label className={cn(card, "cursor-pointer border-accent bg-surface")}>
          <input type="radio" name={group} defaultChecked className="sr-only" />
          <ThemePreview />
          <span className="mt-3 flex items-center gap-2 text-[14.5px] font-semibold text-ink">
            <Icon name="sun" size={18} className="text-accent" />
            Svijetla tema
            <span
              aria-hidden="true"
              className="ml-auto grid size-6 place-items-center rounded-full bg-accent text-white"
            >
              <Check size={14} />
            </span>
          </span>
        </label>
        <label
          className={cn(
            card,
            "cursor-not-allowed border-border bg-surface opacity-75",
          )}
        >
          <input type="radio" name={group} disabled className="sr-only" />
          <ThemePreview dark />
          <span className="mt-3 flex items-center gap-2 text-[14.5px] font-semibold text-ink">
            <Icon name="moon" size={18} className="text-ink-2" />
            Tamna tema
            <Chip className="ml-auto">Uskoro</Chip>
          </span>
        </label>
      </div>
    </Section>
  );
}

/* ───────────────────────── 6. Račun ───────────────────────── */

function Account() {
  const askConfirm = useFiluza((s) => s.askConfirm);
  const toast = useToast();
  const router = useRouter();

  function exportData() {
    const s = useFiluza.getState();
    downloadText(
      "filuza-licni-podaci.json",
      JSON.stringify(
        {
          profil: s.profile,
          transakcije: s.txs,
          kategorije: s.cats,
          budzeti: s.budgets,
          ciljevi: s.goals,
        },
        null,
        2,
      ),
      "application/json",
    );
    toast("Tvoji podaci su izvezeni.");
  }

  const row =
    "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6";

  return (
    <Section title="Račun">
      <div className="-my-4 divide-y divide-divider">
        <div className={row}>
          <div>
            <p className="text-[14.5px] leading-5 font-semibold text-ink">
              Izvoz ličnih podataka
            </p>
            <p className="mt-0.5 text-[13.5px] leading-5 text-ink-2">
              Preuzmi sve svoje podatke u JSON formatu.
            </p>
          </div>
          <Button variant="secondary" className="shrink-0" onClick={exportData}>
            <DownloadSimple size={18} aria-hidden="true" />
            Izvezi podatke
          </Button>
        </div>
        <div className={row}>
          <div>
            <p className="text-[14.5px] leading-5 font-semibold text-ink">
              Brisanje računa
            </p>
            <p className="mt-0.5 text-[13.5px] leading-5 text-ink-2">
              Trajno uklanja račun i sve podatke.
            </p>
          </div>
          <Button
            variant="secondary"
            className="shrink-0 border-expense text-expense-strong hover:border-expense hover:bg-expense-soft"
            onClick={() =>
              askConfirm({
                title: "Obrisati račun?",
                text: "Svi tvoji podaci — transakcije, budžeti, kategorije i ciljevi — bit će trajno obrisani. Ova radnja se ne može poništiti.",
                confirmLabel: "Da, obriši račun",
                destructive: true,
                onConfirm: () => {
                  useFiluza.getState().resetAll();
                  signOut();
                  flashToast("Račun je obrisan (demo).");
                  router.push("/prijava#registracija");
                },
              })
            }
          >
            <Icon name="trash-2" size={18} />
            Obriši račun
          </Button>
        </div>
      </div>
    </Section>
  );
}
