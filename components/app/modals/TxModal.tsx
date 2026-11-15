"use client";

import { ArrowDownLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Select, TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { budgetsFor, spentByCat, usedPct } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { MIN_DATE, TODAY } from "@/lib/dates";
import { num, parseAmount, skm } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useFiluza } from "@/lib/store";
import { METHODS } from "@/lib/types";
import type { Method, ModalState, TxType } from "@/lib/types";
import { AmountField, ChoiceGroup, focusFirstInvalid } from "./parts";

type Field = "amount" | "name" | "cat" | "date";

const TYPE_STYLE: Record<TxType, string> = {
  prihod: "border-income bg-income-soft text-income-strong",
  rashod: "border-expense bg-expense-soft text-expense-strong",
};

export function TxModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  const cats = useFiluza((s) => s.cats);
  const existing = useFiluza((s) => (modal.id ? s.txs.find((t) => t.id === modal.id) : undefined));
  const toast = useToast();
  const formId = useId();

  const [type, setType] = useState<TxType>(existing?.type ?? modal.type ?? "rashod");
  const [amount, setAmount] = useState(existing ? num(existing.amount) : "");
  const [name, setName] = useState(existing?.name ?? "");
  const [cat, setCat] = useState(
    existing?.cat ?? (cats.some((c) => c.id === "hrana") ? "hrana" : (cats.find((c) => c.type === "rashod")?.id ?? "")),
  );
  const [date, setDate] = useState(existing?.date ?? modal.date ?? TODAY);
  const [method, setMethod] = useState<Method>(existing?.method ?? "Kartica");
  const [note, setNote] = useState(existing?.note ?? "");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const options = cats.filter((c) => c.type === type);
  const clear = (f: Field) => setErrors((e) => (f in e ? { ...e, [f]: undefined } : e));

  function changeType(next: TxType) {
    setType(next);
    if (!cats.some((c) => c.id === cat && c.type === next)) {
      setCat(cats.find((c) => c.type === next)?.id ?? "");
      clear("cat");
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<Field, string>> = {};
    const value = parseAmount(amount);
    if (!amount.trim()) errs.amount = "Upiši iznos.";
    else if (value === null || value <= 0) errs.amount = "Iznos mora biti broj veći od 0, npr. 45,50.";
    else if (value > 10_000_000) errs.amount = "Iznos je prevelik.";
    const title = name.trim();
    if (!title) errs.name = "Upiši naziv transakcije.";
    else if (title.length < 2) errs.name = "Naziv mora imati barem 2 znaka.";
    if (!options.some((c) => c.id === cat)) errs.cat = "Odaberi kategoriju.";
    if (!date) errs.date = "Odaberi datum.";
    else if (date > TODAY) errs.date = "Datum ne može biti u budućnosti.";
    else if (date < MIN_DATE) errs.date = "Datum mora biti nakon 01.01.2025.";

    setErrors(errs);
    if (Object.values(errs).some(Boolean) || value === null) {
      focusFirstInvalid(formId);
      return;
    }

    const store = useFiluza.getState();
    const month = date.slice(0, 7);
    const budget = type === "rashod" ? budgetsFor(store.budgets, month).find((b) => b.cat === cat) : undefined;
    const before = budget ? usedPct(spentByCat(store.txs, month).get(cat) ?? 0, budget.limit) : 0;

    const data = { type, amount: value, name: title, cat, date, method, note: note.trim() };
    if (existing) {
      store.updateTx(existing.id, data);
      toast("Promjene su sačuvane.");
    } else {
      store.addTx(data);
      toast("Transakcija je sačuvana.");
      store.pushNotif({
        icon: "circle-check",
        tone: "green",
        text: `Dodao si novu transakciju: ${title} (${skm(value, type)}).`,
        time: "Upravo",
      });
    }

    if (budget) {
      const after = usedPct(spentByCat(useFiluza.getState().txs, month).get(cat) ?? 0, budget.limit);
      const catName = (cats.find((c) => c.id === cat)?.name ?? "").toLocaleLowerCase("bs");
      if (before < 100 && after >= 100) {
        store.pushNotif({
          icon: "triangle-alert",
          tone: "red",
          text: `Tvoj budžet za ${catName} je dostignut.`,
          time: "Upravo",
        });
      } else if (before < 80 && after >= 80 && after < 100) {
        store.pushNotif({
          icon: "circle-alert",
          tone: "gold",
          text: `Potrošio si ${after}% budžeta za ${catName}.`,
          time: "Upravo",
        });
      }
    }
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={560}
      title={existing ? "Uredi transakciju" : "Nova transakcija"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Otkaži
          </Button>
          <Button type="submit" form={formId}>
            Sačuvaj transakciju
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="grid gap-[18px]">
        <ChoiceGroup label="Tip transakcije" className="grid grid-cols-2 gap-2.5">
          {(["prihod", "rashod"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              onClick={() => changeType(t)}
              className={cn(
                "flex h-[50px] items-center justify-center gap-2 rounded-control border text-[15px] font-semibold transition-colors duration-150",
                type === t
                  ? TYPE_STYLE[t]
                  : "border-border bg-surface text-ink-2 hover:border-soft-2 hover:bg-bg hover:text-ink",
              )}
            >
              {t === "prihod" ? <ArrowDownLeft size={20} aria-hidden="true" /> : <ArrowUpRight size={20} aria-hidden="true" />}
              {t === "prihod" ? "Prihod" : "Rashod"}
            </button>
          ))}
        </ChoiceGroup>

        <AmountField
          big
          autoFocusField
          label="Iznos"
          placeholder="0,00"
          value={amount}
          error={errors.amount}
          onChange={(v) => {
            setAmount(v);
            clear("amount");
          }}
        />

        <TextField
          label="Naziv transakcije"
          placeholder="npr. Plata, Hrana, Gorivo"
          maxLength={80}
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            clear("name");
          }}
        />

        <div className="grid gap-[18px] sm:grid-cols-2 sm:gap-3.5">
          <Select
            label="Kategorija"
            value={cat}
            error={errors.cat}
            onChange={(e) => {
              setCat(e.target.value);
              clear("cat");
            }}
          >
            {!options.some((c) => c.id === cat) && <option value="">Odaberi kategoriju</option>}
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <TextField
            label="Datum"
            type="date"
            min={MIN_DATE}
            max={TODAY}
            value={date}
            error={errors.date}
            onChange={(e) => {
              setDate(e.target.value);
              clear("date");
            }}
          />
        </div>

        <ChoiceGroup label="Način plaćanja" className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={method === m.value}
              onClick={() => setMethod(m.value)}
              className={cn(
                "flex h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-150",
                method === m.value
                  ? "border-accent bg-soft text-heading"
                  : "border-border bg-surface text-ink-2 hover:border-soft-2 hover:bg-bg hover:text-ink",
              )}
            >
              <Icon name={m.icon} size={18} />
              {m.value}
            </button>
          ))}
        </ChoiceGroup>

        <div>
          <FieldLabel htmlFor={`${formId}-note`}>Napomena (opcionalno)</FieldLabel>
          <textarea
            id={`${formId}-note`}
            rows={2}
            maxLength={200}
            placeholder="Dodaj kratku napomenu…"
            className="fz-field"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
