"use client";

import { CaretLeft, CaretRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, IconTile, ProgressBar } from "@/components/ui/primitives";
import { budgetsFor, catOf, spentByCat, usedPct } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { MIN_DATE, MONTHS, TODAY, addMonths, parts } from "@/lib/dates";
import { km, round2 } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useBudgets, useCats, useFiluza, useTxs } from "@/lib/store";
import { useGrow } from "@/lib/useGrow";
import { ScreenHeader } from "../ScreenHeader";
import { EmptyState, budgetTone } from "../common";

export function Budzeti() {
  const txs = useTxs();
  const cats = useCats();
  const budgets = useBudgets();
  const month = useFiluza((s) => s.budgetMonth);
  const setMonth = useFiluza((s) => s.setBudgetMonth);
  const openModal = useFiluza((s) => s.openModal);
  const on = useGrow(month);

  const { y, m } = parts(`${month}-01`);
  const monthName = MONTHS[m - 1];
  const shift = (dir: number) => setMonth(addMonths(`${month}-01`, dir).slice(0, 7));

  const rows = useMemo(() => {
    const spent = spentByCat(txs, month);
    return budgetsFor(budgets, month).map((b) => {
      const s = spent.get(b.cat) ?? 0;
      return { b, cat: catOf(cats, b.cat), spent: s, pct: usedPct(s, b.limit) };
    });
  }, [txs, cats, budgets, month]);

  const limit = round2(rows.reduce((s, r) => s + r.b.limit, 0));
  const spent = round2(rows.reduce((s, r) => s + r.spent, 0));
  const left = round2(limit - spent);
  const pct = usedPct(spent, limit);
  const reached = rows.filter((r) => r.pct >= 100).map((r) => r.cat.name);
  const near = rows.filter((r) => r.pct >= 80 && r.pct < 100).map((r) => r.cat.name);

  const create = (
    <Button onClick={() => openModal("budget")}>
      <Plus size={18} aria-hidden="true" />
      Kreiraj budžet
    </Button>
  );

  return (
    <>
      <ScreenHeader
        title="Tvoji budžeti"
        sub="Postavi granice potrošnje i prati koliko ti je još ostalo."
        action={create}
      />

      <div className="grid gap-5">
        <div className="flex items-center gap-2">
          <IconButton bordered size={44} label="Prethodni mjesec" disabled={month <= MIN_DATE.slice(0, 7)} onClick={() => shift(-1)}>
            <CaretLeft size={18} aria-hidden="true" />
          </IconButton>
          <p
            aria-live="polite"
            className="min-w-[150px] flex-1 text-center font-display text-[18px] leading-6 font-semibold tracking-[-0.015em] text-ink tb:flex-none"
          >
            {monthName} {y}
          </p>
          <IconButton bordered size={44} label="Sljedeći mjesec" disabled={month >= TODAY.slice(0, 7)} onClick={() => shift(1)}>
            <CaretRight size={18} aria-hidden="true" />
          </IconButton>
        </div>

        {rows.length === 0 ? (
          <Card>
            <EmptyState
              icon="piggy-bank"
              title="Još nemaš postavljen budžet."
              text={
                month === TODAY.slice(0, 7)
                  ? "Kreiraj svoj prvi budžet i odredi koliko želiš potrošiti ovog mjeseca."
                  : undefined
              }
              action={create}
            />
          </Card>
        ) : (
          <>
            {/* Sažetak */}
            <Card>
              <h2 className="sr-only">Sažetak budžeta</h2>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
                {(
                  [
                    ["Mjesečni budžet", km(limit), "text-ink"],
                    ["Potrošeno", km(spent), "text-expense-text"],
                    ["Preostalo", km(left), left >= 0 ? "text-income-text" : "text-expense-text"],
                  ] as const
                ).map(([label, value, tone]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-[13.5px] leading-5 text-ink-2">{label}</dt>
                    <dd className={cn("amount mt-0.5 truncate text-[clamp(22px,2.2vw,28px)] leading-[1.2]", tone)}>{value}</dd>
                  </div>
                ))}
              </dl>
              <ProgressBar
                className="mt-5"
                height={12}
                value={pct}
                on={on}
                tone={budgetTone(pct)}
                label={`Ukupni budžet: ${pct}% iskorišteno`}
              />
              <p className="tnum mt-2 text-[13.5px] leading-5 text-ink-2">{pct}% iskorišteno</p>
              {(reached.length > 0 || near.length > 0) && (
                <p className="mt-4 flex items-start gap-2.5 rounded-control border border-soft-2 bg-bg px-3.5 py-3 text-[14px] leading-5 text-ink">
                  <Icon name="info" size={20} className="shrink-0 text-accent" />
                  <span>
                    {reached.length > 0 && <>Dostignut limit: {reached.join(", ")}. </>}
                    {near.length > 0 && <>Blizu limita: {near.join(", ")}.</>}
                  </span>
                </p>
              )}
            </Card>

            {/* Kartice */}
            <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))]">
              {rows.map(({ b, cat, spent: s, pct: p }) => {
                const rest = round2(b.limit - s);
                return (
                  <li key={b.id}>
                    <Card className="flex h-full flex-col">
                      <div className="flex items-start gap-3">
                        <IconTile icon={cat.icon} color={cat.color} size={44} />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-display text-[18px] leading-6 font-semibold tracking-[-0.015em] text-ink">
                            {cat.name}
                          </h3>
                          <p className="mt-0.5 flex items-center gap-1 text-[12.5px] leading-[18px] text-ink-2">
                            {b.recurring ? (
                              <>
                                <Icon name="repeat" size={16} />
                                Svaki mjesec
                              </>
                            ) : (
                              `Samo ${MONTHS[parts(`${b.month}-01`).m - 1].toLowerCase()}`
                            )}
                          </p>
                        </div>
                        <div className="-mt-1 -mr-2 flex shrink-0">
                          <IconButton
                            label={`Uredi budžet ${cat.name}`}
                            size={36}
                            onClick={() => openModal("budget", { id: b.id })}
                          >
                            <Icon name="pencil" size={18} />
                          </IconButton>
                          <IconButton
                            label={`Obriši budžet ${cat.name}`}
                            size={36}
                            onClick={() => openModal("deleteBudget", { id: b.id })}
                            className="hover:bg-expense-soft hover:text-expense-strong"
                          >
                            <Icon name="trash-2" size={18} />
                          </IconButton>
                        </div>
                      </div>

                      <p className="tnum mt-5 text-[14px] leading-6 text-ink-2">
                        <strong className="amount text-[20px] text-ink">{km(s)}</strong> od {km(b.limit)}
                      </p>
                      <ProgressBar
                        className="mt-2.5"
                        height={10}
                        value={p}
                        on={on}
                        tone={budgetTone(p)}
                        label={`Budžet ${cat.name}: ${p}% iskorišteno`}
                      />
                      <div className="tnum mt-2 flex flex-wrap items-baseline justify-between gap-x-3 text-[13px] leading-5 text-ink-2">
                        <span>{p}% iskorišteno</span>
                        {rest >= 0 ? (
                          <span>
                            Preostalo: <strong className="amount text-[13.5px] text-ink">{km(rest)}</strong>
                          </span>
                        ) : (
                          <span className="text-expense-strong">
                            Prekoračeno: <strong className="amount text-[13.5px]">{km(-rest)}</strong>
                          </span>
                        )}
                      </div>

                      {p >= 100 ? (
                        <p className="mt-4 flex items-start gap-2 rounded-control bg-expense-soft px-3 py-2.5 text-[13.5px] leading-5 font-medium text-expense-strong">
                          <Icon name="circle-alert" size={18} className="mt-px shrink-0" />
                          Budžet je dostignut za ovaj mjesec.
                        </p>
                      ) : p >= 80 ? (
                        <p className="mt-4 flex items-start gap-2 text-[13.5px] leading-5 font-medium text-warn">
                          <Icon name="triangle-alert" size={18} className="mt-px shrink-0" />
                          Blizu si limita. Uspori malo s potrošnjom.
                        </p>
                      ) : null}
                    </Card>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
