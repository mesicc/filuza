"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, IconTile } from "@/components/ui/primitives";
import { txCount } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { km, round2 } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useCats, useFiluza, useTxs } from "@/lib/store";
import type { TxType } from "@/lib/types";
import { ScreenHeader } from "../ScreenHeader";

const SECTIONS: { type: TxType; title: string; icon: string; tile: string; tone: string }[] = [
  { type: "prihod", title: "Prihodi", icon: "arrow-down-left", tile: "bg-income-soft text-income-strong", tone: "text-income-text" },
  { type: "rashod", title: "Rashodi", icon: "arrow-up-right", tile: "bg-expense-soft text-expense-strong", tone: "text-expense-text" },
];

export function Kategorije() {
  const txs = useTxs();
  const cats = useCats();
  const openModal = useFiluza((s) => s.openModal);

  const stats = useMemo(() => {
    const map = new Map<string, { n: number; sum: number }>();
    for (const t of txs) {
      const s = map.get(t.cat) ?? { n: 0, sum: 0 };
      s.n += 1;
      s.sum += t.amount;
      map.set(t.cat, s);
    }
    return map;
  }, [txs]);

  return (
    <>
      <ScreenHeader
        title="Kategorije"
        sub="Organizuj prihode i rashode na svoj način."
        action={
          <Button onClick={() => openModal("cat", { type: "rashod" })}>
            <Plus size={18} aria-hidden="true" />
            Nova kategorija
          </Button>
        }
      />

      <div className="grid gap-8">
        {SECTIONS.map((sec) => {
          const list = cats.filter((c) => c.type === sec.type);
          return (
            <section key={sec.type} aria-labelledby={`kat-${sec.type}`}>
              <div className="mb-4 flex items-center gap-3">
                <span aria-hidden="true" className={cn("grid size-9 shrink-0 place-items-center rounded-[10px]", sec.tile)}>
                  <Icon name={sec.icon} size={18} />
                </span>
                <h2
                  id={`kat-${sec.type}`}
                  className="tnum flex-1 font-display text-[19px] leading-6 font-semibold tracking-[-0.015em] text-ink"
                >
                  {sec.title} ({list.length})
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={`Dodaj kategoriju: ${sec.title.toLowerCase()}`}
                  onClick={() => openModal("cat", { type: sec.type })}
                >
                  <Plus size={16} aria-hidden="true" />
                  Dodaj
                </Button>
              </div>

              <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(240px,100%),1fr))]">
                {list.map((c) => {
                  const s = stats.get(c.id) ?? { n: 0, sum: 0 };
                  return (
                    <li key={c.id}>
                      <Card small className="flex h-full items-start gap-3.5 p-4 tb:p-[18px]">
                        <IconTile icon={c.icon} color={c.color} size={46} />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[15px] leading-[22px] font-bold text-ink" title={c.name}>
                            {c.name}
                          </h3>
                          <p className="tnum text-[12.5px] leading-[18px] text-ink-2">{txCount(s.n)}</p>
                          <p className={cn("amount mt-1.5 truncate text-[15px] leading-[22px]", sec.tone)}>
                            {km(round2(s.sum))}
                          </p>
                        </div>
                        <div className="-my-1.5 -mr-2 flex shrink-0 flex-col">
                          <IconButton
                            label={`Uredi kategoriju ${c.name}`}
                            size={36}
                            onClick={() => openModal("cat", { id: c.id, type: c.type })}
                          >
                            <Icon name="pencil" size={18} />
                          </IconButton>
                          <IconButton
                            label={`Obriši kategoriju ${c.name}`}
                            size={36}
                            onClick={() => openModal("deleteCat", { id: c.id })}
                            className="hover:bg-expense-soft hover:text-expense-strong"
                          >
                            <Icon name="trash-2" size={18} />
                          </IconButton>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
