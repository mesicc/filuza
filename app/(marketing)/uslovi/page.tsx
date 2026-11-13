import type { Metadata } from "next";
import { LegalStub } from "@/components/landing/LegalStub";

export const metadata: Metadata = { title: "Uslovi korištenja – Filuza" };

export default function Page() {
  return <LegalStub title="Uslovi korištenja" />;
}
