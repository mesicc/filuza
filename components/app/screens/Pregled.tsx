"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import { BarLineChart } from "@/components/charts/BarLineChart";
import { Donut } from "@/components/charts/Donut";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Card, IconTile, ProgressBar } from "@/components/ui/primitives";
import {
  balanceAt,
  budgetsFor,
  byNewest,
  catOf,
  hasToday,
  inRange,
  pctChange,
  periodLabel,
  periodOf,
  shiftAnchor,
  signedPct,
  spentByCat,
  totals,
  txCount,
  usedPct,
} from "@/lib/calc";
import { cn } from "@/lib/cn";
import { buildColumns } from "@/lib/columns";
import { MONTHS, TODAY, daysInMonth, parts } from "@/lib/dates";
import { km, kmS, nkm, pctS, round2, skm, vocative } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useBudgets, useCats, useFiluza, useFmt, useTxs } from "@/lib/store";
import type { PMode, Transaction, TxPeriod } from "@/lib/types";
import { useGrow } from "@/lib/useGrow";
import { Kpi, changeChip } from "../Kpi";
import { PeriodNav } from "../PeriodNav";
import { ScreenHeader } from "../ScreenHeader";
import { CardHead, EmptyState, FirstTxEmpty, LinkButton, TypeChip, amountTone, budgetTone } from "../common";

const MODES = [
  { value: "day", label: "Dnevno" },
  { value: "month", label: "Mjesečno" },
  { value: "year", label: "Godišnje" },
] as const;

const WORDS: Record<PMode, { title: string; thisP: string; prevGen: string; prev: string }> = {
  day: { title: "Tvoje finansije danas", thisP: "ovaj dan", prevGen: "prethodnog dana", prev: "prethodni dan" },
  month: { title: "Tvoj mjesečni pregled", thisP: "ovaj mjesec", prevGen: "prethodnog mjeseca", prev: "prethodni mjesec" },
  year: { title: "Tvoj godišnji pregled", thisP: "ovu godinu", prevGen: "prethodne godine", prev: "prethodna godina" },
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const TWO_COL = "grid gap-5 dk:grid-cols-[1.65fr_1fr]";

export function Pregled() {
  const txs = useTxs();
  const ime = useFiluza((s) => s.profile.ime);
  const mode = useFiluza((s) => s.mode);
  const setMode = useFiluza((s) => s.setMode);

  return (
    <>
      <ScreenHeader
        title={`Dobro došao nazad, ${vocative(ime)}!`}
        sub="Evo kako izgledaju tvoje finansije."
        action={<Segmented block label="Period pregleda" options={MODES} value={mode} onChange={setMode} />}
      />
      {txs.length === 0 ? <FirstTxEmpty /> : <Dashboard txs={txs} mode={mode} />}
    </>
  );
}

function Dashboard({ txs, mode }: { txs: Transaction[]; mode: PMode }) {
  const cats = useCats();
  const budgets = useBudgets();
  const plan = useFiluza((s) => s.plan);
  const anchor = useFiluza((s) => s.anchor);
  const setAnchor = useFiluza((s) => s.setAnchor);
  const openModal = useFiluza((s) => s.openModal);
  const go = useFiluza((s) => s.go);
  const setTxFilter = useFiluza((s) => s.setTxFilter);
  const resetTxFilter = useFiluza((s) => s.resetTxFilter);
  const chartStyle = useFiluza((s) => s.tweaks.chartStyle);
  const fmt = useFmt();
  const w = WORDS[mode];

  const period = periodOf(mode, anchor);
  const label = periodLabel(mode, anchor, fmt.format);
  const growKey = `${mode}:${period.start}`;
  const on = useGrow(growKey);
  const { y, m } = parts(anchor);
  const today = hasToday(period);

  const d = useMemo(() => {
    const cur = inRange(txs, period.start, period.end).sort(byNewest);
    const prevP = periodOf(mode, shiftAnchor(mode, anchor, -1));
    const prev = inRange(txs, prevP.start, prevP.end);
    const t = totals(cur);
    const p = totals(prev);

    // Rashodi po kategorijama
    const byCat = new Map<string, number>();
    for (const x of cur) if (x.type === "rashod") byCat.set(x.cat, (byCat.get(x.cat) ?? 0) + x.amount);
    const catRows = [...byCat.entries()]
      .map(([id, amount]) => ({ id, amount: round2(amount), cat: catOf(cats, id) }))
      .sort((a, b) => b.amount - a.amount);

    return { cur, prev, t, p, catRows, prevP };
  }, [txs, cats, mode, anchor, period.start, period.end]);

  /* ───────── Stupci grafikona ───────── */
  const columns = useMemo(() => buildColumns(txs, { kind: mode, anchor }, fmt.long), [txs, mode, anchor, fmt]);

  const dim = daysInMonth(y, m);
  const perColumn = plan.show
    ? mode === "year"
      ? { inc: plan.inc, exp: plan.exp }
      : { inc: round2(plan.inc / dim), exp: round2(plan.exp / dim) }
    : null;
  const scale = mode === "day" ? 1 / dim : mode === "month" ? 1 : 12;
  const planInc = round2(plan.inc * scale);
  const planExp = round2(plan.exp * scale);

  const seeAll = () => {
    const map: Record<PMode, TxPeriod> = { day: "danas", month: "mjesec", year: "godina" };
    resetTxFilter();
    setTxFilter({ period: today ? map[mode] : "sve" });
    go("transakcije");
  };

  /* ───────── KPI ───────── */
  const balance = balanceAt(txs);
  const chip = (cur: number, prev: number, upIsGood: boolean) => changeChip(cur, prev, upIsGood, w.prevGen);

  /* ───────── Statistika ───────── */
  const stats: { label: string; value: string; sub: string }[] = [];
  if (d.cur.length > 0) {
    if (mode === "month") {
      const prevName = MONTHS[parts(d.prevP.start).m - 1];
      const top = d.catRows[0];
      stats.push(
        { label: "Broj transakcija", value: String(d.t.n), sub: `Prethodni mjesec: ${d.p.n}` },
        {
          label: "Prihodi vs prethodni mjesec",
          value: signedPct(pctChange(d.t.inc, d.p.inc)),
          sub: `${prevName}: ${km(d.p.inc)}`,
        },
        {
          label: "Rashodi vs prethodni mjesec",
          value: signedPct(pctChange(d.t.exp, d.p.exp)),
          sub: `${prevName}: ${km(d.p.exp)}`,
        },
        { label: "Najveća kategorija troškova", value: top ? top.cat.name : "—", sub: top ? km(top.amount) : "Nema rashoda" },
      );
    } else if (mode === "day") {
      const big = d.cur.filter((x) => x.type === "rashod").sort((a, b) => b.amount - a.amount)[0];
      stats.push(
        { label: "Broj transakcija", value: String(d.t.n), sub: `Prethodni dan: ${d.p.n}` },
        { label: "Najveći rashod dana", value: big ? km(big.amount) : "—", sub: big ? big.name : "Nema rashoda" },
        { label: "Neto vs prethodni dan", value: nkm(d.t.net - d.p.net), sub: `Prethodni dan: ${nkm(d.p.net)}` },
      );
    } else {
      const months = y === parts(TODAY).y ? parts(TODAY).m : 12;
      const per = columns.slice(0, months);
      const best = per.reduce((a, b) => (b.inc > a.inc ? b : a), per[0]);
      const worst = per.reduce((a, b) => (b.exp > a.exp ? b : a), per[0]);
      const basis = `Na osnovu ${months} ${months === 1 ? "mjeseca" : "mjeseci"}`;
      stats.push(
        { label: "Prosječni mjesečni prihodi", value: km(d.t.inc / months), sub: basis },
        { label: "Prosječni mjesečni rashodi", value: km(d.t.exp / months), sub: basis },
        { label: "Najbolji mjesec po prihodima", value: best.title.split(" ")[0], sub: km(best.inc) },
        { label: "Mjesec s najvećim rashodima", value: worst.title.split(" ")[0], sub: km(worst.exp) },
        { label: `Neto vs ${y - 1}.`, value: nkm(d.t.net - d.p.net), sub: `${y - 1}.: ${nkm(d.p.net)}` },
      );
    }
  }

  /* ───────── Donut ───────── */
  const shown = d.catRows.length > 6 ? d.catRows.slice(0, 5) : d.catRows;
  const restAmount = round2(d.catRows.slice(shown.length).reduce((s, r) => s + r.amount, 0));
  const legend = [
    ...shown.map((r) => ({ key: r.id || "bez", name: r.cat.name, color: r.cat.color, amount: r.amount })),
    ...(restAmount > 0 ? [{ key: "ostale", name: "Ostale kategorije", color: "#E8D3CA", amount: restAmount }] : []),
  ].map((r) => ({ ...r, pct: d.t.exp > 0 ? (r.amount / d.t.exp) * 100 : 0 }));

  /* ───────── Budžeti ───────── */
  const budgetMonth = mode === "year" ? (today ? TODAY.slice(0, 7) : `${y}-12`) : anchor.slice(0, 7);
  const spent = useMemo(() => spentByCat(txs, budgetMonth), [txs, budgetMonth]);
  const miniBudgets = budgetsFor(budgets, budgetMonth).slice(0, 4);
  const bm = parts(`${budgetMonth}-01`);

  const recent = mode === "day" ? d.cur : d.cur.slice(0, 6);
  const chartSub =
    mode === "month"
      ? `Po danima u mjesecu ${MONTHS[m - 1].toLowerCase()}.`
      : mode === "year"
        ? `Po mjesecima u ${y}. godini.`
        : "Zadnjih 7 dana, odabrani dan je označen.";

  return (
    <div className="grid gap-5">
      {/* 1. Traka perioda */}
      <section
        aria-label="Odabrani period"
        className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-section border border-border bg-surface p-4 shadow-card tb:px-5"
      >
        <div className="flex min-w-0 flex-1 basis-[260px] items-center gap-3.5">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-soft text-accent">
            <Icon name="calendar-days" size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[19px] leading-6 font-semibold tracking-[-0.015em] text-ink">
              {mode === "day" && anchor !== TODAY ? `Tvoje finansije za ${fmt.date(anchor)}` : w.title}
            </h2>
            <p className="tnum mt-0.5 text-[13.5px] leading-5 text-ink-2">
              {label} · {txCount(d.t.n)}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 tb:w-auto">
          <PeriodNav mode={mode} anchor={anchor} onChange={setAnchor} className="w-full tb:w-auto" />
          {!today && (
            <Button variant="secondary" onClick={() => setAnchor(TODAY)}>
              Danas
            </Button>
          )}
          <Button
            className="flex-1 tb:flex-none"
            onClick={() => openModal("tx", mode === "day" ? { date: anchor } : undefined)}
          >
            <Plus size={18} aria-hidden="true" />
            Dodaj transakciju
          </Button>
        </div>
      </section>

      {/* 2. KPI kartice */}
      <section aria-label="Sažetak" className="grid gap-4 min-[30rem]:grid-cols-2 min-[80rem]:grid-cols-4">
        <Kpi title="Ukupno stanje" icon="wallet" color="#D85A30" value={km(balance)} tone="text-ink" desc="Tvoje trenutno stanje." />
        <Kpi
          title="Ukupni prihodi"
          icon="arrow-down-left"
          color="#4F9D77"
          value={km(d.t.inc)}
          tone="text-income-text"
          desc="Ukupni prihodi u odabranom periodu."
          chip={chip(d.t.inc, d.p.inc, true)}
        />
        <Kpi
          title="Ukupni rashodi"
          icon="arrow-up-right"
          color="#C96B62"
          value={km(d.t.exp)}
          tone="text-expense-text"
          desc="Ukupni rashodi u odabranom periodu."
          chip={chip(d.t.exp, d.p.exp, false)}
        />
        <Kpi
          title="Neto razlika"
          icon="scale"
          color={d.t.net >= 0 ? "#4F9D77" : "#C96B62"}
          value={nkm(d.t.net)}
          tone={d.t.net >= 0 ? "text-income-text" : "text-expense-text"}
          desc="Prihodi minus rashodi."
          chip={chip(d.t.net, d.p.net, true)}
        />
      </section>

      {/* 3. Traka statistike */}
      {stats.length > 0 && (
        <section
          aria-label="Statistika perioda"
          className="overflow-hidden rounded-section border border-border bg-surface shadow-card"
        >
          <dl className="-mr-px -mb-px grid [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
            {stats.map((s) => (
              <div key={s.label} className="min-w-0 border-r border-b border-border px-[18px] py-4 tb:px-5">
                <dt className="text-[13px] leading-[18px] text-ink-2">{s.label}</dt>
                <dd className="amount mt-1 truncate text-[20px] leading-7 text-ink" title={s.value}>
                  {s.value}
                </dd>
                <dd className="tnum mt-0.5 truncate text-[13px] leading-[18px] text-ink-2" title={s.sub}>
                  {s.sub}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* 4. Red 1 */}
      <div className={TWO_COL}>
        <Card className="min-w-0">
          <CardHead
            title="Prihodi i rashodi"
            sub={`Pregled kretanja tvog novca. ${chartSub}`}
            action={
              <ul className="flex items-center gap-3.5 text-[12.5px] leading-5 font-medium text-ink-2">
                <li className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px] bg-income" />
                  Prihodi
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px] bg-expense" />
                  Rashodi
                </li>
                {perColumn && (
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 border-t-2 border-dashed border-ink-2" />
                    Plan
                  </li>
                )}
              </ul>
            }
          />

          {plan.show && d.cur.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <PlanCard
                title={`Planirani prihodi za ${w.thisP}`}
                value={d.t.inc}
                target={planInc}
                on={on}
                kind="inc"
              />
              <PlanCard title={`Limit rashoda za ${w.thisP}`} value={d.t.exp} target={planExp} on={on} kind="exp" />
            </div>
          )}

          <div className="mt-6">
            <BarLineChart
              columns={columns}
              style={chartStyle}
              plan={perColumn}
              growKey={growKey}
              label={`Prihodi i rashodi, ${label}: prihodi ${km(d.t.inc)}, rashodi ${km(d.t.exp)}.`}
            />
          </div>
        </Card>

        <Card className="min-w-0">
          <CardHead title="Gdje odlazi tvoj novac?" sub={`Struktura troškova za ${label.replace(/\.$/, "")}.`} />
          {legend.length === 0 ? (
            <div className="mt-5">
              <EmptyState compact dashed title="Nema rashoda u ovom periodu." />
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center dk:flex-col min-[1380px]:flex-row">
              <Donut
                on={on}
                segments={legend.map((l) => ({ key: l.key, color: l.color, pct: l.pct }))}
                label={`Struktura troškova: ${legend.map((l) => `${l.name} ${pctS(l.pct)}`).join(", ")}.`}
              >
                <p className="text-[12.5px] leading-4 text-ink-2">Ukupno</p>
                <p className={cn("amount mt-0.5 text-ink", d.t.exp >= 10000 ? "text-[15px]" : "text-[17px]")}>
                  {km(d.t.exp)}
                </p>
              </Donut>
              <ul className="grid w-full min-w-0 flex-1 gap-2.5">
                {legend.map((l) => (
                  <li key={l.key} className="flex items-center gap-2.5 text-[13.5px] leading-5">
                    <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px]" style={{ background: l.color }} />
                    <span className="min-w-0 flex-1 truncate text-ink">{l.name}</span>
                    <span className="tnum w-[46px] shrink-0 text-right text-ink-2">{pctS(l.pct)}</span>
                    <span className="amount w-[96px] shrink-0 text-right text-[13.5px] text-ink">{km(l.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* 5. Red 2 */}
      <div className={TWO_COL}>
        <Card className="min-w-0">
          <CardHead
            title={mode === "day" ? "Transakcije tog dana" : "Posljednje transakcije"}
            sub={mode === "day" ? `${txCount(d.t.n)} · ${fmt.date(anchor)}` : "Najnovije u odabranom periodu"}
            action={
              <LinkButton icon="arrow-right" onClick={seeAll}>
                Pogledaj sve
              </LinkButton>
            }
          />
          {recent.length === 0 ? (
            <EmptyState compact icon="coffee" title="Nema transakcija u ovom periodu. Miran dan za novčanik." />
          ) : (
            <>
              <div className="-mx-6 mt-4 hidden overflow-x-auto px-6 tb:block">
                <table className="w-full min-w-[600px] border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="text-[12.5px] leading-4 text-ink-2">
                      {["Naziv", "Kategorija", "Datum", "Tip"].map((h) => (
                        <th key={h} scope="col" className="border-b border-divider pr-4 pb-2.5 font-semibold">
                          {h}
                        </th>
                      ))}
                      <th scope="col" className="border-b border-divider pb-2.5 text-right font-semibold">
                        Iznos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((t) => {
                      const cat = catOf(cats, t.cat);
                      return (
                        <tr
                          key={t.id}
                          onClick={() => openModal("tx", { id: t.id })}
                          className="cursor-pointer transition-colors duration-150 hover:bg-bg"
                        >
                          <td className="max-w-[220px] border-b border-divider py-2.5 pr-4">
                            <button
                              type="button"
                              aria-label={`Uredi ${t.name}`}
                              className="-my-1.5 block min-h-8 max-w-full truncate rounded-[4px] text-left font-semibold text-ink"
                            >
                              {t.name}
                            </button>
                          </td>
                          <td className="border-b border-divider py-2.5 pr-4">
                            <span className="flex items-center gap-2.5 text-ink-2">
                              <IconTile icon={cat.icon} color={cat.color} size={28} />
                              <span className="truncate">{cat.name}</span>
                            </span>
                          </td>
                          <td className="tnum border-b border-divider py-2.5 pr-4 whitespace-nowrap text-ink-2">
                            {fmt.date(t.date)}
                          </td>
                          <td className="border-b border-divider py-2.5 pr-4">
                            <TypeChip type={t.type} />
                          </td>
                          <td className={cn("amount border-b border-divider py-2.5 text-right text-[14.5px]", amountTone(t.type))}>
                            {skm(t.amount, t.type)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <ul className="mt-3 tb:hidden">
                {recent.map((t) => {
                  const cat = catOf(cats, t.cat);
                  return (
                    <li key={t.id} className="border-b border-divider last:border-b-0">
                      <button
                        type="button"
                        onClick={() => openModal("tx", { id: t.id })}
                        className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-control px-2 py-2.5 text-left transition-colors duration-150 active:bg-bg"
                      >
                        <IconTile icon={cat.icon} color={cat.color} size={40} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14.5px] leading-5 font-semibold text-ink">{t.name}</span>
                          <span className="tnum block truncate text-[12.5px] leading-[18px] text-ink-2">
                            {cat.name} · {fmt.date(t.date)}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className={cn("amount block text-[14.5px] leading-5", amountTone(t.type))}>
                            {skm(t.amount, t.type)}
                          </span>
                          <span className="block text-[12px] leading-[18px] text-ink-2">
                            {t.type === "prihod" ? "Prihod" : "Rashod"}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>

        <Card className="min-w-0">
          <CardHead
            title="Mjesečni budžet"
            sub={`${MONTHS[bm.m - 1]} ${bm.y}`}
            action={
              <LinkButton icon="arrow-right" onClick={() => go("budzeti")}>
                Pogledaj sve
              </LinkButton>
            }
          />
          {miniBudgets.length === 0 ? (
            <EmptyState compact icon="piggy-bank" title="Još nemaš postavljen budžet." />
          ) : (
            <ul className="mt-5 grid gap-5">
              {miniBudgets.map((b) => {
                const cat = catOf(cats, b.cat);
                const s = spent.get(b.cat) ?? 0;
                const pct = usedPct(s, b.limit);
                return (
                  <li key={b.id}>
                    <div className="flex items-center gap-2.5">
                      <IconTile icon={cat.icon} color={cat.color} size={32} />
                      <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-ink">{cat.name}</span>
                      <span className="amount text-[13.5px] text-ink">
                        {kmS(s)} / {kmS(b.limit)} KM
                      </span>
                    </div>
                    <ProgressBar
                      className="mt-2.5"
                      height={10}
                      value={pct}
                      on={on}
                      tone={budgetTone(pct)}
                      label={`Budžet ${cat.name}: ${pct}% iskorišteno`}
                    />
                    <div className="mt-1.5 flex items-center justify-between gap-3 text-[12.5px] leading-[18px]">
                      <span className="tnum text-ink-2">{pct}% iskorišteno</span>
                      {pct >= 100 ? (
                        <span className="flex items-center gap-1 font-semibold text-expense-strong">
                          <Icon name="circle-alert" size={16} />
                          Limit dostignut
                        </span>
                      ) : pct >= 80 ? (
                        <span className="flex items-center gap-1 font-semibold text-warn">
                          <Icon name="triangle-alert" size={16} />
                          Blizu limita
                        </span>
                      ) : (
                        <span className="tnum text-ink-2">Preostalo: {km(b.limit - s)}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── Dijelovi ───────────────────────── */

function PlanCard({
  title,
  value,
  target,
  on,
  kind,
}: {
  title: string;
  value: number;
  target: number;
  on: boolean;
  kind: "inc" | "exp";
}) {
  const pct = target > 0 ? (value / target) * 100 : 0;
  const diff = round2(target - value);
  let color = "#4F9D77";
  let note: string;
  let good: boolean;
  if (kind === "inc") {
    good = diff <= 0;
    note = good ? "Plan ostvaren" : `Do plana: ${km(diff)}`;
  } else {
    good = diff >= 0;
    note = good ? `Preostalo: ${km(diff)}` : `Prekoračeno za ${km(-diff)}`;
    if (pct > 100) color = "#C96B62";
    else if (pct >= 80) color = "#E6AA4E";
  }
  return (
    <div className="rounded-[16px] border border-divider bg-bg p-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] leading-[18px] text-ink-2">{cap(title)}</p>
        <p className="tnum text-[13px] leading-[18px] font-semibold text-ink">{Math.round(pct)}%</p>
      </div>
      <p className="tnum mt-1.5 text-[13.5px] leading-5 text-ink-2">
        <strong className="amount text-[15px] text-ink">{km(value)}</strong> od {km(target)}
      </p>
      <ProgressBar className="mt-2.5" track="#FFFFFF" height={6} value={pct} on={on} color={color} label={`${title}: ${Math.round(pct)}%`} />
      <p
        className={cn(
          "tnum mt-2 text-[12.5px] leading-[18px] font-medium",
          good ? "text-income-strong" : kind === "exp" ? "text-expense-strong" : "text-ink-2",
        )}
      >
        {note}
      </p>
    </div>
  );
}
