import type { Metadata } from "next";
import { LegalPage, MailLink } from "@/components/landing/LegalPage";
import type { LegalSection } from "@/components/landing/LegalPage";

export const metadata: Metadata = { title: "Politika privatnosti – Filuza" };

const List = ({ items }: { items: string[] }) => (
  <ul className="grid list-disc gap-1.5 pl-5 marker:text-accent">
    {items.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);

const SECTIONS: LegalSection[] = [
  {
    title: "Koje podatke prikupljamo",
    body: (
      <>
        <p>Samo one koje sam uneseš:</p>
        <List
          items={[
            "podatke računa: ime, prezime i email adresu,",
            "profilnu sliku, ako je postaviš,",
            "finansijske zapise: transakcije, kategorije, budžete i ciljeve štednje,",
            "postavke: valutu, format datuma i prvi dan sedmice.",
          ]}
        />
        <p>Ne tražimo pristup bankovnim računima, karticama ni lokaciji.</p>
      </>
    ),
  },
  {
    title: "Gdje se podaci čuvaju",
    body: (
      <>
        <p>
          U ovoj verziji Filuze svi podaci se čuvaju isključivo u pregledniku na
          tvom uređaju (lokalna pohrana). Ne šaljemo ih na naše servere niti ih
          vidimo.
        </p>
        <p>
          To znači i da podaci ne prelaze s jednog uređaja ili preglednika na
          drugi, te da ih brisanje podataka preglednika trajno uklanja. Za
          kopiju koristi izvoz u Postavkama.
        </p>
      </>
    ),
  },
  {
    title: "Kako koristimo podatke",
    body: (
      <p>
        Podaci služe samo za prikaz tvojih finansija: stanja, grafikona,
        izvještaja, budžeta i obavijesti unutar aplikacije. Ne koristimo ih za
        oglašavanje i ne pravimo profile ponašanja.
      </p>
    ),
  },
  {
    title: "Dijeljenje s trećim stranama",
    body: (
      <p>
        Ne prodajemo i ne dijelimo tvoje podatke. Aplikacija ne učitava alate za
        analitiku, oglase ni društvene mreže, a fontovi se isporučuju s našeg
        servera.
      </p>
    ),
  },
  {
    title: "Kolačići i lokalna pohrana",
    body: (
      <>
        <p>
          Ne koristimo kolačiće za praćenje. Preglednik pamti samo ono što je
          potrebno za rad aplikacije:
        </p>
        <List
          items={[
            "tvoje podatke i postavke (lokalna pohrana),",
            "kratke poruke potvrde pri prelasku između stranica (pohrana sesije, briše se zatvaranjem kartice).",
          ]}
        />
      </>
    ),
  },
  {
    title: "Tvoja prava",
    body: (
      <>
        <p>Nad svojim podacima imaš potpunu kontrolu:</p>
        <List
          items={[
            "uvid i ispravku: lični podaci se mijenjaju u Postavkama,",
            "prenosivost: izvoz svih podataka u JSON formatu,",
            "brisanje: Postavke → Obriši račun trajno uklanja sve podatke s uređaja.",
          ]}
        />
      </>
    ),
  },
  {
    title: "Sigurnost",
    body: (
      <p>
        Pošto su podaci na tvom uređaju, njihova sigurnost zavisi i od uređaja.
        Preporučujemo zaključavanje ekrana i da se na dijeljenom računaru
        odjaviš kad završiš.
      </p>
    ),
  },
  {
    title: "Izmjene politike",
    body: (
      <p>
        Ako počnemo čuvati podatke na serveru ili promijenimo način obrade,
        ažurirat ćemo ovu politiku i obavijestiti te prije nego što izmjene
        stupe na snagu. Za pitanja piši na <MailLink />.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Politika privatnosti"
      updated="6. 11. 2026."
      intro={
        <p>
          Tvoje finansije su lična stvar. Ova politika objašnjava koje podatke
          Filuza koristi, gdje se čuvaju i kako njima upravljaš.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
