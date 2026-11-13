import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Filuza",
  robots: { index: false },
};

/** Shell aplikacije. Sidebar, gornja traka i donja navigacija dolaze ovdje. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bg">
        <main className="mx-auto w-full max-w-[1480px] px-4 pt-4 pb-28 tb:p-6 dk:px-10 dk:py-7">{children}</main>
      </div>
    </ToastProvider>
  );
}
