"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Select, TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { budgetsFor } from "@/lib/calc";
import { MIN_DATE } from "@/lib/dates";
import { num, parseAmount } from "@/lib/format";
import { useFiluza } from "@/lib/store";
import type { Budget, ModalState } from "@/lib/types";
import { AmountField, focusFirstInvalid } from "./parts";

type Field = "cat" | "limit" | "month";

/** Važe li dva budžeta za barem jedan isti mjesec (ponavljajući važi od svog mjeseca nadalje). */
function overlaps(a: Pick<Budget, "month" | "recurring">, b: Pick<Budget, "month" | "recurring">): boolean {
  const end = (x: typeof a) => (x.recurring ? "9999-12" : x.month);
  return a.month <= end(b) && b.month <= end(a);
}

export function BudgetModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  const cats = useFiluza((s) => s.cats).filter((c) => c.type === "rashod");
  const budgets = useFiluza((s) => s.budgets);
  const viewMonth = useFiluza((s) => s.budgetMonth);
  const existing = modal.id ? budgets.find((b) => b.id === modal.id) : undefined;
  const toast = useToast();
  const formId = useId();

  const taken = new Set(budgetsFor(budgets, viewMonth).map((b) => b.cat));
  const [cat, setCat] = useState(existing?.cat ?? cats.find((c) => !taken.has(c.id))?.id ?? cats[0]?.id ?? "");
  const [limit, setLimit] = useState(existing ? num(existing.limit) : "");
  const [month, setMonth] = useState(existing?.month ?? viewMonth);
  const [recurring, setRecurring] = useState(existing?.recurring ?? true);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const clear = (f: Field) => setErrors((e) => (f in e ? { ...e, [f]: undefined } : e));

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<Field, string>> = {};
    const value = parseAmount(limit);
    const validMonth = /^\d{4}-\d{2}$/.test(month) && month >= MIN_DATE.slice(0, 7);

    if (!cats.some((c) => c.id === cat)) errs.cat = "Odaberi kategoriju.";
    else if (validMonth && budgets.some((b) => b.id !== existing?.id && b.cat === cat && overlaps(b, { month, recurring }))) {
      errs.cat = "Za ovu kategoriju već postoji budžet.";
    }
    if (!limit.trim()) errs.limit = "Upiši maksimalni iznos.";
    else if (value === null || value <= 0) errs.limit = "Iznos mora biti veći od 0.";
    if (!validMonth) errs.month = "Odaberi mjesec.";

    setErrors(errs);
    if (Object.values(errs).some(Boolean) || value === null) {
      focusFirstInvalid(formId);
      return;
    }

    const store = useFiluza.getState();
    const data = { cat, limit: value, month, recurring };
    if (existing) {
      store.updateBudget(existing.id, data);
      toast("Budžet je ažuriran.");
    } else {
      store.addBudget(data);
      toast("Budžet je kreiran.");
    }
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={480}
      title={existing ? "Uredi budžet" : "Kreiraj budžet"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Otkaži
          </Button>
          <Button type="submit" form={formId}>
            Sačuvaj budžet
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="grid gap-[18px]">
        <Select
          label="Kategorija"
          value={cat}
          error={errors.cat}
          onChange={(e) => {
            setCat(e.target.value);
            clear("cat");
          }}
        >
          {!cats.some((c) => c.id === cat) && <option value="">Odaberi kategoriju</option>}
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <AmountField
          autoFocusField
          label="Maksimalni iznos"
          placeholder="npr. 500,00"
          value={limit}
          error={errors.limit}
          onChange={(v) => {
            setLimit(v);
            clear("limit");
          }}
        />
        <TextField
          label="Mjesec"
          type="month"
          min={MIN_DATE.slice(0, 7)}
          value={month}
          error={errors.month}
          onChange={(e) => {
            setMonth(e.target.value);
            clear("month");
            clear("cat");
          }}
        />
        <Checkbox
          className="rounded-[14px] border border-border bg-bg p-3.5"
          checked={recurring}
          onChange={(e) => {
            setRecurring(e.target.checked);
            clear("cat");
          }}
        >
          <span className="block font-semibold">Ponavljaj svaki mjesec</span>
          <span className="block text-[13px] leading-[18px] text-ink-2">
            Budžet se automatski prenosi u naredne mjesece.
          </span>
        </Checkbox>
      </form>
    </Modal>
  );
}
