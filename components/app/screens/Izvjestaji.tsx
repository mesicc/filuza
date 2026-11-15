"use client";

import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { BalanceLine } from "@/components/charts/BalanceLine";
import { BarLineChart } from "@/components/charts/BarLineChart";
import { SavingsBars } from "@/components/charts/SavingsBars";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { Card, IconTile } from "@/components/ui/primitives";
import {
  balanceAt,
  byNewest,
  catOf,
  inRange,
  periodLabel,
  periodOf,
  shiftAnchor,
  totals,
  txCount,
} from "@/lib/calc";
import { cn } from "@/lib/cn";
import { buildColumns, daysBetween } from "@/lib/columns";
import { MIN_DATE, MONTHS, MONTHS_SHORT, TODAY, addDays, addMonths, parts } from "@/lib/dates";
import { csvAmount, csvLine, downloadText } from "@/lib/download";
import { km, nkm, pctS, round2 } from "@/lib/format";
import { useCats, useFiluza, useFmt, useTxs } from "@/lib/store";
import type { PMode } from "@/lib/types";
import { useGrow } from "@/lib/useGrow";
import { Kpi, changeChip } from "../Kpi";
import { PeriodNav } from "../PeriodNav";
import { ScreenHeader } from "../ScreenHeader";
import { CardHead, EmptyState } from "../common";

type RMode = PMode | "custom";

const MODES = [
  { value: "day", label: "Dan" },
  { value: "month", label: "Mjesec" },
  { value: "year", label: "Godina" },
  { value: "custom", label: "Prilagođeno" },
] as const;

const COMPARE: Record<RMode, { sub: string; prevGen: string }> = {
  day: { sub: "Dan u odnosu na prethodni dan", prevGen: "prethodnog dana" },
  month: { sub: "Mjesec u odnosu na prethodni mjesec", prevGen: "prethodnog mjeseca" },
  year: { sub: "Godina u odnosu na prethodnu godinu", prevGen: "prethodne godine" },
  custom: { sub: "Period u odnosu na prethodni period iste dužine", prevGen: "prethodnog perioda" },
};

const clampDate = (d: string) => (d < MIN_DATE ? MIN_DATE : d > TODAY ? TODAY : d);

/** Promjena s jednom decimalom: „+150,0%“ / „−0,7%“; `null` kad je prethodna vrijednost ≈ 0. */
function change(cur: number, prev: number): { text: string; up: boolean } | null {
  if (Math.abs(prev) < 0.005) return null;
  const v = ((cur - prev) / Math.abs(prev)) * 100;
  const body = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(v));
  return { text: `${v < 0 ? "−" : "+"}${body}%`, up: v >= 0 };
}

export function Izvjestaji() {
  const txs = useTxs();
  const cats = useCats();
  const chartStyle = useFiluza((s) => s.tweaks.chartStyle);
  const fmt = useFmt();
  const toast = useToast();

  const [mode, setMode] = useState<RMode>("month");
  const [anchor, setAnchor] = useState(TODAY);
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState(TODAY);

  const setRange = (a: string, b: string) => {
    if (!a || !b) return;
    const [x, y] = [clampDate(a), clampDate(b)];
    setFrom(x <= y ? x : y);
    setTo(x <= y ? y : x);
  };

  const custom = mode === "custom";
  const period = custom ? { start: from, end: to } : periodOf(mode, anchor);
  const prevPeriod = useMemo(() => {
    if (!custom) return periodOf(mode, shiftAnchor(mode, anchor, -1));
    const end = addDays(from, -1);
    return { start: addDays(end, -(daysBetween(from, to) - 1)), end };
  }, [custom, mode, anchor, from, to]);

  const range = (p: { start: string; end: string }) => `${fmt.date(p.start)} – ${fmt.date(p.end)}`;
  const label = custom ? range(period) : periodLabel(mode, anchor, fmt.format);
  const prevLabel = custom ? range(prevPeriod) : periodLabel(mode, prevPeriod.end, fmt.format);
  const growKey = `${mode}:${period.start}:${period.end}`;
  const on = useGrow(growKey);

  const d = useMemo(() => {
    const cur = inRange(txs, period.start, period.end).sort(byNewest);
    const t = totals(cur);
    const p = totals(inRange(txs, prevPeriod.start, prevPeriod.end));

    const byCat = new Map<string, number>();
    for (const x of cur) if (x.type === "rashod") byCat.set(x.cat, (byCat.get(x.cat) ?? 0) + x.amount);
    const catRows = [...byCat.entries()]
      .map(([id, amount]) => ({ id, amount: round2(amount), cat: catOf(cats, id) }))
      .sort((a, b) => b.amount - a.amount);

    // Prosječna mjesečna potrošnja
    const endMonth = period.end.slice(0, 7);
    let avg: number;
    let avgSub: string;
    if (mode === "day" || mode === "month") {
      const start = addMonths(`${endMonth}-01`, -5);
      avg = totals(inRange(txs, start, period.end.slice(0, 8) + "31")).exp / 6;
      avgSub = "Zadnjih 6 mjeseci";
    } else {
      const a = parts(period.start);
      const lastDate = period.end > TODAY ? TODAY : period.end;
      const b = parts(lastDate < period.start ? period.start : lastDate);
      const months = Math.max(1, (b.y - a.y) * 12 + (b.m - a.m) + 1);
      avg = t.exp / months;
      avgSub = `Na osnovu ${months} mj.`;
    }

    // Stupci i stanje
    const columns = buildColumns(
      txs,
      custom ? { kind: "custom", start: period.start, end: period.end } : { kind: mode as PMode, anchor },
      fmt.long,
    );
    const past = columns.filter((c) => !c.future);
    const startBalance = balanceAt(txs, addDays(columns[0].start, -1));
    const balance = past.map((c) => ({
      key: c.key,
      label: c.label,
      value: balanceAt(txs, c.end > TODAY ? TODAY : c.end),
    }));

    // Trend štednje: 12 mjeseci do kraja perioda
    const last = endMonth > TODAY.slice(0, 7) ? TODAY.slice(0, 7) : endMonth;
    const savings = Array.from({ length: 12 }, (_, i) => {
      const first = addMonths(`${last}-01`, i - 11);
      const { y, m } = parts(first);
      const mt = totals(inRange(txs, first, first.slice(0, 8) + "31"));
      const rate = mt.inc > 0 ? `, stopa štednje ${Math.round((mt.net / mt.inc) * 100)}%` : "";
      return {
        key: first.slice(0, 7),
        label: MONTHS_SHORT[m - 1],
        title: `${MONTHS[m - 1]} ${y}: ${nkm(mt.net)}${rate}`,
        net: mt.net,
      };
    });

    return { cur, t, p, catRows, avg, avgSub, columns, balance, startBalance, savings };
  }, [txs, cats, mode, custom, anchor, period.start, period.end, prevPeriod.start, prevPeriod.end, fmt]);

  const prevGen = COMPARE[mode].prevGen;
  const top = d.catRows[0];
  const balanceValues = [d.startBalance, ...d.balance.map((b) => b.value)];
  const endBalance = balanceValues[balanceValues.length - 1];
  const maxCat = top?.amount ?? 0;

  function exportCsv() {
    const lines = [
      "Filuza – Finansijski izvještaj",
      csvLine("Period", range(period)),
      csvLine("Ukupni prihodi", km(d.t.inc)),
      csvLine("Ukupni rashodi", km(d.t.exp)),
      csvLine("Neto razlika", km(d.t.net).replace("−", "-")),
      "",
      csvLine("Datum", "Naziv", "Kategorija", "Tip", "Iznos (KM)", "Način plaćanja", "Napomena"),
      ...d.cur.map((t) =>
        csvLine(
          fmt.date(t.date),
          t.name,
          catOf(cats, t.cat).name,
          t.type === "prihod" ? "Prihod" : "Rashod",
          csvAmount(t.type === "prihod" ? t.amount : -t.amount),
          t.method,
          t.note,
        ),
      ),
    ];
    downloadText(
      `filuza-izvjestaj-${period.start}_${period.end}.csv`,
      `﻿${lines.join("\r\n")}\r\n`,
      "text/csv;charset=utf-8",
    );
    toast(`Izvještaj je preuzet (${txCount(d.cur.length)}).`);
  }

  const rows: { name: string; cur: string; prev: string; ch: ReturnType<typeof change>; upIsGood: boolean | null }[] = [
    { name: "Prihodi", cur: km(d.t.inc), prev: km(d.p.inc), ch: change(d.t.inc, d.p.inc), upIsGood: true },
    { name: "Rashodi", cur: km(d.t.exp), prev: km(d.p.exp), ch: change(d.t.exp, d.p.exp), upIsGood: false },
    { name: "Neto razlika", cur: nkm(d.t.net), prev: nkm(d.p.net), ch: change(d.t.net, d.p.net), upIsGood: true },
    { name: "Broj transakcija", cur: String(d.t.n), prev: String(d.p.n), ch: change(d.t.n, d.p.n), upIsGood: null },
  ];

  return (
    <>
      <ScreenHeader
        title="Finansijski izvještaji"
        sub="Upoznaj svoje navike i donosi bolje finansijske odluke."
        action={
          <Button onClick={exportCsv}>
            <DownloadSimple size={18} aria-hidden="true" />
            Preuzmi izvještaj
          </Button>
        }
      />

      <div className="grid gap-5">
        {/* Traka perioda */}
        <section aria-label="Period izvještaja" className="rounded-section border border-border bg-surface p-4 shadow-card tb:px-5">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
            <Segmented
              label="Vrsta perioda"
              options={MODES}
              value={mode}
              onChange={setMode}
              className="w-full sm:w-auto [&>button]:flex-1 max-sm:[&>button]:px-2"
            />
            {custom ? (
              <div className="ml-auto grid w-full grid-cols-2 gap-2.5 sm:w-auto">
                <TextField
                  label="Od"
                  type="date"
                  className="h-11"
                  min={MIN_DATE}
                  max={TODAY}
                  value={from}
                  onChange={(e) => setRange(e.target.value, to)}
                />
                <TextField
                  label="Do"
                  type="date"
                  className="h-11"
                  min={MIN_DATE}
                  max={TODAY}
                  value={to}
                  onChange={(e) => setRange(from, e.target.value)}
                />
              </div>
            ) : (
              <PeriodNav mode={mode} anchor={anchor} onChange={setAnchor} className="ml-auto w-full sm:w-auto" />
            )}
          </div>
          <p className="tnum mt-3.5 border-t border-divider pt-3.5 text-[14px] leading-5 text-ink-2" aria-live="polite">
            Prikaz za <strong className="font-semibold text-ink">{label}</strong> · poređenje sa: {prevLabel}
          </p>
        </section>

        {/* KPI */}
        <section aria-label="Ključni pokazatelji" className="grid gap-4 sm:grid-cols-2 dk:grid-cols-3">
          <Kpi
            title="Ukupni prihodi"
            icon="arrow-down-left"
            color="#4F9D77"
            value={km(d.t.inc)}
            tone="text-income-text"
            desc="U odabranom periodu."
            chip={changeChip(d.t.inc, d.p.inc, true, prevGen)}
          />
          <Kpi
            title="Ukupni rashodi"
            icon="arrow-up-right"
            color="#C96B62"
            value={km(d.t.exp)}
            tone="text-expense-text"
            desc="U odabranom periodu."
            chip={changeChip(d.t.exp, d.p.exp, false, prevGen)}
          />
          <Kpi
            title="Neto razlika"
            icon="scale"
            color={d.t.net >= 0 ? "#4F9D77" : "#C96B62"}
            value={nkm(d.t.net)}
            tone={d.t.net >= 0 ? "text-income-text" : "text-expense-text"}
            desc="Prihodi minus rashodi."
            chip={changeChip(d.t.net, d.p.net, true, prevGen)}
          />
          <Kpi title="Prosječna mjesečna potrošnja" icon="calendar-range" color="#D85A30" value={km(d.avg)} desc={d.avgSub} />
          <Kpi
            title="Najveća kategorija troškova"
            icon="chart-pie"
            color="#E6AA4E"
            value={top ? top.cat.name : "—"}
            desc={top ? km(top.amount) : "Nema rashoda"}
          />
          <Kpi
            title="Ušteđeno od prihoda"
            icon="piggy-bank"
            color="#4F9D77"
            value={d.t.inc > 0 ? pctS((d.t.net / d.t.inc) * 100) : "—"}
            tone={d.t.net >= 0 ? "text-income-text" : "text-expense-text"}
            desc="Neto / prihodi"
          />
        </section>

        {/* Grid 2×2 */}
        <div className="grid gap-5 dk:grid-cols-2">
          <Card className="min-w-0">
            <CardHead
              title="Prihodi naspram rashoda"
              sub={label}
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
                </ul>
              }
            />
            <div className="mt-5">
              <BarLineChart
                columns={d.columns}
                style={chartStyle}
                growKey={growKey}
                height={230}
                label={`Prihodi naspram rashoda, ${label}: prihodi ${km(d.t.inc)}, rashodi ${km(d.t.exp)}.`}
              />
            </div>
          </Card>

          <Card className="min-w-0">
            <CardHead title="Potrošnja po kategorijama" sub={label} />
            {d.catRows.length === 0 ? (
              <div className="mt-5">
                <EmptyState compact dashed title="Nema rashoda u ovom periodu." />
              </div>
            ) : (
              <ul className="mt-5 grid gap-3.5">
                {d.catRows.map((r) => (
                  <li key={r.id || "bez"}>
                    <div className="flex items-center gap-2.5 text-[14px] leading-5">
                      <IconTile icon={r.cat.icon} color={r.cat.color} size={28} />
                      <span className="tnum min-w-0 flex-1 truncate text-ink">
                        <span className="font-semibold">{r.cat.name}</span>
                        <span className="text-ink-2"> · {pctS((r.amount / d.t.exp) * 100)}</span>
                      </span>
                      <span className="amount text-[14px] text-ink">{km(r.amount)}</span>
                    </div>
                    <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-full bg-soft">
                      <div
                        className="h-full rounded-full transition-[width] duration-[350ms] ease-bar"
                        style={{ width: on ? `${(r.amount / maxCat) * 100}%` : 0, background: r.cat.color }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="min-w-0">
            <CardHead
              title="Kretanje ukupnog stanja"
              sub={
                <span className="tnum">
                  Najviše: {km(Math.max(...balanceValues))} · Najmanje: {km(Math.min(...balanceValues))}
                </span>
              }
              action={
                <p className="sm:text-right">
                  <span className="block text-[12.5px] leading-[18px] text-ink-2">Stanje na kraju</span>
                  <span
                    className={cn(
                      "amount block text-[17px] leading-6",
                      endBalance >= d.startBalance ? "text-income-text" : "text-expense-text",
                    )}
                  >
                    {km(endBalance)}
                  </span>
                </p>
              }
            />
            <div className="mt-5">
              {d.balance.length === 0 ? (
                <EmptyState compact dashed title="Nema podataka za ovaj period." />
              ) : (
                <BalanceLine points={d.balance} start={d.startBalance} />
              )}
            </div>
          </Card>

          <Card className="min-w-0">
            <CardHead title="Mjesečni trend štednje" sub="Neto ušteda za posljednjih 12 mjeseci." />
            <div className="mt-5">
              <SavingsBars items={d.savings} growKey={growKey} />
            </div>
          </Card>
        </div>

        {/* Poređenje */}
        <Card className="min-w-0">
          <CardHead title="Poređenje" sub={COMPARE[mode].sub} />
          <div className="-mx-[18px] mt-4 overflow-x-auto px-[18px] tb:-mx-6 tb:px-6">
            <table className="w-full min-w-[480px] border-collapse text-left text-[14px]">
              <thead>
                <tr className="text-[12.5px] leading-4 text-ink-2">
                  <th scope="col" className="border-b border-divider pr-4 pb-2.5 font-semibold">
                    Pokazatelj
                  </th>
                  <th scope="col" className="tnum border-b border-divider pr-4 pb-2.5 text-right font-semibold">
                    {label}
                  </th>
                  <th scope="col" className="tnum border-b border-divider pr-4 pb-2.5 text-right font-semibold">
                    {prevLabel}
                  </th>
                  <th scope="col" className="border-b border-divider pb-2.5 text-right font-semibold">
                    Promjena
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const good = r.ch && r.upIsGood !== null ? r.ch.up === r.upIsGood : null;
                  return (
                    <tr key={r.name}>
                      <th scope="row" className="border-b border-divider py-3 pr-4 font-semibold text-ink">
                        {r.name}
                      </th>
                      <td className="amount border-b border-divider py-3 pr-4 text-right text-ink">{r.cur}</td>
                      <td className="tnum border-b border-divider py-3 pr-4 text-right whitespace-nowrap text-ink-2">
                        {r.prev}
                      </td>
                      <td className="border-b border-divider py-3 text-right">
                        <span
                          className={cn(
                            "tnum inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-semibold",
                            good === null
                              ? "border border-divider bg-bg text-ink-2"
                              : good
                                ? "bg-income-soft text-income-strong"
                                : "bg-expense-soft text-expense-strong",
                          )}
                        >
                          {r.ch ? r.ch.text : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
