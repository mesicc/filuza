"use client";

import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { EmptyState } from "@/components/app/common";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { goalSaved, idNum } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { km, nkm, parseAmount, round2 } from "@/lib/format";
import { useFiluza, useFmt } from "@/lib/store";
import type { ModalState } from "@/lib/types";
import { AmountField, GoalHead, focusFirstInvalid } from "./parts";

type Mode = "add" | "withdraw";

const MODES = [
  {
    value: "add",
    label: (
      <span className="flex items-center justify-center gap-1.5">
        <Plus size={16} aria-hidden="true" />
        Dodaj novac
      </span>
    ),
  },
  {
    value: "withdraw",
    label: (
      <span className="flex items-center justify-center gap-1.5">
        <Minus size={16} aria-hidden="true" />
        Povuci novac
      </span>
    ),
  },
] as const;

const QUICK = [20, 50, 100, 250];

/** D) Uplata na cilj ili povlačenje s cilja. */
export function GoalMoneyModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  const goal = useFiluza((s) => s.goals.find((g) => g.id === modal.id));
  const toast = useToast();
  const formId = useId();
  const [mode, setMode] = useState<Mode>(modal.kind === "goalWithdraw" ? "withdraw" : "add");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();

  if (!goal) return null;
  const saved = goalSaved(goal);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!goal) return;
    const value = parseAmount(amount);
    let err: string | undefined;
    if (!amount.trim()) err = "Upiši iznos.";
    else if (value === null || value <= 0) err = "Iznos mora biti veći od 0.";
    else if (mode === "withdraw" && value > saved) err = `Na cilju je trenutno ${km(saved)}.`;
    setError(err);
    if (err || value === null) {
      focusFirstInvalid(formId);
      return;
    }

    const store = useFiluza.getState();
    const after = round2(saved + (mode === "add" ? value : -value));
    const half = goal.target / 2;

    if (mode === "add") {
      store.addGoalEntry(goal.id, value, note.trim() || "Uplata");
      toast(`Dodano ${km(value)} cilju „${goal.name}“.`);
      if (saved < goal.target && after >= goal.target) {
        store.pushNotif({
          icon: "sparkles",
          tone: "green",
          text: `Cilj „${goal.name}“ je dostignut. Čestitamo!`,
          time: "Upravo",
        });
      } else if (saved < half && after >= half) {
        store.pushNotif({
          icon: "sparkles",
          tone: "green",
          text: `Ostvario si 50% cilja „${goal.name.toLocaleLowerCase("bs")}“.`,
          time: "Upravo",
        });
      }
    } else {
      store.addGoalEntry(goal.id, -value, note.trim() || "Povlačenje");
      if (after < goal.target && goal.done) store.updateGoal(goal.id, { done: false });
      toast(`Povučeno ${km(value)} s cilja „${goal.name}“.`);
    }
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={440}
      title={mode === "add" ? "Dodaj novac cilju" : "Povuci novac s cilja"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Otkaži
          </Button>
          <Button type="submit" form={formId}>
            {mode === "add" ? "Dodaj novac" : "Povuci novac"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="grid gap-[18px]">
        <GoalHead goal={goal} saved={saved} />
        <Segmented
          block
          label="Vrsta promjene"
          options={MODES}
          value={mode}
          onChange={(m) => {
            setMode(m);
            setError(undefined);
          }}
        />
        <div>
          <AmountField
            big
            autoFocusField
            label="Iznos"
            placeholder="0,00"
            value={amount}
            error={error}
            onChange={(v) => {
              setAmount(v);
              setError(undefined);
            }}
          />
          <div role="group" aria-label="Brzi iznosi" className="mt-2.5 flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setAmount(String(q));
                  setError(undefined);
                }}
                className={cn(
                  "tnum h-9 rounded-full border px-3.5 text-[13.5px] font-semibold transition-colors duration-150 max-tb:h-11",
                  parseAmount(amount) === q
                    ? "border-accent bg-soft text-heading"
                    : "border-border bg-surface text-ink-2 hover:border-soft-2 hover:bg-soft hover:text-heading",
                )}
              >
                {q} KM
              </button>
            ))}
          </div>
        </div>
        <TextField
          label="Napomena (opcionalno)"
          placeholder="npr. Ostatak od plate"
          maxLength={80}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </form>
    </Modal>
  );
}

/** E) Historija uplata cilja, najnovije prvo. */
export function GoalHistoryModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  const goal = useFiluza((s) => s.goals.find((g) => g.id === modal.id));
  const fmt = useFmt();
  if (!goal) return null;

  const entries = [...goal.history].sort((a, b) =>
    a.date !== b.date ? (a.date < b.date ? 1 : -1) : idNum(b.id.split("e")[1] ?? "") - idNum(a.id.split("e")[1] ?? ""),
  );

  return (
    <Modal
      open
      onClose={onClose}
      width={460}
      title="Historija uplata"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Zatvori
        </Button>
      }
    >
      <GoalHead goal={goal} saved={goalSaved(goal)} />
      {entries.length === 0 ? (
        <EmptyState compact icon="sprout" title="Još nema uplata. Prva uplata je najvažnija!" />
      ) : (
        <ul className="mt-3">
          {entries.map((e) => {
            const plus = e.amount >= 0;
            return (
              <li key={e.id} className="flex items-center gap-3 border-b border-divider py-3 last:border-b-0">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-[10px]",
                    plus ? "bg-income-soft text-income-strong" : "bg-expense-soft text-expense-strong",
                  )}
                >
                  {plus ? <Plus size={18} /> : <Minus size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] leading-5 font-semibold text-ink">{e.note}</span>
                  <span className="tnum block text-[12.5px] leading-[18px] text-ink-2">{fmt.date(e.date)}</span>
                </span>
                <span className={cn("amount text-[14.5px]", plus ? "text-income-text" : "text-expense-text")}>
                  {nkm(e.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
