"use client";

import { useEffect, useRef, useState } from "react";
import { Ring } from "@/components/charts/Ring";
import { Segmented } from "@/components/ui/Segmented";
import { IconTile } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { DAYS_SHORT, MONTHS_SHORT, TODAY, fmtDateLong, fmtMonth } from "@/lib/dates";
import { km, niceMax, skm } from "@/lib/format";
import type { IconKey } from "@/lib/icons";

type DemoMode = "dnevno" | "mjesecno" | "godisnje";

const GREEN = "#4F9D77";
const RED = "#C96B62";
const PEACH = "#D85A30";
const GOLD = "#E6AA4E";

interface Row {
  name: string;
  cat: string;
  icon: IconKey;
  color: string;
  amount: string;
  tone: "income" | "expense" | "ink";
}

interface Demo {
  title: string;
  date: string;
  income: number;
  expense: number;
  net: number;
  bars: [number, number][];
  labels: readonly string[];
  /** Indeks kolone koja predstavlja „sada“. */
  now: number;
  unit: string;
  rows: Row[];
}

const EMPTY6: [number, number][] = Array.from({ length: 6 }, () => [0, 0]);

const DATA: Record<DemoMode, Demo> = {
  dnevno: {
    title: "Tvoje finansije danas",
    date: fmtDateLong(TODAY),
    income: 800,
    expense: 310,
    net: 490,
    bars: [[0, 62], [0, 40], [1200, 94], [0, 151], [500, 200], [800, 310], [0, 0]],
    labels: DAYS_SHORT,
    now: 5,
    unit: "po danima ove sedmice",
    rows: [
      { name: "Isplata investicije", cat: "Investicije", icon: "trending-up", color: GOLD, amount: skm(800, "prihod"), tone: "income" },
      { name: "Restoran", cat: "Hrana", icon: "shopping-basket", color: PEACH, amount: skm(90, "rashod"), tone: "expense" },
      { name: "Gorivo", cat: "Prijevoz", icon: "bus", color: RED, amount: skm(60, "rashod"), tone: "expense" },
    ],
  },
  mjesecno: {
    title: "Tvoj mjesečni pregled",
    date: fmtMonth(TODAY),
    income: 4500,
    expense: 1259.5,
    net: 3240.5,
    bars: [[2000, 350], [0, 81], [1200, 117], [0, 201], [500, 200], [800, 310], ...EMPTY6],
    labels: Array.from({ length: 12 }, (_, i) => String(i + 1)),
    now: 5,
    unit: "po danima u mjesecu",
    rows: [
      { name: "Plata", cat: "Plata", icon: "briefcase", color: GREEN, amount: skm(2000, "prihod"), tone: "income" },
      { name: "Bingo", cat: "Hrana", icon: "shopping-basket", color: PEACH, amount: skm(45.5, "rashod"), tone: "expense" },
      { name: "Internet", cat: "Računi", icon: "receipt", color: GOLD, amount: skm(35, "rashod"), tone: "expense" },
    ],
  },
  godisnje: {
    title: "Tvoj godišnji pregled",
    date: TODAY.slice(0, 4),
    income: 24640,
    expense: 17420.3,
    net: 7219.7,
    bars: [
      [1950, 1610], [2240, 1520], [1870, 1590], [2310, 1480], [1800, 1550], [2380, 1640],
      [1990, 1510], [2150, 2010], [1800, 1470], [2240, 1580], [4500, 1260], [0, 0],
    ],
    labels: MONTHS_SHORT,
    now: 10,
    unit: "po mjesecima",
    rows: [
      { name: "Najbolji mjesec", cat: "Novembar", icon: "sparkles", color: GREEN, amount: km(4500), tone: "income" },
      { name: "Najveći rashodi", cat: "August", icon: "plane", color: RED, amount: km(2010), tone: "ink" },
      { name: "Prosječni rashodi", cat: "Mjesečno", icon: "calendar-range", color: PEACH, amount: km(1583.66), tone: "ink" },
    ],
  },
};

const MODES = [
  { value: "dnevno", label: "Dnevno" },
  { value: "mjesecno", label: "Mjesečno" },
  { value: "godisnje", label: "Godišnje" },
] as const;

const TONE = { income: "text-income-text", expense: "text-expense-text", ink: "text-ink" };

export function HeroDemo() {
  const [mode, setMode] = useState<DemoMode>("dnevno");
  const [barsOn, setBarsOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stupci rastu od nule pri svakoj promjeni perioda.
  function grow() {
    setBarsOn(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setBarsOn(true), 40);
  }

  useEffect(() => {
    grow();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const d = DATA[mode];
  const top = niceMax(Math.max(...d.bars.flat()));
  const dense = d.bars.length > 7;

  const summary = `${d.title}, ${d.date}. Prihodi ${km(d.income)}, rashodi ${km(d.expense)}, neto ${km(d.net)}.`;

  return (
    <div className="relative pb-14 nav:pl-4">
      <div className="rounded-[28px] border border-border bg-surface p-[18px] shadow-[0_40px_80px_-44px_rgba(153,60,29,.5)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <p className="font-display text-[19px] leading-6 font-semibold tracking-[-0.015em] text-ink">{d.title}</p>
            <p className="tnum mt-0.5 text-[13px] text-ink-2">{d.date}</p>
          </div>
          <Segmented
            label="Period prikaza u primjeru"
            size="md"
            options={MODES}
            value={mode}
            onChange={(m) => {
              setMode(m);
              grow();
            }}
          />
        </div>

        <div role="img" aria-label={summary}>
          <dl className="mt-5 grid gap-2 min-[30rem]:grid-cols-3 min-[30rem]:gap-2.5">
            {(
              [
                ["Prihodi", km(d.income), "bg-income-soft text-income-strong"],
                ["Rashodi", km(d.expense), "bg-expense-soft text-expense-strong"],
                ["Neto", km(d.net), "bg-soft text-heading"],
              ] as const
            ).map(([label, value, tone]) => (
              <div
                key={label}
                className={cn(
                  "flex items-baseline justify-between gap-2 rounded-[14px] px-3.5 py-2.5 min-[30rem]:block min-[30rem]:px-3 min-[30rem]:py-3",
                  tone,
                )}
              >
                <dt className="text-[12px] font-semibold">{label}</dt>
                <dd className="amount text-[15px] min-[30rem]:mt-0.5 min-[30rem]:text-[14px] sm:text-[15px]">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-center gap-4 text-[12px] font-medium text-ink-2">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-[3px] bg-income" />
              Prihodi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-[3px] bg-expense" />
              Rashodi
            </span>
            <span className="ml-auto">{d.unit}</span>
          </div>

          <div className="relative mt-3 h-[150px]">
            {[0, 25, 50, 75, 100].map((p) => (
              <span
                key={p}
                className={cn(
                  "absolute inset-x-0 border-t",
                  p === 0 ? "border-border" : "border-dashed border-grid",
                )}
                style={{ bottom: `${p}%` }}
              />
            ))}
            <div className="absolute inset-0 flex">
              {d.bars.map(([inc, exp], i) => (
                <div key={i} className="flex min-w-0 flex-1 items-end justify-center gap-[2px]">
                  {[inc, exp].map((v, j) => (
                    <span
                      key={j}
                      className={cn(
                        "rounded-t-[4px] transition-[height] duration-[350ms] ease-bar",
                        dense ? "w-[min(7px,36%)]" : "w-[min(12px,30%)]",
                        j === 0 ? "bg-income" : "bg-expense",
                      )}
                      style={{ height: barsOn && v > 0 ? `max(3px, ${(v / top) * 100}%)` : 0 }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-1.5 flex">
            {d.labels.map((l, i) => (
              <span
                key={l}
                className={cn(
                  "tnum min-w-0 flex-1 text-center text-[10.5px] leading-4",
                  i === d.now ? "font-bold text-ink" : "text-ink-2",
                )}
              >
                {l}
              </span>
            ))}
          </div>

          <ul className="mt-4">
            {d.rows.map((r) => (
              <li key={r.name} className="flex items-center gap-3 border-t border-divider py-2.5 last:pb-0">
                <IconTile icon={r.icon} color={r.color} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] leading-5 font-semibold text-ink">{r.name}</span>
                  <span className="block truncate text-[12.5px] leading-[18px] text-ink-2">{r.cat}</span>
                </span>
                <span className={cn("amount text-[14.5px]", TONE[r.tone])}>{r.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-3 flex items-center gap-3 rounded-[18px] border border-border bg-surface py-3 pr-5 pl-3 shadow-popover animate-fz-float nav:-left-6"
      >
        <Ring value={60} size={44} stroke={5} />
        <span>
          <span className="tnum block text-[13.5px] leading-5 font-semibold text-ink">Putovanje · 60%</span>
          <span className="tnum block text-[12.5px] leading-[18px] text-ink-2">1.200 od 2.000 KM</span>
        </span>
      </div>
    </div>
  );
}
