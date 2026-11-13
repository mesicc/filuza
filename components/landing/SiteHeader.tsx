"use client";

import { List, X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#mogucnosti", label: "Mogućnosti" },
  { href: "#pregled", label: "Pregled novca" },
  { href: "#kako", label: "Kako radi" },
  { href: "#pitanja", label: "Pitanja" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1000px)");
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-bg/85 backdrop-blur-md transition-[border-color] duration-200",
        scrolled || open ? "border-border" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-3 px-5">
        <a href="#vrh" aria-label="Filuza – početak stranice" className="-ml-1 rounded-control p-1">
          <Logo size={36} textSize={26} shine />
        </a>

        <nav aria-label="Glavna navigacija" className="ml-6 hidden items-center gap-1 nav:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="flex h-10 items-center rounded-[10px] px-3.5 text-[15px] font-medium text-ink transition-colors duration-150 hover:bg-soft active:bg-soft-2/60"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 nav:flex">
          <ButtonLink href="/prijava#prijava" variant="ghost">
            Prijavi se
          </ButtonLink>
          <ButtonLink href="/prijava#registracija">Počni besplatno</ButtonLink>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobilni-meni"
          aria-label={open ? "Zatvori meni" : "Otvori meni"}
          onClick={() => setOpen((o) => !o)}
          className="-mr-1.5 ml-auto grid size-11 place-items-center rounded-control text-heading transition-colors duration-150 hover:bg-soft active:bg-soft-2/60 nav:hidden"
        >
          {open ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="mobilni-meni" className="animate-fz-in px-5 pb-5 nav:hidden">
          <nav aria-label="Glavna navigacija" className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex h-[52px] items-center border-t border-divider text-[16px] font-medium text-ink active:text-heading"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="grid grid-cols-2 gap-2.5 border-t border-divider pt-4">
            <ButtonLink href="/prijava#prijava" variant="secondary">
              Prijavi se
            </ButtonLink>
            <ButtonLink href="/prijava#registracija">Počni besplatno</ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
