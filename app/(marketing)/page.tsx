import { ArrowRight, Check, Plant } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Faq } from "@/components/landing/Faq";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/primitives";
import { Icon } from "@/lib/icons";
import type { IconKey } from "@/lib/icons";

const WRAP = "mx-auto w-full max-w-[1240px] px-5";
const H2 =
  "font-display font-bold text-heading text-[clamp(28px,3.8vw,42px)] leading-[1.08] tracking-[-0.022em]";

const FEATURES: { icon: IconKey; color: string; title: string; text: string }[] = [
  {
    icon: "arrow-left-right",
    color: "#D85A30",
    title: "Transakcije za par sekundi",
    text: "Upiši iznos, naziv i kategoriju. Pretraga, filteri i sortiranje pomažu da sve brzo pronađeš.",
  },
  {
    icon: "piggy-bank",
    color: "#4F9D77",
    title: "Budžeti koji te čuvaju",
    text: "Postavi limit za hranu, račune ili zabavu. Filuza te nježno upozori na 80% i kad dostigneš limit.",
  },
  {
    icon: "target",
    color: "#E6AA4E",
    title: "Ciljevi štednje",
    text: "Automobil, putovanje ili fond za sigurnost — dodaj uplatu i gledaj kako napredak raste.",
  },
  {
    icon: "chart-column",
    color: "#C96B62",
    title: "Jasni izvještaji",
    text: "Potrošnja po kategorijama, kretanje stanja i trend štednje. Preuzmi izvještaj jednim klikom.",
  },
];

const VIEWS: { icon: IconKey; title: string; text: string }[] = [
  {
    icon: "sun",
    title: "Dnevni pregled",
    text: "Sve transakcije tog dana, neto tok novca i poređenje s jučer.",
  },
  {
    icon: "calendar-days",
    title: "Mjesečni pregled",
    text: "Prihodi i rashodi po danima, najveće kategorije troškova i stanje budžeta.",
  },
  {
    icon: "calendar-range",
    title: "Godišnji pregled",
    text: "Svih 12 mjeseci, prosjeci, najbolji mjesec i poređenje s prošlom godinom.",
  },
];

const STEPS = [
  { title: "Kreiraj račun", text: "Registracija traje manje od minute. Dovoljni su ime i email." },
  {
    title: "Dodaj prihode i rashode",
    text: "Platu, račune, kafu s prijateljima — sve u KM, u svojim kategorijama.",
  },
  { title: "Postavi budžet i cilj", text: "Odredi granice potrošnje i štedi za ono što ti je važno." },
];

const PERKS = ["Besplatno za početak", "Na bosanskom jeziku", "Radi na telefonu i računaru"];

const FOOT_LINK =
  "flex min-h-11 items-center rounded-[8px] text-[14.5px] font-medium text-ink-2 underline-offset-4 transition-colors duration-150 hover:text-heading hover:underline";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ───────── Hero ───────── */}
        <section id="vrh" className="relative overflow-hidden">
          <div aria-hidden="true" className="absolute -top-[190px] -right-[170px] size-[620px] rounded-full bg-soft" />
          <div
            aria-hidden="true"
            className="absolute top-[460px] right-[350px] hidden size-[380px] rounded-full border-2 border-dashed border-soft-2 nav:block"
          />

          <div
            className={`${WRAP} relative grid items-center gap-x-14 gap-y-14 pt-10 pb-20 [grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr))] nav:pt-[72px] nav:pb-28`}
          >
            <div>
              <p className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-surface py-1.5 pr-4 pl-2.5 text-[13.5px] leading-5 font-medium text-ink-2">
                <Plant size={18} aria-hidden="true" className="shrink-0 text-income" />
                „Filuza“ – stara riječ za sitni novac
              </p>
              <h1 className="mt-5 font-display text-[clamp(40px,6vw,68px)] leading-[1.02] font-bold tracking-[-0.025em] text-heading">
                Čuvaj svaku paru.
              </h1>
              <p className="mt-5 max-w-[530px] text-[17px] leading-[1.6] text-ink-2 nav:text-[18px]">
                Filuza ti na jednom mjestu pokazuje koliko novca imaš, gdje ga trošiš i koliko možeš uštedjeti. Bez
                tabela, bez komplikacija — sve u KM.
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[30rem]:flex-row min-[30rem]:flex-wrap">
                <ButtonLink
                  href="/prijava#registracija"
                  size="xl"
                  className="shadow-cta hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-14px_rgba(189,70,32,.65)]"
                >
                  Kreiraj besplatan račun
                  <ArrowRight size={20} aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/prijava#prijava" size="xl" variant="secondary">
                  Već imam račun
                </ButtonLink>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
                {PERKS.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-[14px] font-medium text-ink-2">
                    <span className="grid size-5 place-items-center rounded-full bg-income-soft text-income-strong">
                      <Check size={12} aria-hidden="true" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <HeroDemo />
          </div>
        </section>

        {/* ───────── Mogućnosti ───────── */}
        <section id="mogucnosti" className={`${WRAP} py-16 nav:py-24`}>
          <h2 className={`${H2} max-w-[660px]`}>Sve što ti treba za mirnu glavu oko novca.</h2>
          <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-ink-2">
            Ne moraš biti finansijski stručnjak. Filuza radi računanje umjesto tebe.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 nav:grid-cols-4">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="rounded-card border border-border bg-surface p-6 shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <IconTile icon={f.icon} color={f.color} size={48} />
                <h3 className="mt-5 font-display text-[20px] leading-[1.2] font-semibold tracking-[-0.015em] text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-ink-2">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ───────── Pregled novca ───────── */}
        <section id="pregled" className="border-y border-border bg-surface">
          <div className={`${WRAP} grid items-center gap-x-16 gap-y-10 py-16 nav:grid-cols-[1fr_1.05fr] nav:py-24`}>
            <div>
              <p className="text-[12.5px] font-bold tracking-[0.08em] text-primary uppercase">
                Dnevno · Mjesečno · Godišnje
              </p>
              <h2 className={`${H2} mt-4 max-w-[520px]`}>Pogledaj svoj novac iz svakog ugla.</h2>
              <p className="mt-4 max-w-[520px] text-[17px] leading-[1.6] text-ink-2">
                Jednim dodirom prebaci prikaz. Kartice, grafikoni i lista transakcija se odmah prilagode odabranom
                periodu — i uporede ga s prethodnim.
              </p>
            </div>
            <ul className="grid gap-3.5">
              {VIEWS.map((v) => (
                <li key={v.title} className="flex items-start gap-4 rounded-section border border-divider bg-bg p-5">
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-[12px] border border-border bg-surface text-accent"
                  >
                    <Icon name={v.icon} size={20} />
                  </span>
                  <div>
                    <h3 className="text-[16.5px] leading-6 font-semibold text-ink">{v.title}</h3>
                    <p className="mt-1 text-[14.5px] leading-[1.55] text-ink-2">{v.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── Kako radi ───────── */}
        <section id="kako" className={`${WRAP} py-16 nav:py-24`}>
          <h2 className={`${H2} text-center`}>Tri koraka do kontrole.</h2>
          <ol className="mt-10 grid gap-5 nav:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-7">
                <span
                  aria-hidden="true"
                  className="block font-display text-[44px] leading-none font-bold tracking-[-0.02em] text-soft-2"
                >
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-[20px] leading-[1.2] font-semibold tracking-[-0.015em] text-ink">
                  {s.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-ink-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ───────── Pitanja ───────── */}
        <section id="pitanja" className="mx-auto w-full max-w-[860px] px-5 pb-16 nav:pb-24">
          <h2 className={`${H2} text-center`}>Česta pitanja</h2>
          <div className="mt-8">
            <Faq />
          </div>
        </section>

        {/* ───────── Poziv na akciju ───────── */}
        <section className={`${WRAP} pb-16 nav:pb-24`}>
          <div className="relative overflow-hidden rounded-[32px] bg-heading px-6 py-14 text-center sm:py-[72px]">
            <div
              aria-hidden="true"
              className="absolute -top-[150px] -right-[110px] size-[380px] rounded-full border-2 border-dashed border-white/25"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-[190px] -left-[130px] size-[380px] rounded-full border-2 border-dashed border-white/15"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-[620px] font-display text-[clamp(28px,4vw,44px)] leading-[1.08] font-bold tracking-[-0.022em] text-white">
                Male navike danas, veliki ciljevi sutra.
              </h2>
              <p className="mt-4 text-[17px] text-soft">Počni pratiti svoj novac već večeras.</p>
              <ButtonLink
                href="/prijava#registracija"
                variant="white"
                size="xl"
                className="mt-8 focus-visible:outline-white"
              >
                Kreiraj besplatan račun
                <ArrowRight size={20} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-border bg-surface">
        <div className={`${WRAP} flex flex-col gap-x-10 gap-y-6 py-9 nav:flex-row nav:items-center`}>
          <div className="flex items-center gap-4">
            <Logo size={30} textSize={22} />
            <span className="border-l border-border pl-4 text-[14px] text-ink-2">Čuvaj svaku paru.</span>
          </div>
          <nav aria-label="Podnožje" className="flex flex-wrap gap-x-6 nav:ml-auto">
            <Link href="/prijava#prijava" className={FOOT_LINK}>
              Prijava
            </Link>
            <a href="#pitanja" className={FOOT_LINK}>
              Pitanja
            </a>
            <Link href="/uslovi" className={FOOT_LINK}>
              Uslovi korištenja
            </Link>
            <Link href="/privatnost" className={FOOT_LINK}>
              Privatnost
            </Link>
            <a href="mailto:podrska@filuza.ba" className={FOOT_LINK}>
              podrska@filuza.ba
            </a>
          </nav>
          <p className="tnum text-[13.5px] text-ink-2">© 2026 Filuza</p>
        </div>
      </footer>
    </>
  );
}
