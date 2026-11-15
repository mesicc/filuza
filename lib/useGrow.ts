"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Flag `barsOn` za animaciju rasta: pri svakoj promjeni `key` vraća `false`,
 * pa nakon 40 ms `true`. Stupci, progress trake i donut ga koriste da narastu od nule.
 */
export function useGrow(key?: unknown): boolean {
  const [on, setOn] = useState(false);
  useIsoLayoutEffect(() => {
    setOn(false);
    const t = setTimeout(() => setOn(true), 40);
    return () => clearTimeout(t);
  }, [key]);
  return on;
}
