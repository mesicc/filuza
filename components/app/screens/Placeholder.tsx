"use client";

import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/Button";
import { useFiluza } from "@/lib/store";
import type { Screen } from "@/lib/types";
import { ScreenHeader } from "../ScreenHeader";

const COPY: Partial<Record<Screen, { title: string; sub: string }>> = {
  izvjestaji: {
    title: "Finansijski izvještaji",
    sub: "Upoznaj svoje navike i donosi bolje finansijske odluke.",
  },
  postavke: { title: "Postavke", sub: "Upravljaj svojim računom, preferencijama i sigurnošću." },
  pomoc: { title: "Pomoć", sub: "Odgovori na najčešća pitanja o Filuzi." },
};

/** Zaglavlje ekrana čiji sadržaj još nije napravljen (Izvještaji, Postavke, Pomoć). */
export function Placeholder({ screen }: { screen: Screen }) {
  const openModal = useFiluza((s) => s.openModal);
  const copy = COPY[screen];
  if (!copy) return null;
  return (
    <ScreenHeader
      title={copy.title}
      sub={copy.sub}
      action={
        screen === "izvjestaji" ? (
          <Button onClick={() => openModal("report")}>
            <DownloadSimple size={18} aria-hidden="true" />
            Preuzmi izvještaj
          </Button>
        ) : undefined
      }
    />
  );
}
