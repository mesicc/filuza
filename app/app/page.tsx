"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/primitives";
import { vocative } from "@/lib/format";
import { useFiluza, useHydrated } from "@/lib/store";

/** Privremeni sadržaj dok ekrani aplikacije ne budu dodani. */
export default function AppHome() {
  const ready = useHydrated();
  const firstName = useFiluza((s) => s.profile.firstName);

  return (
    <div className="animate-fz-in">
      <Link href="/" aria-label="Filuza – početna" className="inline-flex rounded-control p-1">
        <Logo size={36} textSize={26} />
      </Link>
      <div className="mt-10">
        {ready ? (
          <h1 className="font-display text-[26px] leading-[1.15] font-bold tracking-[-0.02em] text-heading tb:text-[32px]">
            Dobro došao nazad, {vocative(firstName)}!
          </h1>
        ) : (
          <Skeleton className="h-9 w-[min(360px,80%)]" />
        )}
        <p className="mt-3 max-w-[480px] text-[15px] text-ink-2">Ekrani aplikacije stižu u sljedećem koraku.</p>
      </div>
    </div>
  );
}
