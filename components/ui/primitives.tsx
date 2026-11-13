import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/lib/icons";
import type { IconKey } from "@/lib/icons";

/* ───────── Card ───────── */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Manja kartica/sekcija: radijus 20px. */
  small?: boolean;
  /** Podizanje na hover. */
  lift?: boolean;
  flush?: boolean;
}

export function Card({ small, lift, flush, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "border border-border bg-surface shadow-card",
        small ? "rounded-section" : "rounded-card",
        !flush && "p-[18px] tb:p-6",
        lift && "transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className,
      )}
      {...rest}
    />
  );
}

/* ───────── Icon tile ───────── */
interface IconTileProps {
  icon: IconKey;
  /** Boja kategorije (hex, 6 cifara). Podloga je ista boja s alpha `22`. */
  color: string;
  size?: 28 | 32 | 36 | 40 | 44 | 48 | 52;
  className?: string;
  style?: CSSProperties;
}

const TILE_ICON: Record<number, number> = { 28: 16, 32: 16, 36: 18, 40: 20, 44: 20, 48: 24, 52: 24 };
const TILE_RADIUS: Record<number, number> = { 28: 10, 32: 10, 36: 10, 40: 12, 44: 12, 48: 14, 52: 14 };

export function IconTile({ icon, color, size = 40, className, style }: IconTileProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-grid shrink-0 place-items-center", className)}
      style={{
        width: size,
        height: size,
        borderRadius: TILE_RADIUS[size],
        background: `${color}22`,
        color,
        ...style,
      }}
    >
      <Icon name={icon} size={TILE_ICON[size]} />
    </span>
  );
}

/* ───────── Chip ───────── */
export type ChipTone = "neutral" | "income" | "expense" | "warn" | "brand";

const CHIP: Record<ChipTone, string> = {
  neutral: "bg-bg text-ink-2 border border-divider",
  income: "bg-income-soft text-income-strong",
  expense: "bg-expense-soft text-expense-strong",
  warn: "bg-warn-soft text-warn",
  brand: "bg-soft text-heading",
};

export function Chip({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: ChipTone;
  icon?: IconKey;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold whitespace-nowrap",
        CHIP[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={16} className="-ml-0.5" />}
      {children}
    </span>
  );
}

/* ───────── Progress bar ───────── */
interface ProgressProps {
  /** 0–100 (vrijednosti preko 100 se prikazuju kao puna traka). */
  value: number;
  label: string;
  tone?: "income" | "expense" | "brand";
  color?: string;
  height?: number;
  /** `false` drži traku na 0 da bi se animirala pri ulasku. */
  on?: boolean;
  className?: string;
}

const TONE = { income: "var(--color-income)", expense: "var(--color-expense)", brand: "var(--color-accent)" };

export function ProgressBar({ value, label, tone = "income", color, height = 8, on = true, className }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      className={cn("w-full overflow-hidden rounded-full bg-soft", className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-[350ms] ease-bar"
        style={{ width: on ? `${v}%` : 0, background: color ?? TONE[tone] }}
      />
    </div>
  );
}

/* ───────── Skeleton ───────── */
export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} style={style} />;
}
