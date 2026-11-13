import type { FiluzaData } from "./store";

/**
 * Početni podaci pri prvom pokretanju. Transakcije, kategorije, budžeti,
 * ciljevi i notifikacije generišu se ovdje (stižu sa specifikacijom aplikacije).
 */
export function seed(): FiluzaData {
  return {
    txs: [],
    cats: [],
    budgets: [],
    goals: [],
    notifs: [],
    screen: "pregled",
    mode: "mjesecno",
    profile: { firstName: "Kemal", lastName: "", email: "" },
    prefs: { compactSidebar: false },
    plan: "besplatni",
  };
}
