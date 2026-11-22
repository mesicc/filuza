import { STRENGTH, passwordStrength } from "@/lib/validation";

/** Četiri crtice i oznaka jačine lozinke (registracija, promjena lozinke). */
export function StrengthMeter({ password }: { password: string }) {
  const score = passwordStrength(password);
  const level = score > 0 ? STRENGTH[score - 1] : null;
  return (
    <div className="mt-2.5 flex h-[18px] items-center gap-3">
      <div aria-hidden="true" className="flex flex-1 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-200"
            style={{
              background: level && i <= score ? level.color : "#F4E4DD",
            }}
          />
        ))}
      </div>
      <span
        aria-live="polite"
        className="min-w-[66px] text-right text-[12.5px] leading-[18px] font-semibold text-ink-2"
      >
        {level && (
          <>
            <span className="sr-only">Jačina lozinke: </span>
            {level.label}
          </>
        )}
      </span>
    </div>
  );
}
