"use client";

import { Check, Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { Coin } from "@/components/Logo";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, Chip, ProgressBar } from "@/components/ui/primitives";
import { goalDone, goalSaved, monthsUntil, plural } from "@/lib/calc";
import { MONTHS, TODAY, parts } from "@/lib/dates";
import { km, round2 } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { useFiluza, useGoals } from "@/lib/store";
import type { Goal } from "@/lib/types";
import { useGrow } from "@/lib/useGrow";
import { ScreenHeader } from "../ScreenHeader";
import { EmptyState } from "../common";

export function Ciljevi() {
  const goals = useGoals();
  const openModal = useFiluza((s) => s.openModal);
  const on = useGrow("ciljevi");

  const saved = round2(goals.reduce((s, g) => s + goalSaved(g), 0));
  const target = round2(goals.reduce((s, g) => s + g.target, 0));
  const pct = target > 0 ? Math.round((saved / target) * 100) : 0;
  const done = goals.filter(goalDone).length;
  const active = goals.length - done;

  return (
    <>
      <ScreenHeader
        title="Tvoji finansijski ciljevi"
        sub="Male navike danas, veliki ciljevi sutra."
        action={
          <Button onClick={() => openModal("goal")}>
            <Plus size={18} aria-hidden="true" />
            Novi cilj
          </Button>
        }
      />

      {goals.length === 0 ? (
        <Card>
          <EmptyState
            icon="sprout"
            title="Imaš li nešto za šta želiš štedjeti?"
            text="Postavi svoj prvi cilj i prati napredak."
            action={
              <Button onClick={() => openModal("goal")}>
                <Plus size={18} aria-hidden="true" />
                Postavi prvi cilj
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5">
          {/* Sažetak */}
          <section
            aria-label="Ukupna štednja"
            className="relative overflow-hidden rounded-card border border-soft-2 bg-soft p-[18px] tb:p-6"
          >
            <span
              aria-hidden="true"
              className="absolute -top-[150px] -right-[130px] size-[260px] rounded-full border-2 border-dashed border-soft-2 tb:-top-[110px] tb:-right-[70px]"
            />
            <div className="relative flex items-center gap-4 tb:gap-5">
              <span aria-hidden="true" className="grid size-[76px] shrink-0 place-items-center rounded-full bg-white">
                <Coin size={58} shine />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[14px] leading-5 font-medium text-ink-2">Ukupno ušteđeno za sve ciljeve</h2>
                <p className="tnum mt-1 text-[15px] leading-7 text-ink-2">
                  <strong className="amount block text-[clamp(22px,2.4vw,30px)] text-heading sm:inline">{km(saved)}</strong>{" "}
                  <span className="whitespace-nowrap">od {km(target)}</span>
                </p>
              </div>
            </div>
            <ProgressBar
              className="relative mt-5"
              height={12}
              value={pct}
              on={on}
              color="#D85A30"
              track="#FFFFFF"
              label={`Ukupna štednja: ${pct}% ukupnog cilja`}
            />
            <p className="tnum relative mt-2.5 text-[13.5px] leading-5 text-ink-2">
              {pct}% ukupnog cilja · {active} {plural(active, "aktivan", "aktivna", "aktivnih")} · {done}{" "}
              {plural(done, "ostvaren", "ostvarena", "ostvarenih")}
            </p>
          </section>

          {/* Kartice */}
          <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr))]">
            {goals.map((g) => (
              <li key={g.id}>
                <GoalCard g={g} on={on} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function GoalCard({ g, on }: { g: Goal; on: boolean }) {
  const openModal = useFiluza((s) => s.openModal);
  const saved = goalSaved(g);
  const done = goalDone(g);
  const pct = g.target > 0 ? Math.min(100, Math.max(0, Math.round((saved / g.target) * 100))) : 0;
  const left = Math.max(0, round2(g.target - saved));
  const perMonth = round2(left / monthsUntil(TODAY, g.date));
  const due = parts(g.date);

  const R = 15.9155;
  const color = done ? "var(--color-income)" : "var(--color-accent)";

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-soft text-accent">
          <Icon name={g.icon} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[19px] leading-6 font-semibold tracking-[-0.015em] text-ink" title={g.name}>
            {g.name}
          </h3>
          <Chip tone={done ? "income" : pct >= 50 ? "brand" : "neutral"} className="mt-1.5">
            {done ? "Ostvaren" : pct >= 50 ? "Više od pola puta" : "U toku"}
          </Chip>
        </div>
        <div className="-mt-1 -mr-2 flex shrink-0">
          <IconButton label={`Uredi cilj ${g.name}`} size={36} onClick={() => openModal("goal", { id: g.id })}>
            <Icon name="pencil" size={18} />
          </IconButton>
          <IconButton
            label={`Obriši cilj ${g.name}`}
            size={36}
            onClick={() => openModal("deleteGoal", { id: g.id })}
            className="hover:bg-expense-soft hover:text-expense-strong"
          >
            <Icon name="trash-2" size={18} />
          </IconButton>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative size-[104px] shrink-0">
          <svg viewBox="0 0 36 36" className="size-full -rotate-90" role="img" aria-label={`Napredak: ${pct}%`}>
            <circle cx="18" cy="18" r={R} fill="none" stroke="var(--color-soft)" strokeWidth="3.4" />
            <circle
              cx="18"
              cy="18"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeDasharray={`${on ? pct : 0} 100`}
              style={{ transition: "stroke-dasharray .35s cubic-bezier(.3,.7,.3,1)", opacity: pct > 0 ? 1 : 0 }}
            />
          </svg>
          <span aria-hidden="true" className="amount absolute inset-0 grid place-items-center text-[20px] text-ink">
            {pct}%
          </span>
        </div>
        <dl className="grid min-w-0 flex-1 gap-2 text-[13.5px] leading-5">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-2">Ušteđeno</dt>
            <dd className="amount text-[14px] text-income-text">{km(saved)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-2">Cilj</dt>
            <dd className="amount text-[14px] text-ink">{km(g.target)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-2">Očekivano</dt>
            <dd className="tnum font-semibold text-ink">
              {MONTHS[due.m - 1]} {due.y}
            </dd>
          </div>
        </dl>
      </div>

      <p className="tnum mt-5 flex items-start gap-2 rounded-control bg-bg px-3 py-2.5 text-[13.5px] leading-5 text-ink">
        <Icon name="sprout" size={18} className="mt-px shrink-0 text-income" />
        {done ? (
          "Cilj je ostvaren. Bravo!"
        ) : (
          <span>
            Još <span className="whitespace-nowrap">{km(left)}</span> · oko{" "}
            <span className="whitespace-nowrap">{km(perMonth)} mjesečno</span>
          </span>
        )}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        {!done && (
          <Button className="flex-1" onClick={() => openModal("goalAdd", { id: g.id })}>
            <Plus size={18} aria-hidden="true" />
            Dodaj novac
          </Button>
        )}
        <Button variant="secondary" className={done ? "flex-1" : ""} onClick={() => openModal("goalWithdraw", { id: g.id })}>
          <Minus size={18} aria-hidden="true" />
          Povuci
        </Button>
        <Button variant="secondary" className={done ? "flex-1" : ""} onClick={() => openModal("goalHistory", { id: g.id })}>
          <Icon name="history" size={18} />
          Historija
        </Button>
        {!done && (
          <IconButton
            bordered
            size={44}
            label={`Označi cilj ${g.name} kao ostvaren`}
            onClick={() => openModal("goalDone", { id: g.id })}
          >
            <Check size={18} aria-hidden="true" />
          </IconButton>
        )}
      </div>
    </Card>
  );
}
