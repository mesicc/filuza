import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Logo } from "@/components/Logo";

/** Privremena stranica za pravne dokumente dok se ne dostavi stvarni tekst. */
export function LegalStub({ title }: { title: string }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col px-5 py-6">
      <div className="flex h-11 items-center justify-between">
        <Link href="/" aria-label="Filuza – početna" className="rounded-control p-1">
          <Logo size={34} textSize={24} />
        </Link>
        <Link
          href="/"
          className="flex h-11 items-center gap-1.5 rounded-control px-3 text-[14.5px] font-semibold text-heading transition-colors duration-150 hover:bg-soft"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Početna
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-center py-16">
        <h1 className="font-display text-[clamp(30px,5vw,40px)] leading-[1.1] font-bold tracking-[-0.022em] text-heading">
          {title}
        </h1>
        <p className="mt-4 max-w-[520px] text-[16px] leading-[1.6] text-ink-2">
          Ovaj dokument je u pripremi. Za sva pitanja piši nam na{" "}
          <a
            href="mailto:podrska@filuza.ba"
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
          >
            podrska@filuza.ba
          </a>
          .
        </p>
      </div>
    </main>
  );
}
