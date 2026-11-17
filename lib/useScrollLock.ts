"use client";

import { useEffect } from "react";

let locks = 0;
let previous = { html: "", body: "" };

/**
 * Zaključava skrolovanje stranice dok je otvoren modal, dijalog ili bottom sheet.
 * Zaključavaju se i `html` i `body`: Safari na iPhoneu skroluje dokument kroz `html`.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    if (locks === 0) {
      previous = { html: html.style.overflow, body: document.body.style.overflow };
      html.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) {
        html.style.overflow = previous.html;
        document.body.style.overflow = previous.body;
      }
    };
  }, [active]);
}
