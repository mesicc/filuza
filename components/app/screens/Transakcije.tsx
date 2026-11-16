"use client";

import { CaretLeft, CaretRight, MagnifyingGlass, Plus } from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { Card, IconTile } from "@/components/ui/primitives";
import { byNewest, catOf, totals, txCount, txPeriodRange } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { km, skm } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useCats, useFiluza, useFmt, useTxs } from "@/lib/store";
import { METHODS } from "@/lib/types";
import type { Transaction, TxFilter, TxPeriod } from "@/lib/types";
import { ScreenHeader } from "../ScreenHeader";
import { EmptyState, FirstTxEmpty, TypeChip, amountTone } from "../common";

const PAGE = 10;

const TYPES = [
  { value: "sve", label: "Sve" },
  { value: "prihod", label: "Prihodi" },
  { value: "rashod", label: "Rashodi" },
] as const;

const PERIODS: { value: TxPeriod; label: string }[] = [
  { value: "sve", label: "Sve vrijeme" },
  { value: "danas", label: "Danas" },
  { value: "mjesec", label: "Ovaj mjesec" },
  { value: "prosli-mjesec", label: "Prošli mjesec" },
  { value: "godina", label: "Ova godina" },
  { value: "prosla-godina", label: "Prošla godina" },
];

const SORTS = [
  { value: "date:desc", label: "Najnovije prvo" },
  { value: "date:asc", label: "Najstarije prvo" },
  { value: "amount:desc", label: "Najveći iznos" },
  { value: "amount:asc", label: "Najmanji iznos" },
];

const methodIcon = (m: string) => METHODS.find((x) => x.value === m)?.icon ?? "circle-ellipsis";

export function Transakcije() {
  const txs = useTxs();
  const cats = useCats();
  const f = useFiluza((s) => s.txFilter);
  const setF = useFiluza((s) => s.setTxFilter);
  const reset = useFiluza((s) => s.resetTxFilter);
  const openModal = useFiluza((s) => s.openModal);
  const fmt = useFmt();

  const list = useMemo(() => {
    const range = txPeriodRange(f.period);
    const q = f.q.trim().toLocaleLowerCase("bs");
    const out = txs.filter((t) => {
      if (f.type !== "sve" && t.type !== f.type) return false;
      if (f.cat !== "sve" && t.cat !== f.cat) return false;
      if (range && (t.date < range.start || t.date > range.end)) return false;
      if (q) {
        const hay = `${t.name} ${catOf(cats, t.cat).name} ${t.note}`.toLocaleLowerCase("bs");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const dir = f.sortDir === "asc" ? -1 : 1;
    out.sort((a, b) => {
      if (f.sortKey === "amount" && a.amount !== b.amount) return (b.amount - a.amount) * dir;
      if (f.sortKey === "date") return byNewest(a, b) * dir;
      return byNewest(a, b);
    });
    return out;
  }, [txs, cats, f.type, f.cat, f.period, f.q, f.sortKey, f.sortDir]);

  const sum = useMemo(() => totals(list), [list]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const page = Math.min(f.page, pages);
  const rows = list.slice((page - 1) * PAGE, page * PAGE);
  const catOptions = cats.filter((c) => f.type === "sve" || c.type === f.type);

  const sortBy = (key: TxFilter["sortKey"]) =>
    setF(f.sortKey === key ? { sortDir: f.sortDir === "desc" ? "asc" : "desc" } : { sortKey: key, sortDir: "desc" });

  const header = (
    <ScreenHeader
      title="Transakcije"
      sub="Prati svaki priliv i odljev svog novca."
      action={
        <Button onClick={() => openModal("tx")}>
          <Plus size={18} aria-hidden="true" />
          Dodaj transakciju
        </Button>
      }
    />
  );

  if (txs.length === 0) {
    return (
      <>
        {header}
        <FirstTxEmpty />
      </>
    );
  }

  return (
    <>
      {header}
      <div className="grid gap-5">
        {/* 1. Sažetak */}
        <section aria-label="Sažetak filtriranih transakcija" className="grid gap-4 sm:grid-cols-3">
          <Summary icon="list" color="#D85A30" label="Ukupan broj transakcija" value={String(sum.n)} tone="text-ink" />
          <Summary icon="arrow-down-left" color="#4F9D77" label="Ukupni prihodi" value={km(sum.inc)} tone="text-income-text" />
          <Summary icon="arrow-up-right" color="#C96B62" label="Ukupni rashodi" value={km(sum.exp)} tone="text-expense-text" />
        </section>

        {/* 2. Lista */}
        <Card className="min-w-0">
          <h2 className="sr-only">Lista transakcija</h2>

          <div className="flex flex-wrap items-center gap-2.5">
            <Segmented
              label="Tip transakcije"
              options={TYPES}
              value={f.type}
              onChange={(type) => setF({ type, cat: "sve" })}
              className="w-full sm:w-auto [&>button]:flex-1"
            />
            <div className="relative min-w-[200px] flex-1">
              <MagnifyingGlass
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-2"
              />
              <input
                type="search"
                aria-label="Pretraži transakcije"
                placeholder="Pretraži transakcije..."
                className="fz-field h-11 pl-[42px]"
                value={f.q}
                onChange={(e) => setF({ q: e.target.value })}
              />
            </div>
            <Select
              hideLabel
              label="Period"
              className="h-11"
              wrapClassName="min-w-[160px] flex-1 sm:flex-none"
              value={f.period}
              onChange={(e) => setF({ period: e.target.value as TxPeriod })}
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <Select
              hideLabel
              label="Kategorija"
              className="h-11"
              wrapClassName="min-w-[160px] flex-1 sm:flex-none"
              value={f.cat}
              onChange={(e) => setF({ cat: e.target.value })}
            >
              <option value="sve">Sve kategorije</option>
              {catOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {f.type === "sve" && c.type === "prihod" ? " (prihod)" : ""}
                </option>
              ))}
            </Select>
            <Select
              hideLabel
              label="Sortiranje"
              className="h-11"
              wrapClassName="w-full tb:hidden"
              value={`${f.sortKey}:${f.sortDir}`}
              onChange={(e) => {
                const [sortKey, sortDir] = e.target.value.split(":") as [TxFilter["sortKey"], TxFilter["sortDir"]];
                setF({ sortKey, sortDir });
              }}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>

          {list.length === 0 ? (
            <EmptyState
              icon="search-x"
              title="Nema transakcija za odabrane filtere."
              text="Pokušaj s drugim pojmom ili period."
              action={
                <Button variant="secondary" onClick={reset}>
                  Očisti filtere
                </Button>
              }
            />
          ) : (
            <>
              {/* Desktop tabela */}
              <div className="-mx-6 mt-5 hidden overflow-x-auto px-6 tb:block">
                <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="text-[12.5px] leading-4 text-ink-2">
                      <Th>Naziv transakcije</Th>
                      <Th>Kategorija</Th>
                      <SortTh label="Datum" active={f.sortKey === "date"} dir={f.sortDir} onClick={() => sortBy("date")} />
                      <Th>Tip</Th>
                      <SortTh
                        label="Iznos"
                        right
                        active={f.sortKey === "amount"}
                        dir={f.sortDir}
                        onClick={() => sortBy("amount")}
                      />
                      <th scope="col" className="border-b border-divider pb-2.5 pl-4 text-right font-semibold">
                        Akcije
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((t) => {
                      const cat = catOf(cats, t.cat);
                      return (
                        <tr key={t.id} className="transition-colors duration-150 hover:bg-bg">
                          <td className="max-w-[260px] border-b border-divider py-2.5 pr-4">
                            <span className="block truncate font-semibold text-ink" title={t.name}>
                              {t.name}
                            </span>
                            <span className="block truncate text-[12px] leading-4 text-ink-2">{t.method}</span>
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
                          <td className="border-b border-divider py-1.5 pl-4">
                            <RowActions t={t} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobilne kartice */}
              <ul className="mt-4 grid gap-3 tb:hidden">
                {rows.map((t) => {
                  const cat = catOf(cats, t.cat);
                  return (
                    <li key={t.id} className="rounded-[16px] border border-border p-3.5">
                      <div className="flex items-center gap-3">
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
                      </div>
                      <div className="mt-3 flex items-center gap-1 border-t border-divider pt-2">
                        <span className="mr-auto flex min-w-0 items-center gap-1.5 text-[12.5px] text-ink-2">
                          <Icon name={methodIcon(t.method)} size={16} className="shrink-0" />
                          <span className="truncate">{t.method}</span>
                        </span>
                        <button
                          type="button"
                          aria-label={`Uredi ${t.name}`}
                          onClick={() => openModal("tx", { id: t.id })}
                          className="flex h-11 items-center gap-1.5 rounded-control px-3 text-[13.5px] font-semibold text-heading transition-colors duration-150 active:bg-soft"
                        >
                          <Icon name="pencil" size={16} />
                          Uredi
                        </button>
                        <button
                          type="button"
                          aria-label={`Obriši ${t.name}`}
                          onClick={() => openModal("deleteTx", { id: t.id })}
                          className="-mr-2 flex h-11 items-center gap-1.5 rounded-control px-3 text-[13.5px] font-semibold text-expense-strong transition-colors duration-150 active:bg-expense-soft"
                        >
                          <Icon name="trash-2" size={16} />
                          Obriši
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Paginacija */}
              <nav
                aria-label="Stranice"
                className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-[13.5px] text-ink-2"
              >
                <p className="tnum" aria-live="polite">
                  Prikazano {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, list.length)} od {list.length}
                </p>
                <div className="flex w-full items-center justify-between gap-1.5 sm:w-auto sm:gap-2">
                  <Button variant="secondary" size="sm" className="px-2.5" disabled={page <= 1} onClick={() => setF({ page: page - 1 })}>
                    <CaretLeft size={16} aria-hidden="true" />
                    Prethodna
                  </Button>
                  <span className="tnum whitespace-nowrap text-[13px] sm:px-1.5 sm:text-[13.5px]">
                    <span className="max-[25rem]:sr-only">Stranica </span>
                    {page}
                    <span className="max-[25rem]:sr-only"> od </span>
                    <span aria-hidden="true" className="min-[25.01rem]:hidden">
                      {" / "}
                    </span>
                    {pages}
                  </span>
                  <Button variant="secondary" size="sm" className="px-2.5" disabled={page >= pages} onClick={() => setF({ page: page + 1 })}>
                    Sljedeća
                    <CaretRight size={16} aria-hidden="true" />
                  </Button>
                </div>
              </nav>
            </>
          )}
        </Card>
      </div>
      <p className="sr-only" role="status">
        {txCount(list.length)}
      </p>
    </>
  );
}

function Summary({
  icon,
  color,
  label,
  value,
  tone,
}: {
  icon: string;
  color: string;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card small className="flex min-w-0 items-center gap-3.5">
      <IconTile icon={icon} color={color} size={44} />
      <div className="min-w-0">
        <p className="truncate text-[13px] leading-[18px] text-ink-2">{label}</p>
        <p className={cn("amount mt-0.5 truncate text-[22px] leading-7", tone)}>{value}</p>
      </div>
    </Card>
  );
}

function Th({ children }: { children: string }) {
  return (
    <th scope="col" className="border-b border-divider pr-4 pb-2.5 font-semibold">
      {children}
    </th>
  );
}

function SortTh({
  label,
  active,
  dir,
  right,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  right?: boolean;
  onClick: () => void;
}) {
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("border-b border-divider pb-1 font-semibold", right ? "text-right" : "pr-4")}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex h-8 items-center gap-1 rounded-[8px] px-2 font-semibold transition-colors duration-150 hover:bg-soft hover:text-primary",
          right ? "-mr-2" : "-ml-2",
          active ? "text-primary" : "text-ink-2",
        )}
      >
        {label}
        <Icon name={active ? (dir === "asc" ? "arrow-up" : "arrow-down") : "arrow-up-down"} size={16} />
      </button>
    </th>
  );
}

function RowActions({ t }: { t: Transaction }) {
  const openModal = useFiluza((s) => s.openModal);
  return (
    <div className="flex justify-end gap-0.5">
      <IconButton label={`Uredi ${t.name}`} size={36} onClick={() => openModal("tx", { id: t.id })}>
        <Icon name="pencil" size={18} />
      </IconButton>
      <IconButton
        label={`Obriši ${t.name}`}
        size={36}
        onClick={() => openModal("deleteTx", { id: t.id })}
        className="hover:bg-expense-soft hover:text-expense-strong"
      >
        <Icon name="trash-2" size={18} />
      </IconButton>
    </div>
  );
}

