"use client";

import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { FieldError, FieldLabel } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { km } from "@/lib/format";
import { Icon } from "@/lib/icons";
import type { Goal } from "@/lib/types";

/** Nakon neuspjele validacije fokusira prvo neispravno polje forme. */
export function focusFirstInvalid(formId: string) {
  requestAnimationFrame(() => {
    document.getElementById(formId)?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
}

interface AmountFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange" | "value"> {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  /** Veliko polje (60px) za glavni iznos forme. */
  big?: boolean;
  /** Ikona lijevo (ključ iz mape). */
  icon?: string;
  /** Fokusiraj pri otvaranju modala. */
  autoFocusField?: boolean;
}

/** Polje za iznos: decimalna tastatura, „KM“ desno, tabelarne cifre. */
export function AmountField({
  label,
  value,
  onChange,
  error,
  big,
  icon,
  autoFocusField,
  className,
  id,
  ...rest
}: AmountFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const errId = `${fid}-err`;
  return (
    <div className={className}>
      <FieldLabel htmlFor={fid}>{label}</FieldLabel>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-2">
            <Icon name={icon} size={18} />
          </span>
        )}
        <input
          id={fid}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          data-autofocus={autoFocusField ? "" : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className={cn(
            "fz-field tnum font-bold tracking-[-0.02em]",
            big ? "h-[60px] pr-[62px] text-[26px]" : "pr-[52px] text-[16px]",
            icon && "pl-[42px]",
          )}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-semibold text-ink-2",
            big ? "text-[16px]" : "text-[14px]",
          )}
        >
          KM
        </span>
      </div>
      <FieldError id={errId}>{error}</FieldError>
    </div>
  );
}

/** Grupa izbora (ikone, boje, pilule) s labelom i semantikom radio grupe. */
export function ChoiceGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div>
      <p id={id} className="mb-1.5 text-[13.5px] font-semibold text-ink">
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={id} className={className}>
        {children}
      </div>
    </div>
  );
}

/** Mreža ikona za izbor (kategorija, cilj). */
export function IconPicker({
  label,
  icons,
  value,
  onChange,
}: {
  label: string;
  icons: readonly string[];
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <ChoiceGroup label={label} className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(44px,1fr))]">
      {icons.map((ic) => {
        const active = ic === value;
        return (
          <button
            key={ic}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={ic.replace(/-/g, " ")}
            onClick={() => onChange(ic)}
            className={cn(
              "grid h-11 place-items-center rounded-control border transition-colors duration-150",
              active
                ? "border-accent bg-soft text-accent"
                : "border-border bg-surface text-ink-2 hover:border-soft-2 hover:bg-soft hover:text-heading",
            )}
          >
            <Icon name={ic} size={20} />
          </button>
        );
      })}
    </ChoiceGroup>
  );
}

/** Zaglavlje modala cilja: ikona + „{naziv} · {ušteđeno} od {cilj}“. */
export function GoalHead({ goal, saved }: { goal: Goal; saved: number }) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-bg p-3">
      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-soft text-accent">
        <Icon name={goal.icon} size={20} />
      </span>
      <p className="tnum min-w-0 text-[14px] leading-5 text-ink-2">
        <strong className="block truncate text-[15px] font-semibold text-ink">{goal.name}</strong>
        {km(saved)} od {km(goal.target)}
      </p>
    </div>
  );
}
