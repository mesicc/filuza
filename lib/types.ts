export type TxType = "prihod" | "rashod";
export type Method = "Gotovina" | "Kartica" | "Bankovni račun" | "Ostalo";

export interface Transaction {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  name: string;
  /** id kategorije */
  cat: string;
  type: TxType;
  amount: number;
  method: Method;
  note: string;
}

export interface Category {
  id: string;
  name: string;
  type: TxType;
  /** ključ ikone (Dodatak A) */
  icon: string;
  color: string;
  /** početna (ugrađena) kategorija */
  def: boolean;
}

export interface Budget {
  id: string;
  cat: string;
  limit: number;
  recurring: boolean;
  /** YYYY-MM */
  month: string;
}

export interface GoalEntry {
  id: string;
  date: string;
  /** negativno = povlačenje */
  amount: number;
  note: string;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  target: number;
  date: string;
  history: GoalEntry[];
  done: boolean;
}

export type NotifTone = "red" | "gold" | "green" | "peach";

export interface Notif {
  id: string;
  icon: string;
  tone: NotifTone;
  text: string;
  time: string;
  read: boolean;
}

export interface Profile {
  ime: string;
  prezime: string;
  email: string;
}

export type DateFormat = "DD.MM.YYYY." | "D. M. YYYY.";

export interface Prefs {
  valuta: "KM";
  jezik: "Bosanski";
  prviDan: "Ponedjeljak" | "Nedjelja";
  format: DateFormat;
}

/** Očekivani mjesečni prihodi / maksimalni mjesečni rashodi. */
export interface Plan {
  inc: number;
  exp: number;
  show: boolean;
}

export type Screen =
  | "pregled"
  | "transakcije"
  | "budzeti"
  | "kategorije"
  | "ciljevi"
  | "izvjestaji"
  | "postavke"
  | "pomoc";

/** Period na Pregledu. */
export type PMode = "day" | "month" | "year";

export type TxPeriod = "sve" | "danas" | "mjesec" | "prosli-mjesec" | "godina" | "prosla-godina";

export interface TxFilter {
  type: "sve" | TxType;
  q: string;
  period: TxPeriod;
  /** id kategorije ili "sve" */
  cat: string;
  sortKey: "date" | "amount";
  sortDir: "asc" | "desc";
  page: number;
}

export interface Tweaks {
  chartStyle: "stupci" | "linije";
  compactSidebar: boolean;
  /** Privremeno prikaže prazna stanja bez brisanja podataka. */
  emptyDemo: boolean;
}

export type ModalKind =
  | "tx"
  | "deleteTx"
  | "budget"
  | "deleteBudget"
  | "cat"
  | "deleteCat"
  | "goal"
  | "deleteGoal"
  | "goalAdd"
  | "goalWithdraw"
  | "goalHistory"
  | "goalDone"
  | "report";

export interface ModalState {
  kind: ModalKind;
  /** id zapisa koji se uređuje/briše; bez id-a = novi zapis */
  id?: string;
  /** unaprijed odabran tip (nova transakcija / kategorija) */
  type?: TxType;
  /** unaprijed odabran datum (nova transakcija) */
  date?: string;
}

export interface ConfirmState {
  title: string;
  text: string;
  confirmLabel: string;
  /** `null` = dijalog s jednim dugmetom */
  cancelLabel?: string | null;
  destructive?: boolean;
  onConfirm?: () => void;
}

export const NOTIF_TONES: Record<NotifTone, { bg: string; fg: string }> = {
  red: { bg: "#F8E4E1", fg: "#B4574E" },
  gold: { bg: "#FBEFD9", fg: "#9A6A1F" },
  green: { bg: "#E3F3E9", fg: "#3F8463" },
  peach: { bg: "#FDE9E1", fg: "#D85A30" },
};

export const METHODS: { value: Method; icon: string }[] = [
  { value: "Gotovina", icon: "banknote" },
  { value: "Kartica", icon: "credit-card" },
  { value: "Bankovni račun", icon: "landmark" },
  { value: "Ostalo", icon: "circle-ellipsis" },
];

export const CAT_ICONS = [
  "shopping-basket", "house", "receipt", "bus", "fuel", "heart-pulse", "shirt", "clapperboard",
  "shopping-bag", "graduation-cap", "briefcase", "laptop", "gift", "coins", "trending-up", "plane",
  "car", "baby", "dog", "dumbbell", "coffee", "smartphone", "wrench", "circle-ellipsis",
] as const;

export const CAT_COLORS = [
  "#D85A30", "#993C1D", "#E6AA4E", "#C96B62", "#4F9D77", "#6E9C8A", "#7A4D3F", "#F2A07B",
] as const;

export const GOAL_ICONS = [
  "car", "plane", "shield", "house", "graduation-cap", "laptop", "gift", "heart", "sprout", "piggy-bank",
  "baby", "bike",
] as const;

export const UNKNOWN_CAT: Category = {
  id: "",
  name: "Bez kategorije",
  type: "rashod",
  icon: "circle-ellipsis",
  color: "#D9BFB3",
  def: false,
};
