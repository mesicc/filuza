import { useId } from "react";
import { cn } from "@/lib/cn";

interface CoinProps {
  size?: number;
  /** Svijetli odsjaj uz rub novčića. */
  shine?: boolean;
  className?: string;
}

/** Zlatni novčić s klicom (sekcija 2.5). */
export function Coin({ size = 36, shine = false, className }: CoinProps) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={id} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F6CB7C" />
          <stop offset="0.5" stopColor="#E6AA4E" />
          <stop offset="1" stopColor="#D99A3E" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#${id})`} stroke="#B9812F" strokeWidth="2" />
      <circle cx="24" cy="24" r="18.6" stroke="#B9812F" strokeWidth="1" strokeDasharray="1.6 2.3" />
      <circle cx="24" cy="24" r="15" stroke="#C99240" strokeWidth="1" opacity="0.7" />
      {shine && (
        <path
          d="M8 14A22 22 0 0 1 30 3"
          stroke="#F6CB7C"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.95"
        />
      )}
      <path d="M24 33.5V22.5" stroke="#512617" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 25C24 20 20.5 17 15.5 17C15.5 22 19 25 24 25Z" fill="#512617" />
      <path d="M24 22C24 17 27.5 14 32.5 14C32.5 19 29 22 24 22Z" fill="#512617" />
    </svg>
  );
}

interface LogoProps extends CoinProps {
  /** Veličina riječi „filuza“ u px (podrazumijevano ~0,72 × novčić). */
  textSize?: number;
  /** Samo novčić, bez riječi. */
  coinOnly?: boolean;
}

export function Logo({ size = 36, textSize, shine, coinOnly, className }: LogoProps) {
  const fs = textSize ?? Math.round(size * 0.72);
  return (
    <span className={cn("inline-flex items-center", className)} style={{ gap: Math.round(size * 0.26) }}>
      <Coin size={size} shine={shine} />
      {!coinOnly && (
        <span
          className="font-display font-bold text-heading"
          style={{ fontSize: fs, lineHeight: 1, letterSpacing: "-0.02em", paddingBottom: fs * 0.08 }}
        >
          filuza
        </span>
      )}
    </span>
  );
}
