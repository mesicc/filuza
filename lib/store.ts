"use client";

import { useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idNum } from "./calc";
import { TODAY, fmtDate, fmtDateLong } from "./dates";
import { round2 } from "./format";
import { seed } from "./seed";
import type { FiluzaData } from "./seed";
import type {
  Budget,
  Category,
  ConfirmState,
  Goal,
  ModalKind,
  ModalState,
  Notif,
  PMode,
  Plan,
  Prefs,
  Profile,
  Screen,
  Transaction,
  Tweaks,
  TxFilter,
} from "./types";

export type { FiluzaData };

/**
 * Jedini izvor podataka za UI. Ekrani čitaju i mijenjaju stanje isključivo
 * kroz ovaj store, pa se `localStorage` kasnije može zamijeniti pravim API-jem
 * (akcije postaju pozivi servera) bez diranja komponenti.
 */

/** Stanje interfejsa koje se ne čuva između posjeta. */
interface UIState {
  loading: boolean;
  /** Datum-sidro perioda na Pregledu. */
  anchor: string;
  /** Mjesec (YYYY-MM) prikazan na ekranu Budžeti. */
  budgetMonth: string;
  txFilter: TxFilter;
  notifOpen: boolean;
  moreOpen: boolean;
  modal: ModalState | null;
  confirm: ConfirmState | null;
  tweaks: Tweaks;
}

interface Actions {
  // navigacija i interfejs
  go: (screen: Screen) => void;
  setMode: (mode: PMode) => void;
  setAnchor: (anchor: string) => void;
  setBudgetMonth: (month: string) => void;
  setTxFilter: (patch: Partial<TxFilter>) => void;
  resetTxFilter: () => void;
  setNotifOpen: (open: boolean) => void;
  setMoreOpen: (open: boolean) => void;
  openModal: (kind: ModalKind, opts?: Omit<ModalState, "kind">) => void;
  closeModal: () => void;
  askConfirm: (c: ConfirmState) => void;
  closeConfirm: () => void;
  setTweaks: (patch: Partial<Tweaks>) => void;

  // transakcije
  addTx: (tx: Omit<Transaction, "id">) => string;
  updateTx: (id: string, patch: Partial<Omit<Transaction, "id">>) => void;
  deleteTx: (id: string) => void;

  // kategorije
  addCat: (cat: Omit<Category, "id" | "def">) => string;
  updateCat: (id: string, patch: Partial<Omit<Category, "id">>) => void;
  deleteCat: (id: string) => void;

  // budžeti
  addBudget: (b: Omit<Budget, "id">) => string;
  updateBudget: (id: string, patch: Partial<Omit<Budget, "id">>) => void;
  deleteBudget: (id: string) => void;

  // ciljevi
  addGoal: (g: Omit<Goal, "id" | "history" | "done">) => string;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id" | "history">>) => void;
  deleteGoal: (id: string) => void;
  /** Uplata (pozitivan iznos) ili povlačenje (negativan iznos). */
  addGoalEntry: (goalId: string, amount: number, note: string, date?: string) => void;

  // notifikacije
  pushNotif: (n: Omit<Notif, "id" | "read">) => void;
  markNotifRead: (id: string) => void;
  markAllNotifsRead: () => void;
  deleteNotif: (id: string) => void;

  // račun
  setProfile: (p: Partial<Profile>) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  setPlan: (p: Partial<Plan>) => void;
  resetAll: () => void;
}

export type FiluzaState = FiluzaData & UIState & Actions;

export const STORAGE_KEY = "filuza-v1";

export const DEFAULT_TX_FILTER: TxFilter = {
  type: "sve",
  q: "",
  period: "sve",
  cat: "sve",
  sortKey: "date",
  sortDir: "desc",
  page: 1,
};

/** Tweak opcije: zadane vrijednosti dolaze iz `.env` (NEXT_PUBLIC_FZ_*). */
const DEFAULT_TWEAKS: Tweaks = {
  chartStyle: process.env.NEXT_PUBLIC_FZ_CHART_STYLE === "linije" ? "linije" : "stupci",
  compactSidebar: process.env.NEXT_PUBLIC_FZ_COMPACT_SIDEBAR === "true",
  emptyDemo: process.env.NEXT_PUBLIC_FZ_EMPTY_DEMO === "true",
};

const nextId = (prefix: string, list: { id: string }[]) =>
  `${prefix}${list.reduce((max, x) => Math.max(max, idNum(x.id)), 0) + 1}`;

let loadTimer: ReturnType<typeof setTimeout> | null = null;

export const useFiluza = create<FiluzaState>()(
  persist(
    (set, get) => ({
      ...seed(),

      loading: false,
      anchor: TODAY,
      budgetMonth: TODAY.slice(0, 7),
      txFilter: DEFAULT_TX_FILTER,
      notifOpen: false,
      moreOpen: false,
      modal: null,
      confirm: null,
      tweaks: DEFAULT_TWEAKS,

      go: (screen) => {
        set({ screen, loading: true, notifOpen: false, moreOpen: false });
        if (typeof window !== "undefined") window.scrollTo(0, 0);
        if (loadTimer) clearTimeout(loadTimer);
        loadTimer = setTimeout(() => set({ loading: false }), 300);
      },
      setMode: (mode) => set({ mode }),
      setAnchor: (anchor) => set({ anchor }),
      setBudgetMonth: (budgetMonth) => set({ budgetMonth }),
      setTxFilter: (patch) =>
        set((s) => ({ txFilter: { ...s.txFilter, page: 1, ...patch } })),
      resetTxFilter: () => set({ txFilter: DEFAULT_TX_FILTER }),
      setNotifOpen: (notifOpen) => set({ notifOpen }),
      setMoreOpen: (moreOpen) => set({ moreOpen }),
      openModal: (kind, opts) => set({ modal: { kind, ...opts }, notifOpen: false, moreOpen: false }),
      closeModal: () => set({ modal: null }),
      askConfirm: (confirm) => set({ confirm }),
      closeConfirm: () => set({ confirm: null }),
      setTweaks: (patch) => set((s) => ({ tweaks: { ...s.tweaks, ...patch } })),

      addTx: (tx) => {
        const id = nextId("t", get().txs);
        set((s) => ({ txs: [...s.txs, { ...tx, amount: round2(tx.amount), id }] }));
        return id;
      },
      updateTx: (id, patch) =>
        set((s) => ({
          txs: s.txs.map((t) =>
            t.id === id ? { ...t, ...patch, amount: round2(patch.amount ?? t.amount) } : t,
          ),
        })),
      deleteTx: (id) => set((s) => ({ txs: s.txs.filter((t) => t.id !== id) })),

      addCat: (cat) => {
        const id = nextId("k", get().cats);
        set((s) => ({ cats: [...s.cats, { ...cat, def: false, id }] }));
        return id;
      },
      updateCat: (id, patch) => set((s) => ({ cats: s.cats.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCat: (id) =>
        set((s) => ({
          cats: s.cats.filter((c) => c.id !== id),
          budgets: s.budgets.filter((b) => b.cat !== id),
        })),

      addBudget: (b) => {
        const id = nextId("b", get().budgets);
        set((s) => ({ budgets: [...s.budgets, { ...b, limit: round2(b.limit), id }] }));
        return id;
      },
      updateBudget: (id, patch) =>
        set((s) => ({ budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      deleteBudget: (id) => set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      addGoal: (g) => {
        const id = nextId("g", get().goals);
        set((s) => ({ goals: [...s.goals, { ...g, history: [], done: false, id }] }));
        return id;
      },
      updateGoal: (id, patch) => set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      addGoalEntry: (goalId, amount, note, date = TODAY) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  history: [
                    ...g.history,
                    { id: `${g.id}e${g.history.reduce((m, e) => Math.max(m, idNum(e.id.split("e")[1] ?? "")), 0) + 1}`, date, amount: round2(amount), note },
                  ],
                }
              : g,
          ),
        })),

      pushNotif: (n) =>
        set((s) => ({ notifs: [{ ...n, id: nextId("n", s.notifs), read: false }, ...s.notifs] })),
      markNotifRead: (id) => set((s) => ({ notifs: s.notifs.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotifsRead: () => set((s) => ({ notifs: s.notifs.map((n) => ({ ...n, read: true })) })),
      deleteNotif: (id) => set((s) => ({ notifs: s.notifs.filter((n) => n.id !== id) })),

      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
      setPlan: (p) => set((s) => ({ plan: { ...s.plan, ...p } })),
      resetAll: () => set(seed()),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): FiluzaData => ({
        txs: s.txs,
        cats: s.cats,
        budgets: s.budgets,
        goals: s.goals,
        notifs: s.notifs,
        screen: s.screen,
        mode: s.mode,
        profile: s.profile,
        prefs: s.prefs,
        plan: s.plan,
      }),
      // Verzija 1 (prije modela podataka) je čuvala samo profil s registracije.
      migrate: (persisted, version) => {
        if (version >= 2) return persisted as FiluzaData;
        const fresh = seed();
        const old = (persisted as { profile?: { firstName?: string; lastName?: string; email?: string } } | null)
          ?.profile;
        if (old?.email && old.firstName) {
          fresh.profile = { ime: old.firstName, prezime: old.lastName ?? "", email: old.email };
        }
        return fresh;
      },
    },
  ),
);

/** `true` tek nakon montiranja na klijentu – sprječava hydration razlike zbog localStorage-a. */
export function useHydrated(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}

const NO_TXS: Transaction[] = [];
const NO_BUDGETS: Budget[] = [];
const NO_GOALS: Goal[] = [];
const NO_NOTIFS: Notif[] = [];

/* Podaci za ekrane. Uz tweak `emptyDemo` vraćaju prazne liste, bez brisanja podataka. */
export const useTxs = () => useFiluza((s) => (s.tweaks.emptyDemo ? NO_TXS : s.txs));
export const useBudgets = () => useFiluza((s) => (s.tweaks.emptyDemo ? NO_BUDGETS : s.budgets));
export const useGoals = () => useFiluza((s) => (s.tweaks.emptyDemo ? NO_GOALS : s.goals));
export const useNotifs = () => useFiluza((s) => (s.tweaks.emptyDemo ? NO_NOTIFS : s.notifs));
export const useCats = () => useFiluza((s) => s.cats);

/** Formatiranje datuma po izboru korisnika iz Postavki. */
export function useFmt() {
  const format = useFiluza((s) => s.prefs.format);
  return useMemo(
    () => ({
      format,
      date: (iso: string) => fmtDate(iso, format),
      long: (iso: string) => fmtDateLong(iso, format),
    }),
    [format],
  );
}

export function initials(p: Profile): string {
  return `${p.ime.trim().charAt(0)}${p.prezime.trim().charAt(0)}`.toUpperCase() || "F";
}
