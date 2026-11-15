"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/lib/icons";
import { useFiluza, useNotifs } from "@/lib/store";
import { Avatar } from "./common";

export function BellButton() {
  const open = useFiluza((s) => s.notifOpen);
  const setOpen = useFiluza((s) => s.setNotifOpen);
  const unread = useNotifs().filter((n) => !n.read).length;
  return (
    <button
      type="button"
      data-notif-toggle
      aria-expanded={open}
      aria-controls="notifikacije"
      aria-label={unread ? `Notifikacije, ${unread} nepročitano` : "Notifikacije"}
      onClick={() => setOpen(!open)}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-control border bg-surface text-ink-2 transition-colors duration-150",
        "hover:border-soft-2 hover:bg-soft hover:text-heading active:scale-[.96]",
        open ? "border-soft-2 bg-soft text-heading" : "border-border",
      )}
    >
      <Icon name="bell" size={20} />
      {unread > 0 && (
        <span className="tnum absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-accent px-1 text-[10px] leading-none font-bold text-white">
          {unread}
        </span>
      )}
    </button>
  );
}

export function AvatarButton() {
  const go = useFiluza((s) => s.go);
  return (
    <button
      type="button"
      aria-label="Postavke računa"
      title="Postavke računa"
      onClick={() => go("postavke")}
      className="shrink-0 rounded-full transition-transform duration-150 hover:scale-[1.04] active:scale-[.96]"
    >
      <Avatar size={44} ring />
    </button>
  );
}
