"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { TODAY, addDays } from "@/lib/dates";
import { num, parseAmount } from "@/lib/format";
import { useFiluza } from "@/lib/store";
import { GOAL_ICONS } from "@/lib/types";
import type { ModalState } from "@/lib/types";
import { AmountField, IconPicker, focusFirstInvalid } from "./parts";

type Field = "name" | "target" | "saved" | "date";

export function GoalModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  const existing = useFiluza((s) => (modal.id ? s.goals.find((g) => g.id === modal.id) : undefined));
  const toast = useToast();
  const formId = useId();
  const tomorrow = addDays(TODAY, 1);

  const [name, setName] = useState(existing?.name ?? "");
  const [icon, setIcon] = useState(existing?.icon ?? "sprout");
  const [target, setTarget] = useState(existing ? num(existing.target) : "");
  const [date, setDate] = useState(existing?.date ?? "2027-06-01");
  const [saved, setSaved] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const clear = (f: Field) => setErrors((e) => (f in e ? { ...e, [f]: undefined } : e));

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<Field, string>> = {};
    const title = name.trim();
    const goal = parseAmount(target);
    const initial = saved.trim() ? parseAmount(saved) : 0;

    if (!title) errs.name = "Upiši naziv cilja.";
    if (!target.trim()) errs.target = "Upiši ciljani iznos.";
    else if (goal === null || goal <= 0) errs.target = "Iznos mora biti veći od 0.";
    if (!existing) {
      if (initial === null || initial < 0) errs.saved = "Upiši ispravan iznos ili ostavi prazno.";
      else if (goal !== null && goal > 0 && initial > goal) errs.saved = "Početni iznos ne može biti veći od cilja.";
    }
    if (!date) errs.date = "Odaberi očekivani datum.";
    else if (date < tomorrow) errs.date = "Datum mora biti u budućnosti.";

    setErrors(errs);
    if (Object.values(errs).some(Boolean) || goal === null) {
      focusFirstInvalid(formId);
      return;
    }

    const store = useFiluza.getState();
    if (existing) {
      store.updateGoal(existing.id, { name: title, icon, target: goal, date });
      toast("Cilj je ažuriran.");
    } else {
      const id = store.addGoal({ name: title, icon, target: goal, date });
      if (initial && initial > 0) store.addGoalEntry(id, initial, "Početni iznos");
      toast("Novi cilj je kreiran. Sretno!");
    }
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={520}
      title={existing ? "Uredi cilj" : "Novi cilj"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Otkaži
          </Button>
          <Button type="submit" form={formId}>
            Sačuvaj cilj
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="grid gap-[18px]">
        <TextField
          data-autofocus=""
          label="Naziv cilja"
          placeholder="npr. Novi laptop"
          maxLength={60}
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            clear("name");
          }}
        />
        <IconPicker label="Ikona" icons={GOAL_ICONS} value={icon} onChange={setIcon} />
        <div className="grid gap-[18px] sm:grid-cols-2 sm:gap-3.5">
          <AmountField
            label="Ciljani iznos (KM)"
            placeholder="npr. 2.000,00"
            value={target}
            error={errors.target}
            onChange={(v) => {
              setTarget(v);
              clear("target");
              clear("saved");
            }}
          />
          <TextField
            label="Očekivani datum"
            type="date"
            min={tomorrow}
            value={date}
            error={errors.date}
            onChange={(e) => {
              setDate(e.target.value);
              clear("date");
            }}
          />
        </div>
        {!existing && (
          <AmountField
            label="Već ušteđeno (opcionalno)"
            placeholder="0,00"
            value={saved}
            error={errors.saved}
            onChange={(v) => {
              setSaved(v);
              clear("saved");
            }}
          />
        )}
      </form>
    </Modal>
  );
}
