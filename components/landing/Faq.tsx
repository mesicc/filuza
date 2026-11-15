import { Accordion } from "@/components/ui/Accordion";

const ITEMS = [
  {
    q: "Da li je Filuza besplatna?",
    a: "Da, možeš besplatno kreirati račun i odmah početi pratiti prihode, rashode, budžete i ciljeve.",
  },
  {
    q: "Moraju li moji podaci biti povezani s bankom?",
    a: "Ne. Transakcije unosiš sam, za par sekundi. Ti odlučuješ šta i kada bilježiš.",
  },
  {
    q: "Radi li Filuza na telefonu?",
    a: "Da. Filuza je web aplikacija prilagođena telefonu, tabletu i računaru — bez instalacije.",
  },
  {
    q: "Mogu li izvesti svoje podatke?",
    a: "Naravno. Izvještaje preuzimaš kao CSV, a sve lične podatke možeš izvesti iz postavki u bilo kojem trenutku.",
  },
];

export function Faq() {
  return (
    <div className="rounded-card border border-border bg-surface px-5 shadow-card sm:px-7">
      <Accordion items={ITEMS} idPrefix="faq" />
    </div>
  );
}
