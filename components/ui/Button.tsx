import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "white" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-150 " +
  "active:scale-[.97] disabled:opacity-55 disabled:active:scale-100";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover disabled:hover:bg-primary",
  secondary:
    "bg-surface text-heading border border-border hover:bg-soft hover:border-soft-2 disabled:hover:bg-surface disabled:hover:border-border",
  ghost: "text-heading hover:bg-soft disabled:hover:bg-transparent",
  white: "bg-white text-heading hover:bg-soft",
  danger: "bg-expense-strong text-white hover:bg-[#8a3f38]",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[14px]",
  md: "h-11 px-[18px] text-[15px]",
  lg: "h-[52px] px-6 text-[16px]",
  xl: "h-[54px] px-7 text-[16px]",
};

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}

export function buttonClass({ variant = "primary", size = "md", block, className }: StyleProps = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], block && "w-full", className);
}

export function Spinner({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block rounded-full border-2 border-current border-r-transparent animate-fz-spin", className)}
      style={{ width: size, height: size }}
    />
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  /** Stanje „radim“: spinner, zamjenski tekst, dugme onemogućeno. */
  busy?: boolean;
  busyText?: ReactNode;
}

export function Button({
  variant,
  size,
  block,
  className,
  busy,
  busyText,
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={buttonClass({ variant, size, block, className })}
      {...rest}
    >
      {busy ? (
        <>
          <Spinner />
          {busyText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps;

export function ButtonLink({ variant, size, block, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, block, className })} {...rest} />;
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obavezan naziv za čitače ekrana. */
  label: string;
  size?: 36 | 40 | 44;
  bordered?: boolean;
}

export function IconButton({ label, size = 40, bordered, className, type = "button", children, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid place-items-center shrink-0 rounded-control text-ink-2 transition-[background-color,color,transform,border-color] duration-150",
        "hover:bg-soft hover:text-heading active:scale-[.94] disabled:opacity-50 disabled:hover:bg-transparent disabled:active:scale-100",
        bordered && "border border-border bg-surface hover:border-soft-2",
        className,
      )}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
    </button>
  );
}
