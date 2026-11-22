import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

export const SUPPORT_EMAIL = "podrska@filuza.ba";

export function MailLink() {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}`}
      className="font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
    >
      {SUPPORT_EMAIL}
    </a>
  );
}

/** Pravni dokument (Uslovi korištenja, Politika privatnosti): numerisane sekcije sa sadržajem. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="mx-auto w-full max-w-[720px] px-5 py-6">
      <div className="flex h-11 items-center justify-between">
        <Link
          href="/"
          aria-label="Filuza – početna"
          className="rounded-control p-1"
        >
          <Logo size={34} textSize={24} />
        </Link>
        <Link
          href="/"
          className="flex h-11 items-center gap-1.5 rounded-control px-3 text-[14.5px] font-semibold text-heading transition-colors duration-150 hover:bg-soft"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Početna
        </Link>
      </div>

      <header className="pt-14 pb-8">
        <h1 className="font-display text-[clamp(30px,5vw,40px)] leading-[1.1] font-bold tracking-[-0.022em] text-heading">
          {title}
        </h1>
        <p className="mt-3 text-[14px] text-ink-2">
          Posljednja izmjena: {updated}
        </p>
        <div className="mt-5 text-[16px] leading-[1.65] text-ink">{intro}</div>
      </header>

      <nav
        aria-label="Sadržaj"
        className="rounded-section border border-border bg-surface p-5"
      >
        <p className="text-[13px] font-semibold tracking-[0.06em] text-ink-2 uppercase">
          Sadržaj
        </p>
        <ol className="mt-2 grid gap-0.5 text-[15px]">
          {sections.map((s, i) => (
            <li key={s.title}>
              <a
                href={`#s${i + 1}`}
                className="inline-flex min-h-10 items-center rounded-[8px] text-heading underline-offset-4 hover:underline"
              >
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="pb-16">
        {sections.map((s, i) => (
          <section key={s.title} id={`s${i + 1}`} className="scroll-mt-6 pt-10">
            <h2 className="font-display text-[22px] leading-[1.25] font-bold tracking-[-0.01em] text-heading">
              {i + 1}. {s.title}
            </h2>
            <div className="mt-3 grid gap-3 text-[16px] leading-[1.65] text-ink">
              {s.body}
            </div>
          </section>
        ))}
        <p className="mt-12 border-t border-divider pt-6 text-[15px] leading-[1.6] text-ink-2">
          Pitanja u vezi s ovim dokumentom pošalji na <MailLink />.
        </p>
      </div>
    </main>
  );
}
