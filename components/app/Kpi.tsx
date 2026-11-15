import { Card, IconTile } from "@/components/ui/primitives";
import { pctChange, signedPct } from "@/lib/calc";
import { cn } from "@/lib/cn";
import { Icon } from "@/lib/icons";

export interface KpiChip {
  text: string;
  up: boolean;
  good: boolean;
  title: string;
}

/**
 * Čip promjene u odnosu na prethodni period. `upIsGood` određuje boju:
 * prihodi/neto gore = dobro, rashodi dolje = dobro. Nema čipa kad je prethodna vrijednost ≈ 0.
 */
export function changeChip(cur: number, prev: number, upIsGood: boolean, prevGenitive: string): KpiChip | null {
  const v = pctChange(cur, prev);
  if (v === null) return null;
  const up = v >= 0;
  return {
    text: signedPct(v),
    up,
    good: up === upIsGood || v === 0,
    title: `${up ? "Više" : "Manje"} nego ${prevGenitive}`,
  };
}

export function Kpi({
  title,
  icon,
  color,
  value,
  tone = "text-ink",
  desc,
  chip,
}: {
  title: string;
  icon: string;
  color: string;
  value: string;
  tone?: string;
  desc: string;
  chip?: KpiChip | null;
}) {
  return (
    <Card lift className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <h2 className="pt-2.5 text-[14px] leading-5 font-medium text-ink-2">{title}</h2>
        <IconTile icon={icon} color={color} size={40} />
      </div>
      <p className={cn("amount mt-2 truncate text-[clamp(24px,2.3vw,30px)] leading-[1.15]", tone)} title={value}>
        {value}
      </p>
      <div className="mt-2.5 flex min-h-6 flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <p className="tnum text-[13px] leading-[18px] text-ink-2">{desc}</p>
        {chip && (
          <span
            title={chip.title}
            className={cn(
              "tnum inline-flex h-6 items-center gap-1 rounded-full pr-2.5 pl-2 text-[12px] font-semibold",
              chip.good ? "bg-income-soft text-income-strong" : "bg-expense-soft text-expense-strong",
            )}
          >
            <Icon name={chip.up ? "trending-up" : "trending-down"} size={16} />
            {chip.text}
            <span className="sr-only">. {chip.title}</span>
          </span>
        )}
      </div>
    </Card>
  );
}
