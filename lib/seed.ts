import { daysInMonth } from "./dates";
import type {
  Budget,
  Category,
  Goal,
  Method,
  Notif,
  PMode,
  Plan,
  Prefs,
  Profile,
  Screen,
  Transaction,
  TxType,
} from "./types";

/** Podaci koji se čuvaju u `localStorage` (ključ `filuza-v1`). */
export interface FiluzaData {
  txs: Transaction[];
  cats: Category[];
  budgets: Budget[];
  goals: Goal[];
  notifs: Notif[];
  screen: Screen;
  mode: PMode;
  profile: Profile;
  prefs: Prefs;
  plan: Plan;
  /** Je li korisnik prijavljen (demo: prvi start je prijavljen). */
  signedIn: boolean;
}

const c = (id: string, name: string, type: TxType, icon: string, color: string): Category => ({
  id,
  name,
  type,
  icon,
  color,
  def: true,
});

export const DEFAULT_CATS: Category[] = [
  c("plata", "Plata", "prihod", "briefcase", "#4F9D77"),
  c("freelance", "Freelance", "prihod", "laptop", "#6FB592"),
  c("posao", "Posao", "prihod", "building-2", "#3F7F61"),
  c("investicije", "Investicije", "prihod", "trending-up", "#E6AA4E"),
  c("pokloni", "Pokloni", "prihod", "gift", "#D85A30"),
  c("ostalo_p", "Ostalo", "prihod", "coins", "#CDB4A9"),
  c("hrana", "Hrana", "rashod", "shopping-basket", "#D85A30"),
  c("stanovanje", "Stanovanje", "rashod", "house", "#993C1D"),
  c("racuni", "Računi", "rashod", "receipt", "#E6AA4E"),
  c("prijevoz", "Prijevoz", "rashod", "bus", "#C96B62"),
  c("gorivo", "Gorivo", "rashod", "fuel", "#B8763E"),
  c("zdravlje", "Zdravlje", "rashod", "heart-pulse", "#4F9D77"),
  c("odjeca", "Odjeća", "rashod", "shirt", "#8E6F5E"),
  c("zabava", "Zabava", "rashod", "clapperboard", "#F2A07B"),
  c("kupovina", "Kupovina", "rashod", "shopping-bag", "#7A4D3F"),
  c("obrazovanje", "Obrazovanje", "rashod", "graduation-cap", "#6E9C8A"),
  c("ostalo_r", "Ostalo", "rashod", "circle-ellipsis", "#D9BFB3"),
];

/** Seedovani PRNG – isti podaci pri svakom pokretanju. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Draft = Omit<Transaction, "id">;

const pad = (n: number) => String(n).padStart(2, "0");

function generateTxs(): Transaction[] {
  const rnd = mulberry32(20261106);
  const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
  const dec = (a: number, b: number) => Math.round((a + rnd() * (b - a)) * 10) / 10;
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rnd() * list.length)];
  const chance = (p: number) => rnd() < p;

  const out: Transaction[] = [];
  let n = 0;
  const flush = (drafts: Draft[]) => {
    for (const d of drafts) out.push({ id: `t${++n}`, ...d });
  };

  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === 2026 && m > 10) break;
      const days = daysInMonth(y, m);
      const winter = m >= 11 || m <= 3;
      const month: Draft[] = [];
      const add = (
        day: number,
        name: string,
        cat: string,
        type: TxType,
        amount: number,
        method: Method = "Kartica",
      ) =>
        month.push({
          date: `${y}-${pad(m)}-${pad(Math.min(day, days))}`,
          name,
          cat,
          type,
          amount,
          method,
          note: "",
        });
      const anyDay = () => int(1, days);

      // Prihodi
      add(1, "Plata", "plata", "prihod", y === 2025 ? 1650 : 1800, "Bankovni račun");
      if (chance(0.5)) {
        add(
          anyDay(),
          pick(["Freelance projekat", "Dizajn logotipa", "Web stranica za klijenta"]),
          "freelance",
          "prihod",
          Math.round(int(150, 600) / 10) * 10,
          "Bankovni račun",
        );
      }
      if (m === 12) add(19, "Novogodišnji bonus", "posao", "prihod", 500, "Bankovni račun");
      if (y === 2026 && m % 3 === 0) add(25, "Dividenda", "investicije", "prihod", int(40, 90), "Bankovni račun");
      if (chance(0.15)) add(anyDay(), "Poklon od porodice", "pokloni", "prihod", int(50, 200), "Gotovina");

      // Fiksni rashodi
      add(1, "Kirija", "stanovanje", "rashod", 300, "Bankovni račun");
      add(2, "GRAS mjesečna karta", "prijevoz", "rashod", 50, "Gotovina");
      add(3, "Internet", "racuni", "rashod", 35);
      add(8, "Struja", "racuni", "rashod", winter ? int(95, 130) : int(60, 85));
      add(12, "Mobitel", "racuni", "rashod", 40);
      add(15, "Voda i komunalije", "racuni", "rashod", int(30, 50));
      if (winter) add(10, "Grijanje", "stanovanje", "rashod", int(60, 90));

      // Promjenjivi rashodi
      const food = int(10, 14);
      for (let i = 0; i < food; i++) {
        add(
          anyDay(),
          pick(["Bingo", "Konzum", "Amko", "Pekara", "Tržnica", "Robot"]),
          "hrana",
          "rashod",
          dec(8, 70),
          chance(0.5) ? "Kartica" : "Gotovina",
        );
      }
      if (chance(0.6)) add(anyDay(), pick(["Ćevabdžinica", "Restoran", "Pizzerija"]), "hrana", "rashod", int(18, 45));
      const fuel = int(2, 3);
      for (let i = 0; i < fuel; i++) add(anyDay(), "Gorivo", "prijevoz", "rashod", int(50, 80));
      const fun = int(2, 4);
      for (let i = 0; i < fun; i++) {
        add(
          anyDay(),
          pick(["Kino", "Netflix", "Koncert", "Kafa s prijateljima", "Spotify"]),
          "zabava",
          "rashod",
          int(8, 45),
        );
      }
      if (chance(0.45)) add(anyDay(), "Apoteka", "zdravlje", "rashod", int(10, 60));
      if (chance(0.6)) {
        add(anyDay(), pick(["Online kupovina", "Tehnika", "Kućne potrepštine"]), "kupovina", "rashod", int(25, 140));
      }
      if (chance(0.35)) add(anyDay(), pick(["Patike", "Jakna", "Majica"]), "odjeca", "rashod", int(30, 120));
      if (chance(0.2)) add(anyDay(), pick(["Online kurs", "Knjige"]), "obrazovanje", "rashod", int(20, 80));
      if (chance(0.7)) {
        add(
          anyDay(),
          pick(["Frizer", "Poklon za rođendan", "Kućni ljubimac"]),
          "ostalo_r",
          "rashod",
          int(15, 60),
          "Gotovina",
        );
      }
      if (m === 8) add(anyDay(), "Ljetovanje – smještaj", "ostalo_r", "rashod", int(350, 480));
      if (m === 12) add(anyDay(), "Novogodišnji pokloni", "kupovina", "rashod", int(150, 260));

      month.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      flush(month);
    }
  }

  // Fiksne transakcije za novembar 2026.
  const nov = (
    day: number,
    name: string,
    cat: string,
    amount: number,
    type: TxType = "rashod",
    method: Method = "Kartica",
  ): Draft => ({ date: `2026-11-${pad(day)}`, name, cat, type, amount, method, note: "" });

  flush([
    nov(1, "Plata", "plata", 2000, "prihod", "Bankovni račun"),
    nov(1, "Kirija", "stanovanje", 300, "rashod", "Bankovni račun"),
    nov(1, "GRAS mjesečna karta", "prijevoz", 50, "rashod", "Gotovina"),
    nov(2, "Bingo", "hrana", 45.5),
    nov(2, "Netflix", "zabava", 26),
    nov(2, "Spotify", "zabava", 9.5),
    nov(3, "Internet", "racuni", 35),
    nov(3, "Godišnji bonus", "posao", 1200, "prihod", "Bankovni račun"),
    nov(3, "Konzum", "hrana", 82.3),
    nov(4, "Gorivo", "prijevoz", 70),
    nov(4, "Struja", "racuni", 95),
    nov(4, "Pekara", "hrana", 12.2, "rashod", "Gotovina"),
    nov(4, "Kino", "zabava", 24),
    nov(5, "Freelance projekat", "freelance", 500, "prihod", "Bankovni račun"),
    nov(5, "Amko", "hrana", 120),
    nov(5, "Mobitel", "racuni", 40),
    nov(5, "Frizer", "ostalo_r", 40, "rashod", "Gotovina"),
    nov(6, "Isplata investicije", "investicije", 800, "prihod", "Bankovni račun"),
    nov(6, "Gorivo", "prijevoz", 60),
    nov(6, "Restoran", "hrana", 90),
    nov(6, "Voda i komunalije", "racuni", 50),
    nov(6, "Koncert", "zabava", 50),
    nov(6, "Poklon za rođendan", "ostalo_r", 60, "rashod", "Gotovina"),
  ]);

  return out;
}

function budgets(): Budget[] {
  const list: [string, number][] = [
    ["hrana", 500],
    ["prijevoz", 250],
    ["zabava", 150],
    ["racuni", 300],
    ["stanovanje", 300],
    ["zdravlje", 100],
    ["kupovina", 200],
    ["ostalo_r", 200],
  ];
  return list.map(([cat, limit], i) => ({ id: `b${i + 1}`, cat, limit, recurring: true, month: "2026-11" }));
}

function goal(
  id: string,
  name: string,
  icon: string,
  target: number,
  date: string,
  count: number,
  amount: number,
  startMonth: number,
): Goal {
  return {
    id,
    name,
    icon,
    target,
    date,
    done: false,
    history: Array.from({ length: count }, (_, i) => ({
      id: `${id}e${i + 1}`,
      date: `2026-${pad(startMonth + i)}-01`,
      amount,
      note: "Mjesečna uplata",
    })),
  };
}

function notifs(): Notif[] {
  return [
    { id: "n1", icon: "triangle-alert", tone: "red", text: "Tvoj budžet za stanovanje je u potpunosti iskorišten.", time: "Prije 2 sata", read: false },
    { id: "n2", icon: "bus", tone: "gold", text: "Tvoj budžet za prijevoz je skoro dostignut.", time: "Prije 5 sati", read: false },
    { id: "n3", icon: "sparkles", tone: "green", text: "Ostvario si 50% cilja za putovanje.", time: "Jučer", read: false },
    { id: "n4", icon: "circle-check", tone: "green", text: "Dodao si novu transakciju.", time: "Jučer", read: true },
    { id: "n5", icon: "chart-column", tone: "peach", text: "Tvoj mjesečni pregled je spreman.", time: "01.11.2026.", read: true },
  ];
}

/** Početni podaci pri prvom pokretanju. */
export function seed(): FiluzaData {
  return {
    txs: generateTxs(),
    cats: DEFAULT_CATS.map((x) => ({ ...x })),
    budgets: budgets(),
    goals: [
      goal("g1", "Novi automobil", "car", 15000, "2028-06-01", 6, 750, 6),
      goal("g2", "Putovanje", "plane", 2000, "2027-07-01", 4, 300, 8),
      goal("g3", "Fond za sigurnost", "shield", 5000, "2027-12-01", 5, 400, 7),
    ],
    notifs: notifs(),
    screen: "pregled",
    mode: "month",
    profile: { ime: "Kemal", prezime: "Hodžić", email: "kemal.hodzic@gmail.com" },
    prefs: { valuta: "KM", jezik: "Bosanski", prviDan: "Ponedjeljak", format: "DD.MM.YYYY." },
    plan: { inc: 2000, exp: 1500, show: true },
    signedIn: true,
  };
}
