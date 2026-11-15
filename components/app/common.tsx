"use client";

import { ArrowDownLeft, ArrowUpRight, Plus } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { Coin } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Icon } from "@/lib/icons";
import { initials, useFiluza } from "@/lib/store";
import type { TxType } from "@/lib/types";

/** Naslov kartice (H2) s podnaslovom i akcijom desno. */
export function CardHead({
  title,
  sub,
  action,
  className,
}: {
  title: string;
  sub?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-3", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-[18px] leading-6 font-semibold tracking-[-0.015em] text-ink tb:text-[19px]">
          {title}
        </h2>
        {sub && <p className="mt-0.5 text-[13.5px] leading-5 text-ink-2">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/** Tekst-dugme „Pogledaj sve →“ i slična. */
export function LinkButton({
  children,
  onClick,
  icon,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  icon?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "-mx-2 inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] px-2 text-[14px] font-semibold text-primary transition-colors duration-150",
        "hover:bg-soft hover:text-primary-hover active:bg-soft-2/60 disabled:text-placeholder disabled:hover:bg-transparent",
        className,
      )}
    >
      {children}
      {icon && <Icon name={icon} size={16} />}
    </button>
  );
}

export function TypeChip({ type }: { type: TxType }) {
  const income = type === "prihod";
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full pr-2.5 pl-2 text-[12px] font-semibold whitespace-nowrap",
        income ? "bg-income-soft text-income-strong" : "bg-expense-soft text-expense-strong",
      )}
    >
      {income ? <ArrowDownLeft size={16} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />}
      {income ? "Prihod" : "Rashod"}
    </span>
  );
}

export const amountTone = (type: TxType) => (type === "prihod" ? "text-income-text" : "text-expense-text");

export function Avatar({ size = 38, ring, className }: { size?: number; ring?: boolean; className?: string }) {
  const profile = useFiluza((s) => s.profile);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full bg-soft-2 font-display font-bold text-heading",
        ring && "border-2 border-white shadow-[0_0_0_1px_var(--color-border)]",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.37), letterSpacing: "-0.01em" }}
    >
      {initials(profile)}
    </span>
  );
}

/** Prazno stanje unutar kartice ili ekrana. */
export function EmptyState({
  icon,
  title,
  text,
  action,
  dashed,
  compact,
}: {
  icon?: string;
  title: string;
  text?: string;
  action?: ReactNode;
  dashed?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "px-4 py-8" : "px-5 py-12",
        dashed && "rounded-section border border-dashed border-soft-2",
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn("grid place-items-center rounded-full bg-soft text-accent", compact ? "size-12" : "size-[72px]")}
        >
          <Icon name={icon} size={compact ? 24 : 32} />
        </span>
      )}
      <p
        className={cn(
          "max-w-[440px] text-balance text-ink",
          icon && "mt-4",
          compact ? "text-[14.5px] leading-[22px] font-medium" : "font-display text-[21px] leading-7 font-semibold tracking-[-0.015em]",
        )}
      >
        {title}
      </p>
      {text && <p className="mt-1.5 max-w-[420px] text-[14.5px] leading-[22px] text-ink-2">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Prazno stanje kad korisnik još nema nijednu transakciju (Pregled i Transakcije). */
export function FirstTxEmpty() {
  const openModal = useFiluza((s) => s.openModal);
  return (
    <div className="flex flex-col items-center rounded-card border border-border bg-surface px-5 py-14 text-center shadow-card tb:py-20">
      <span aria-hidden="true" className="grid size-[120px] place-items-center rounded-full bg-soft">
        <Coin size={72} shine />
      </span>
      <h2 className="mt-6 max-w-[460px] font-display text-[24px] leading-[1.15] font-bold tracking-[-0.02em] text-heading tb:text-[28px]">
        Tvoja finansijska priča počinje ovdje.
      </h2>
      <p className="mt-2.5 max-w-[440px] text-[15px] leading-[1.6] text-ink-2">
        Dodaj svoju prvu transakciju i napravi prvi korak prema boljoj kontroli novca.
      </p>
      <Button className="mt-6" onClick={() => openModal("tx")}>
        <Plus size={18} aria-hidden="true" />
        Dodaj prvu transakciju
      </Button>
    </div>
  );
}

/** Boja progress trake budžeta: zelena < 80 %, crvena ≥ 80 %. */
export const budgetTone = (pct: number) => (pct >= 80 ? "expense" : "income");
