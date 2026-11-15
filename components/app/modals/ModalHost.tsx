"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { plural } from "@/lib/calc";
import { skm } from "@/lib/format";
import { useFiluza, useFmt } from "@/lib/store";
import type { ConfirmState, ModalState } from "@/lib/types";
import { BudgetModal } from "./BudgetModal";
import { CatModal } from "./CatModal";
import { GoalModal } from "./GoalModal";
import { GoalHistoryModal, GoalMoneyModal } from "./GoalMoneyModal";
import { TxModal } from "./TxModal";

const CONFIRM_KINDS = new Set(["deleteTx", "deleteBudget", "deleteCat", "deleteGoal", "goalDone"]);

/**
 * Prikazuje modal koji je zatražen preko `openModal(...)`. Zahtjevi za brisanje
 * i označavanje cilja pretvaraju se u potvrdni dijalog.
 */
export function ModalHost() {
  const modal = useFiluza((s) => s.modal);
  const close = useFiluza((s) => s.closeModal);
  const toast = useToast();
  const fmt = useFmt();

  useEffect(() => {
    if (!modal || !CONFIRM_KINDS.has(modal.kind)) return;
    const confirm = buildConfirm(modal, toast, fmt.date);
    const store = useFiluza.getState();
    store.closeModal();
    if (confirm) store.askConfirm(confirm);
  }, [modal, toast, fmt]);

  if (!modal) return null;
  // `key` daje svakom zahtjevu svježe stanje forme.
  const key = `${modal.kind}:${modal.id ?? "novo"}`;
  switch (modal.kind) {
    case "tx":
      return <TxModal key={key} modal={modal} onClose={close} />;
    case "budget":
      return <BudgetModal key={key} modal={modal} onClose={close} />;
    case "cat":
      return <CatModal key={key} modal={modal} onClose={close} />;
    case "goal":
      return <GoalModal key={key} modal={modal} onClose={close} />;
    case "goalAdd":
    case "goalWithdraw":
      return <GoalMoneyModal key={key} modal={modal} onClose={close} />;
    case "goalHistory":
      return <GoalHistoryModal key={key} modal={modal} onClose={close} />;
    default:
      return null;
  }
}

function buildConfirm(
  modal: ModalState,
  toast: (text: string) => void,
  date: (iso: string) => string,
): ConfirmState | null {
  const s = useFiluza.getState();
  const id = modal.id;
  if (!id) return null;

  switch (modal.kind) {
    case "deleteTx": {
      const t = s.txs.find((x) => x.id === id);
      if (!t) return null;
      return {
        title: "Obrisati transakciju?",
        text: `Transakcija „${t.name}“ (${skm(t.amount, t.type)}, ${date(t.date)}) bit će trajno obrisana. Ova radnja se ne može poništiti.`,
        confirmLabel: "Obriši transakciju",
        destructive: true,
        onConfirm: () => {
          useFiluza.getState().deleteTx(id);
          toast("Transakcija je obrisana.");
        },
      };
    }
    case "deleteBudget": {
      const b = s.budgets.find((x) => x.id === id);
      if (!b) return null;
      const name = s.cats.find((c) => c.id === b.cat)?.name ?? "Bez kategorije";
      return {
        title: "Obrisati budžet?",
        text: `Budžet za kategoriju „${name}“ bit će uklonjen. Tvoje transakcije ostaju netaknute.`,
        confirmLabel: "Obriši budžet",
        destructive: true,
        onConfirm: () => {
          useFiluza.getState().deleteBudget(id);
          toast("Budžet je obrisan.");
        },
      };
    }
    case "deleteCat": {
      const c = s.cats.find((x) => x.id === id);
      if (!c) return null;
      const n = s.txs.filter((t) => t.cat === id).length;
      if (n > 0) {
        return {
          title: "Kategorija se ne može obrisati",
          text: `Kategorija „${c.name}“ ima ${n} ${plural(n, "povezanu transakciju", "povezane transakcije", "povezanih transakcija")}. Da bi tvoja historija ostala tačna, prvo premjesti ili obriši te transakcije.`,
          confirmLabel: "Razumijem",
          cancelLabel: null,
        };
      }
      return {
        title: "Obrisati kategoriju?",
        text: `Kategorija „${c.name}“ nema povezanih transakcija i bit će trajno obrisana.`,
        confirmLabel: "Obriši kategoriju",
        destructive: true,
        onConfirm: () => {
          useFiluza.getState().deleteCat(id);
          toast("Kategorija je obrisana.");
        },
      };
    }
    case "deleteGoal": {
      const g = s.goals.find((x) => x.id === id);
      if (!g) return null;
      return {
        title: "Obrisati cilj?",
        text: `Cilj „${g.name}“ i njegova historija uplata bit će trajno obrisani.`,
        confirmLabel: "Obriši cilj",
        destructive: true,
        onConfirm: () => {
          useFiluza.getState().deleteGoal(id);
          toast("Cilj je obrisan.");
        },
      };
    }
    case "goalDone": {
      const g = s.goals.find((x) => x.id === id);
      if (!g) return null;
      return {
        title: "Označiti cilj kao ostvaren?",
        text: `Cilj „${g.name}“ bit će označen kao ostvaren. Historija uplata ostaje sačuvana.`,
        confirmLabel: "Označi kao ostvaren",
        onConfirm: () => {
          const st = useFiluza.getState();
          st.updateGoal(id, { done: true });
          st.pushNotif({
            icon: "circle-check",
            tone: "green",
            text: `Cilj „${g.name}“ je označen kao ostvaren.`,
            time: "Upravo",
          });
          toast("Bravo! Cilj je ostvaren.");
        },
      };
    }
    default:
      return null;
  }
}
