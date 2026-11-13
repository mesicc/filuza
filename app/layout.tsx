import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Filuza – Čuvaj svaku paru.",
  description:
    "Filuza je jednostavna aplikacija za praćenje prihoda, rashoda, budžeta i ciljeva štednje u KM.",
  applicationName: "Filuza",
};

export const viewport: Viewport = {
  themeColor: "#FFF8F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bs" className={`${instrument.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
