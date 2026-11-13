"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { IconButton } from "./Button";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Red s dugmadima na dnu. */
  footer?: ReactNode;
  /** Najveća širina na tabletu/desktopu. */
  width?: number;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal: `Esc` zatvara, fokus ide na polje s `autoFocus` (ili prvo polje),
 * Tab ostaje unutar modala, a po zatvaranju se fokus vraća na okidač.
 * Na mobitelu (< 760px) otvara se kao bottom sheet.
 */
export function Modal({ open, onClose, title, description, children, footer, width = 480 }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = panel.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first =
      el?.querySelector<HTMLElement>("[data-autofocus]") ??
      el?.querySelector<HTMLElement>("input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled])") ??
      el;
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === el)) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-overlay animate-fz-fade tb:items-center tb:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col bg-surface shadow-modal outline-none animate-fz-pop",
          "rounded-t-[24px] tb:rounded-card",
        )}
        style={{ maxWidth: `min(100%, ${width}px)` }}
      >
        <div className="flex items-start justify-between gap-4 px-[18px] pt-[18px] tb:px-6 tb:pt-6">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-[22px] leading-7 font-semibold tracking-[-0.015em] text-ink">
              {title}
            </h2>
            {description && <p className="mt-1 text-[14px] text-ink-2">{description}</p>}
          </div>
          <IconButton label="Zatvori" size={36} onClick={onClose} className="-mt-1 -mr-1.5">
            <X size={18} aria-hidden="true" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-5 tb:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2.5 border-t border-divider px-[18px] py-4 tb:flex-row tb:justify-end tb:px-6 pb-[max(16px,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
