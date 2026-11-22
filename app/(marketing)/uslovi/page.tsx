import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, MailLink } from "@/components/landing/LegalPage";
import type { LegalSection } from "@/components/landing/LegalPage";

export const metadata: Metadata = { title: "Uslovi korištenja – Filuza" };

const List = ({ items }: { items: string[] }) => (
  <ul className="grid list-disc gap-1.5 pl-5 marker:text-accent">
    {items.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);

const SECTIONS: LegalSection[] = [
  {
    title: "O usluzi",
    body: (
      <>
        <p>
          Filuza je aplikacija za praćenje ličnih finansija: prihoda, troškova,
          budžeta i ciljeva štednje. Iznosi se vode u konvertibilnim markama
          (KM).
        </p>
        <p>
          Filuza ne obavlja plaćanja, nije povezana s tvojom bankom i ne pruža
          finansijske, poreske ni pravne savjete. Prikazi, izvještaji i
          prijedlozi služe samo kao pomoć u planiranju.
        </p>
      </>
    ),
  },
  {
    title: "Korisnički račun",
    body: (
      <>
        <p>
          Za korištenje aplikacije potreban je račun. Pri registraciji se
          obavezuješ da:
        </p>
        <List
          items={[
            "uneseš tačne podatke i ažuriraš ih kad se promijene,",
            "lozinku čuvaš za sebe i ne dijeliš račun s drugima,",
            "imaš najmanje 16 godina ili saglasnost roditelja odnosno staratelja.",
          ]}
        />
        <p>
          Ako posumnjaš da je neko drugi pristupio tvom računu, promijeni
          lozinku u Postavkama i javi nam se na <MailLink />.
        </p>
      </>
    ),
  },
  {
    title: "Tvoji podaci",
    body: (
      <>
        <p>
          Transakcije, kategorije, budžeti i ciljevi koje uneseš pripadaju tebi.
          Izvještaje možeš preuzeti kao CSV, a sve podatke u bilo kojem trenutku
          izvesti u JSON formatu ili trajno obrisati iz Postavki.
        </p>
        <p>
          Kako postupamo s podacima opisano je u{" "}
          <Link
            href="/privatnost"
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
          >
            Politici privatnosti
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    title: "Dozvoljeno korištenje",
    body: (
      <>
        <p>
          Aplikaciju koristiš za vođenje vlastitih finansija. Nije dozvoljeno:
        </p>
        <List
          items={[
            "pokušavati pristupiti tuđim računima ili podacima,",
            "ometati rad aplikacije ili je opterećivati automatizovanim zahtjevima,",
            "koristiti aplikaciju za bilo kakvu nezakonitu svrhu.",
          ]}
        />
      </>
    ),
  },
  {
    title: "Planovi i cijene",
    body: (
      <p>
        Osnovne funkcije su besplatne. Ako uvedemo plaćene planove, cijenu i
        uslove ćemo jasno prikazati prije nego što se odlučiš, a postojeće
        funkcije koje koristiš neće bez najave postati plaćene.
      </p>
    ),
  },
  {
    title: "Dostupnost i odgovornost",
    body: (
      <>
        <p>
          Trudimo se da aplikacija radi bez prekida i da su izračuni tačni, ali
          ne možemo garantovati da će usluga uvijek biti dostupna niti da je bez
          grešaka.
        </p>
        <p>
          Odluke o novcu donosiš sam. Filuza ne odgovara za štetu nastalu
          oslanjanjem na prikazane podatke, osim ako zakon to izričito
          propisuje.
        </p>
      </>
    ),
  },
  {
    title: "Prestanak korištenja",
    body: (
      <p>
        Račun možeš obrisati u bilo kojem trenutku (Postavke → Obriši račun).
        Račun koji krši ove uslove možemo privremeno ili trajno onemogućiti, uz
        obavijest na email adresu računa.
      </p>
    ),
  },
  {
    title: "Izmjene uslova",
    body: (
      <p>
        Uslove možemo mijenjati kad se usluga razvija. O bitnim izmjenama
        obavijestit ćemo te emailom ili u aplikaciji najmanje 14 dana prije nego
        što stupe na snagu. Nastavak korištenja nakon toga znači da prihvataš
        nove uslove.
      </p>
    ),
  },
  {
    title: "Mjerodavno pravo",
    body: <p>Na ove uslove primjenjuje se pravo Bosne i Hercegovine.</p>,
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Uslovi korištenja"
      updated="6. 11. 2026."
      intro={
        <p>
          Ovi uslovi uređuju korištenje aplikacije Filuza. Registracijom
          potvrđuješ da si ih pročitao i da ih prihvataš.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
