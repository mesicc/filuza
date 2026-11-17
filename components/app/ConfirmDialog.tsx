"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/lib/icons";
import { opener, restoreFocus } from "@/lib/inputModality";
import { useFiluza } from "@/lib/store";
import { useScrollLock } from "@/lib/useScrollLock";

/**
 * Potvrdni dijalog. Otvara se preko store-a:
 * `askConfirm({ title, text, confirmLabel, destructive, onConfirm })`.
 * `cancelLabel: null` daje dijalog sa samo jednim dugmetom.
 */
export function ConfirmDialog() {
  const c = useFiluza((s) => s.confirm);
  const close = useFiluza((s) => s.closeConfirm);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const textId = useId();
  useScrollLock(c !== null);

  useEffect(() => {
    if (!c) return;
    const prev = opener();
    const el = panel.current;
    el?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>("button"));
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreFocus(prev);
    };
  }, [c, close]);

  if (!c || typeof document === "undefined") return null;

  const cancel = c.cancelLabel === undefined ? "Otkaži" : c.cancelLabel;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-overlay animate-fz-fade tb:items-center tb:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={panel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        className="w-full rounded-t-[24px] bg-surface p-[18px] pb-[max(18px,env(safe-area-inset-bottom))] shadow-modal animate-fz-pop tb:max-w-[420px] tb:rounded-card tb:p-6"
      >
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-[14px] bg-expense-soft text-expense-text"
        >
          <Icon name="circle-alert" size={24} />
        </span>
        <h2 id={titleId} className="mt-4 font-display text-[21px] leading-7 font-bold tracking-[-0.015em] text-ink">
          {c.title}
        </h2>
        <p id={textId} className="mt-1.5 text-[15px] leading-[1.55] text-ink-2">
          {c.text}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2.5 tb:flex-row tb:justify-end">
          {cancel && (
            <Button variant="secondary" onClick={close}>
              {cancel}
            </Button>
          )}
          <Button
            variant={c.destructive ? "danger" : "primary"}
            onClick={() => {
              c.onConfirm?.();
              close();
            }}
          >
            {c.confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
