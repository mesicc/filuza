import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Prijava – Filuza",
  description: "Prijavi se ili kreiraj besplatan Filuza račun i počni pratiti svoj novac u KM.",
};

export default function Page() {
  return <AuthPage />;
}
