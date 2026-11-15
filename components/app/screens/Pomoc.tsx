"use client";

import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/primitives";
import { Icon } from "@/lib/icons";
import { ScreenHeader } from "../ScreenHeader";
import { CardHead } from "../common";

const ITEMS = [
  {
    q: "Kako dodati novu transakciju?",
    a: "Klikni na „+ Dodaj transakciju“ na pregledu ili ekranu Transakcije. Odaberi tip, upiši iznos u KM, naziv, kategoriju i datum, pa sačuvaj.",
  },
  {
    q: "Kako funkcionišu budžeti?",
    a: "Budžet postavlja granicu potrošnje za kategoriju u mjesecu. Filuza automatski sabira rashode te kategorije i upozorava te na 80% i 100%.",
  },
  {
    q: "Mogu li obrisati podrazumijevanu kategoriju?",
    a: "Možeš, ali samo ako nema povezanih transakcija. Tako tvoja historija ostaje tačna.",
  },
  {
    q: "Kako dodati novac cilju?",
    a: "Na kartici cilja klikni „Dodaj novac“, upiši iznos i potvrdi. Uplata se bilježi u historiji cilja.",
  },
  {
    q: "Kako preuzeti izvještaj?",
    a: "Na ekranu Izvještaji odaberi period i klikni „Preuzmi izvještaj“. Dobit ćeš CSV datoteku s transakcijama.",
  },
];

export function Pomoc() {
  return (
    <>
      <ScreenHeader title="Pomoć" sub="Odgovori na najčešća pitanja o Filuzi." />
      <div className="grid items-start gap-5 dk:grid-cols-[1.65fr_1fr]">
        <Card>
          <CardHead title="Česta pitanja" />
          <div className="mt-2">
            <Accordion items={ITEMS} idPrefix="pomoc" accentIcon />
          </div>
        </Card>

        <section className="rounded-card border border-soft-2 bg-soft p-[18px] tb:p-6">
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-[14px] bg-white text-accent">
            <Icon name="message-circle-heart" size={24} />
          </span>
          <h2 className="mt-4 font-display text-[19px] leading-6 font-semibold tracking-[-0.015em] text-ink">
            Trebaš pomoć?
          </h2>
          <p className="mt-1.5 text-[14.5px] leading-[1.6] text-ink-2">
            Piši nam i odgovorit ćemo u roku od jednog radnog dana.
          </p>
          <a
            href="mailto:podrska@filuza.ba"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-control text-[15px] font-semibold text-heading underline-offset-4 transition-colors duration-150 hover:text-primary-hover hover:underline"
          >
            <Icon name="mail" size={18} />
            podrska@filuza.ba
          </a>
        </section>
      </div>
    </>
  );
}
