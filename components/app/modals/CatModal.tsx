"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/lib/icons";
import { useFiluza } from "@/lib/store";
import { CAT_COLORS, CAT_ICONS } from "@/lib/types";
import type { ModalState, TxType } from "@/lib/types";
import { ChoiceGroup, IconPicker, focusFirstInvalid } from "./parts";

const TYPES = [
  { value: "rashod", label: "Rashod" },
  { value: "prihod", label: "Prihod" },
] as const;

export function CatModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
  const cats = useFiluza((s) => s.cats);
  const existing = modal.id ? cats.find((c) => c.id === modal.id) : undefined;
  const hasTxs = useFiluza((s) => (existing ? s.txs.some((t) => t.cat === existing.id) : false));
  const toast = useToast();
  const formId = useId();
  const typeLabel = useId();

  const [name, setName] = useState(existing?.name ?? "");
  const [type, setType] = useState<TxType>(existing?.type ?? modal.type ?? "rashod");
  const [icon, setIcon] = useState(existing?.icon ?? "coffee");
  const [color, setColor] = useState(existing?.color ?? "#D85A30");
  const [error, setError] = useState<string | undefined>();

  // Postojeća boja izvan palete (početne kategorije) ostaje ponuđena.
  const colors = (CAT_COLORS as readonly string[]).includes(color) ? CAT_COLORS : [color, ...CAT_COLORS];

  function submit(e: FormEvent) {
    e.preventDefault();
    const title = name.trim();
    const keepType = existing && hasTxs && type !== existing.type;
    const finalType = keepType ? existing.type : type;
    let err: string | undefined;
    if (!title) err = "Upiši naziv kategorije.";
    else if (
      cats.some(
        (c) =>
          c.id !== existing?.id &&
          c.type === finalType &&
          c.name.toLocaleLowerCase("bs") === title.toLocaleLowerCase("bs"),
      )
    ) {
      err = "Kategorija s tim nazivom već postoji.";
    }
    setError(err);
    if (err) {
      focusFirstInvalid(formId);
      return;
    }

    const store = useFiluza.getState();
    if (existing) {
      store.updateCat(existing.id, { name: title, type: finalType, icon, color });
      toast(keepType ? "Sačuvano. Tip nije promijenjen jer kategorija ima transakcije." : "Kategorija je ažurirana.");
    } else {
      store.addCat({ name: title, type, icon, color });
      toast("Kategorija je kreirana.");
    }
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      width={520}
      title={existing ? "Uredi kategoriju" : "Nova kategorija"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Otkaži
          </Button>
          <Button type="submit" form={formId}>
            Sačuvaj kategoriju
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="grid gap-[18px]">
        <div className="flex items-center gap-3.5 rounded-[16px] bg-bg p-3.5">
          <span
            aria-hidden="true"
            className="grid size-[52px] shrink-0 place-items-center rounded-[14px] text-white transition-colors duration-150"
            style={{ background: color }}
          >
            <Icon name={icon} size={24} />
          </span>
          <p className="min-w-0">
            <span className="block text-[12.5px] leading-[18px] text-ink-2">Pregled</span>
            <span className="block truncate text-[16px] leading-6 font-semibold text-ink">
              {name.trim() || "Naziv kategorije"}
            </span>
          </p>
        </div>

        <TextField
          data-autofocus=""
          label="Naziv"
          placeholder="npr. Kafa"
          maxLength={40}
          value={name}
          error={error}
          onChange={(e) => {
            setName(e.target.value);
            setError(undefined);
          }}
        />

        <div>
          <p id={typeLabel} className="mb-1.5 text-[13.5px] font-semibold text-ink">
            Tip
          </p>
          <Segmented
            block
            label="Tip"
            options={TYPES}
            value={type}
            onChange={(t) => {
              setType(t);
              setError(undefined);
            }}
          />
        </div>

        <IconPicker label="Ikona" icons={CAT_ICONS} value={icon} onChange={setIcon} />

        <ChoiceGroup label="Boja" className="flex flex-wrap gap-3.5 p-1.5">
          {colors.map((c) => {
            const active = c === color;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`Boja ${c}`}
                onClick={() => setColor(c)}
                className="grid size-9 place-items-center rounded-full text-white transition-[box-shadow,transform] duration-150 hover:scale-105 active:scale-95"
                style={{ background: c, boxShadow: active ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : undefined }}
              >
                {active && <Check size={18} aria-hidden="true" />}
              </button>
            );
          })}
        </ChoiceGroup>
      </form>
    </Modal>
  );
}
