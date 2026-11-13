import { CaretDown, Check, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-[18px] font-medium text-expense-strong">
      <WarningCircle size={16} aria-hidden="true" className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  right,
}: {
  htmlFor: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[13.5px] font-semibold text-ink">
        {children}
      </label>
      {right}
    </div>
  );
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
  /** Ikona unutar polja, lijevo. */
  icon?: ReactNode;
  /** Kontrola unutar polja, desno (npr. dugme oka). */
  trailing?: ReactNode;
  /** Sadržaj u redu labele, desno (npr. link). */
  labelRight?: ReactNode;
  /** Sadržaj ispod polja (npr. indikator jačine). */
  below?: ReactNode;
  fieldSize?: "md" | "lg";
  wrapClassName?: string;
}

export function TextField({
  label,
  error,
  icon,
  trailing,
  labelRight,
  below,
  fieldSize = "md",
  wrapClassName,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const errId = `${fid}-err`;
  return (
    <div className={wrapClassName}>
      <FieldLabel htmlFor={fid} right={labelRight}>
        {label}
      </FieldLabel>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 grid -translate-y-1/2 place-items-center text-ink-2">
            {icon}
          </span>
        )}
        <input
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className={cn(
            "fz-field",
            fieldSize === "lg" && "h-[50px]",
            icon ? "pl-[42px]" : null,
            trailing ? "pr-[50px]" : null,
            className,
          )}
          {...rest}
        />
        {trailing && <span className="absolute right-[5px] top-1/2 -translate-y-1/2">{trailing}</span>}
      </div>
      {below}
      <FieldError id={errId}>{error}</FieldError>
    </div>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  /** Sakrij labelu vizuelno (ostaje za čitače ekrana). */
  hideLabel?: boolean;
  wrapClassName?: string;
}

export function Select({ label, error, hideLabel, wrapClassName, className, id, children, ...rest }: SelectProps) {
  const auto = useId();
  const fid = id ?? auto;
  const errId = `${fid}-err`;
  return (
    <div className={wrapClassName}>
      {hideLabel ? (
        <label htmlFor={fid} className="sr-only">
          {label}
        </label>
      ) : (
        <FieldLabel htmlFor={fid}>{label}</FieldLabel>
      )}
      <div className="relative">
        <select
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className={cn("fz-field", className)}
          {...rest}
        >
          {children}
        </select>
        <CaretDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-2"
        />
      </div>
      <FieldError id={errId}>{error}</FieldError>
    </div>
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode;
  error?: string;
}

export function Checkbox({ children, error, id, className, ...rest }: CheckboxProps) {
  const auto = useId();
  const fid = id ?? auto;
  const errId = `${fid}-err`;
  return (
    <div className={className}>
      <div className="flex items-start gap-2.5">
        <span className="relative mt-px inline-grid size-5 shrink-0 place-items-center">
          <input
            id={fid}
            type="checkbox"
            className="fz-check"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errId : undefined}
            {...rest}
          />
          <Check size={14} aria-hidden="true" className="pointer-events-none absolute text-white" />
        </span>
        <label htmlFor={fid} className="text-[14px] leading-[22px] text-ink">
          {children}
        </label>
      </div>
      <FieldError id={errId}>{error}</FieldError>
    </div>
  );
}
