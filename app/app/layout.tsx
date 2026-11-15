import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Filuza",
  robots: { index: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
