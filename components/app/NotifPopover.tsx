"use client";

import { useEffect, useRef } from "react";
import { IconButton } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { Icon } from "@/lib/icons";
import { useFiluza, useNotifs } from "@/lib/store";
import { NOTIF_TONES } from "@/lib/types";
import { EmptyState, LinkButton } from "./common";

export function NotifPopover() {
  const open = useFiluza((s) => s.notifOpen);
  const setOpen = useFiluza((s) => s.setNotifOpen);
  const notifs = useNotifs();
  const markRead = useFiluza((s) => s.markNotifRead);
  const markAll = useFiluza((s) => s.markAllNotifsRead);
  const remove = useFiluza((s) => s.deleteNotif);
  const toast = useToast();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = panel.current;
    el?.focus();
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (panel.current?.contains(t) || t.closest("[data-notif-toggle]")) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      if (el?.contains(document.activeElement) || document.activeElement === document.body) prev?.focus?.();
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={panel}
      id="notifikacije"
      role="dialog"
      aria-label="Notifikacije"
      tabIndex={-1}
      className="fixed inset-x-3 top-16 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-section border border-border bg-surface shadow-popover outline-none animate-fz-pop tb:inset-x-auto tb:top-[84px] tb:right-8 tb:w-[380px]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-divider py-3 pr-4 pl-[18px]">
        <h2 className="font-display text-[18px] leading-6 font-semibold tracking-[-0.015em] text-ink">Notifikacije</h2>
        <LinkButton
          disabled={notifs.length === 0}
          onClick={() => {
            markAll();
            toast("Sve notifikacije su označene kao pročitane.");
          }}
          className="mx-0 text-[13px]"
        >
          Označi sve kao pročitano
        </LinkButton>
      </div>

      {notifs.length === 0 ? (
        <EmptyState compact icon="bell-off" title="Sve je mirno. Nemaš novih notifikacija." />
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {notifs.map((n) => {
            const tone = NOTIF_TONES[n.tone];
            return (
              <li
                key={n.id}
                className={cn(
                  "flex items-start gap-3 border-b border-divider py-3 pr-2.5 pl-[18px] last:border-b-0",
                  !n.read && "bg-bg",
                )}
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-[10px]"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  <Icon name={n.icon} size={18} />
                </span>
                <div className="min-w-0 flex-1 pt-px">
                  <p className={cn("text-[14px] leading-5 text-ink", !n.read && "font-semibold")}>
                    {!n.read && <span className="sr-only">Nepročitano: </span>}
                    {n.text}
                  </p>
                  <p className="tnum mt-0.5 text-[12px] leading-4 text-ink-2">{n.time}</p>
                </div>
                <div className="flex shrink-0">
                  {!n.read && (
                    <IconButton label="Označi kao pročitano" size={36} onClick={() => markRead(n.id)}>
                      <Icon name="check" size={18} />
                    </IconButton>
                  )}
                  <IconButton label="Obriši notifikaciju" size={36} onClick={() => remove(n.id)}>
                    <Icon name="x" size={18} />
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
