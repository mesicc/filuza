"use client";

import type { ReactNode } from "react";
import { AvatarButton, BellButton } from "./HeaderButtons";

/** Zaglavlje ekrana: H1 i podnaslov lijevo; akcija ekrana, zvono i avatar desno. */
export function ScreenHeader({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-start gap-x-6 gap-y-4 tb:mb-6">
      <div className="min-w-0 flex-1 basis-[300px]">
        <h1 className="font-display text-[26px] leading-[1.12] font-bold tracking-[-0.022em] text-heading tb:text-[32px]">
          {title}
        </h1>
        <p className="mt-1.5 text-[15px] leading-[22px] text-ink-2">{sub}</p>
      </div>
      <div className="flex w-full items-center gap-2.5 tb:w-auto">
        {action && <div className="w-full tb:w-auto [&>*]:w-full tb:[&>*]:w-auto">{action}</div>}
        <div className="hidden items-center gap-2.5 tb:flex">
          <BellButton />
          <AvatarButton />
        </div>
      </div>
    </header>
  );
}
