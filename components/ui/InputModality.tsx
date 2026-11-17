"use client";

import { useEffect } from "react";
import { installInputModality } from "@/lib/inputModality";

/** Postavlja globalno praćenje unosa (miš/dodir/tastatura); ne renderuje ništa. */
export function InputModality() {
  useEffect(installInputModality, []);
  return null;
}
