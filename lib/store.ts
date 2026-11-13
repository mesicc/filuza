"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seed } from "./seed";
import type {
  Budget,
  Category,
  Goal,
  Mode,
  Notif,
  Plan,
  Prefs,
  Profile,
  Screen,
  Tx,
} from "./types";

/**
 * Jedini izvor podataka za UI. Komponente čitaju i mijenjaju stanje isključivo
 * kroz ovaj store, pa se `localStorage` kasnije može zamijeniti pravim API-jem
 * (akcije postaju pozivi servera) bez diranja ekrana.
 */
export interface FiluzaData {
  txs: Tx[];
  cats: Category[];
  budgets: Budget[];
  goals: Goal[];
  notifs: Notif[];
  screen: Screen;
  mode: Mode;
  profile: Profile;
  prefs: Prefs;
  plan: Plan;
}

interface FiluzaActions {
  setProfile: (p: Partial<Profile>) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  setScreen: (s: Screen) => void;
  setMode: (m: Mode) => void;
  setPlan: (p: Plan) => void;
  resetAll: () => void;
}

export type FiluzaState = FiluzaData & FiluzaActions;

export const STORAGE_KEY = "filuza-v1";

export const useFiluza = create<FiluzaState>()(
  persist(
    (set) => ({
      ...seed(),
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
      setScreen: (screen) => set({ screen }),
      setMode: (mode) => set({ mode }),
      setPlan: (plan) => set({ plan }),
      resetAll: () => set(seed()),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
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
    },
  ),
);

/** `true` tek nakon montiranja na klijentu – sprječava hydration razlike zbog localStorage-a. */
export function useHydrated(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}
