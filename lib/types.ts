import type { ISODate } from "./dates";
import type { IconKey } from "./icons";

export type TxType = "prihod" | "rashod";
export type Mode = "dnevno" | "mjesecno" | "godisnje";
export type Screen =
  | "pregled"
  | "transakcije"
  | "budzeti"
  | "kategorije"
  | "ciljevi"
  | "izvjestaji"
  | "postavke"
  | "pomoc";

export interface Tx {
  id: string;
  type: TxType;
  name: string;
  amount: number;
  catId: string;
  date: ISODate;
  note?: string;
  recurring?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: TxType;
  icon: IconKey;
  color: string;
}

export interface Budget {
  id: string;
  catId: string;
  limit: number;
}

export interface Goal {
  id: string;
  name: string;
  icon: IconKey;
  color: string;
  target: number;
  saved: number;
  deadline?: ISODate;
}

export interface Notif {
  id: string;
  icon: IconKey;
  title: string;
  text: string;
  date: ISODate;
  read: boolean;
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Prefs {
  compactSidebar: boolean;
}

export type Plan = "besplatni" | "plus";
