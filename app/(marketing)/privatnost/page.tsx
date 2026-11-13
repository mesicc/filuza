import type { Metadata } from "next";
import { LegalStub } from "@/components/landing/LegalStub";

export const metadata: Metadata = { title: "Politika privatnosti – Filuza" };

export default function Page() {
  return <LegalStub title="Politika privatnosti" />;
}
