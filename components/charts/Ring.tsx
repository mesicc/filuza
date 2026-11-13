interface Props {
  /** 0–100 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
}

/** Mali prsten napretka (dekorativan – tekst pored njega nosi vrijednost). */
export function Ring({
  value,
  size = 44,
  stroke = 5,
  color = "var(--color-income)",
  track = "var(--color-soft)",
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(c * v) / 100} ${c}`}
      />
    </svg>
  );
}
