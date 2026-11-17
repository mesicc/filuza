"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Coin, Logo } from "@/components/Logo";
import { IconButton } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { flashToast } from "@/lib/download";
import { Icon } from "@/lib/icons";
import { opener, restoreFocus } from "@/lib/inputModality";
import { session, signOut, useFiluza, useHydrated } from "@/lib/store";
import type { Screen } from "@/lib/types";
import { useScrollLock } from "@/lib/useScrollLock";
import { ConfirmDialog } from "./ConfirmDialog";
import { ModalHost } from "./modals/ModalHost";
import { AvatarButton, BellButton } from "./HeaderButtons";
import { NotifPopover } from "./NotifPopover";
import { Avatar } from "./common";
import { Budzeti } from "./screens/Budzeti";
import { Ciljevi } from "./screens/Ciljevi";
import { Kategorije } from "./screens/Kategorije";
import { Izvjestaji } from "./screens/Izvjestaji";
import { Pomoc } from "./screens/Pomoc";
import { Postavke } from "./screens/Postavke";
import { Pregled } from "./screens/Pregled";
import { Transakcije } from "./screens/Transakcije";

interface NavItem {
  screen: Screen;
  label: string;
  icon: string;
}

const MAIN: NavItem[] = [
  { screen: "pregled", label: "Pregled", icon: "layout-dashboard" },
  { screen: "transakcije", label: "Transakcije", icon: "arrow-left-right" },
  { screen: "budzeti", label: "Budžeti", icon: "piggy-bank" },
  { screen: "kategorije", label: "Kategorije", icon: "tags" },
  { screen: "ciljevi", label: "Finansijski ciljevi", icon: "target" },
  { screen: "izvjestaji", label: "Izvještaji", icon: "chart-column" },
];

const SECONDARY: NavItem[] = [
  { screen: "postavke", label: "Postavke", icon: "settings" },
  { screen: "pomoc", label: "Pomoć", icon: "circle-help" },
];

const MORE: NavItem[] = [MAIN[3], MAIN[4], MAIN[5], ...SECONDARY];
const MORE_SCREENS = new Set<Screen>(MORE.map((m) => m.screen));

function useLogout() {
  const router = useRouter();
  return () => {
    signOut();
    flashToast("Odjavljen si. Vidimo se uskoro!");
    router.push("/prijava#prijava");
  };
}

/* ───────────────────────── Sidebar ───────────────────────── */

function SideLink({ item, compact }: { item: NavItem; compact: boolean }) {
  const active = useFiluza((s) => s.screen === item.screen);
  const go = useFiluza((s) => s.go);
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      title={item.label}
      onClick={() => go(item.screen)}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-3 rounded-control px-3 text-[15px] transition-colors duration-150",
        !compact && "dk:justify-start",
        active
          ? "bg-soft font-bold text-heading"
          : "font-medium text-ink-2 hover:bg-soft hover:text-heading active:bg-soft-2/60",
      )}
    >
      <Icon name={item.icon} size={20} weight={active ? "fill" : "regular"} className={cn("shrink-0", active && "text-accent")} />
      <span className={cn("truncate", compact ? "sr-only" : "sr-only dk:not-sr-only")}>{item.label}</span>
    </button>
  );
}

function Sidebar() {
  const compact = useFiluza((s) => s.tweaks.compactSidebar);
  const profile = useFiluza((s) => s.profile);
  const go = useFiluza((s) => s.go);
  const logout = useLogout();
  const full = (cls: string) => (compact ? "hidden" : `hidden ${cls}`);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh w-[84px] shrink-0 flex-col border-r border-border bg-surface px-3.5 py-5 tb:flex",
        !compact && "dk:w-[248px]",
      )}
    >
      <div className={cn("flex flex-col items-center px-1", !compact && "dk:items-start dk:px-2")}>
        <span className={full("dk:block")}>
          <Logo size={38} textSize={25} />
        </span>
        <span className={compact ? "block" : "block dk:hidden"}>
          <Coin size={38} />
        </span>
        <p className={cn(full("dk:block"), "mt-1.5 text-[12px] leading-4 text-ink-2")}>Čuvaj svaku paru.</p>
      </div>

      <nav aria-label="Ekrani" className="mt-7 flex flex-col gap-1">
        {MAIN.map((item) => (
          <SideLink key={item.screen} item={item} compact={compact} />
        ))}
      </nav>

      <div className="flex-1" />

      <nav aria-label="Račun i pomoć" className="flex flex-col gap-1 border-t border-divider pt-3">
        {SECONDARY.map((item) => (
          <SideLink key={item.screen} item={item} compact={compact} />
        ))}
      </nav>

      <div
        className={cn(
          "mt-3 flex flex-col items-center gap-2 border-t border-divider pt-4",
          !compact && "dk:flex-row dk:gap-1",
        )}
      >
        <button
          type="button"
          onClick={() => go("postavke")}
          title="Postavke računa"
          className={cn(
            "flex min-w-0 items-center gap-2.5 rounded-control p-1 text-left transition-colors duration-150 hover:bg-soft active:bg-soft-2/60",
            !compact && "dk:flex-1",
          )}
        >
          <Avatar size={38} />
          <span className={cn(full("dk:block"), "min-w-0")}>
            <span className="block truncate text-[14px] leading-5 font-semibold text-ink">
              {profile.ime} {profile.prezime}
            </span>
            <span className="block truncate text-[12px] leading-4 text-ink-2">{profile.email}</span>
          </span>
          <span className="sr-only">Otvori postavke</span>
        </button>
        <IconButton label="Odjavi se" size={40} onClick={logout}>
          <Icon name="log-out" size={20} />
        </IconButton>
      </div>
    </aside>
  );
}

/* ───────────────────────── Mobitel ───────────────────────── */

function MobileTop() {
  return (
    <div className="sticky top-0 z-30 flex h-[60px] items-center gap-2 border-b border-border bg-[rgba(255,248,245,.92)] px-4 fz-blur tb:hidden">
      <Logo size={32} textSize={23} className="mr-auto" />
      <BellButton />
      <AvatarButton />
    </div>
  );
}

function BottomItem({
  label,
  icon,
  active,
  onClick,
  expanded,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active && expanded === undefined ? "page" : undefined}
      aria-expanded={expanded}
      className={cn(
        "flex h-16 min-w-0 flex-col items-center justify-center gap-0.5 text-[11px] leading-4",
        active ? "font-bold text-heading" : "font-medium text-ink-2",
      )}
    >
      <span
        className={cn(
          "grid h-7 w-11 place-items-center rounded-full transition-colors duration-150",
          active && "bg-soft text-accent",
        )}
      >
        <Icon name={icon} size={20} weight={active ? "fill" : "regular"} />
      </span>
      <span className="max-w-full truncate px-1">{label}</span>
    </button>
  );
}

function BottomNav() {
  const screen = useFiluza((s) => s.screen);
  const go = useFiluza((s) => s.go);
  const moreOpen = useFiluza((s) => s.moreOpen);
  const setMoreOpen = useFiluza((s) => s.setMoreOpen);
  const openModal = useFiluza((s) => s.openModal);

  return (
    <nav
      aria-label="Ekrani"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-white/[.96] pb-[env(safe-area-inset-bottom)] fz-blur tb:hidden"
    >
      <BottomItem label="Pregled" icon="layout-dashboard" active={screen === "pregled" && !moreOpen} onClick={() => go("pregled")} />
      <BottomItem
        label="Transakcije"
        icon="arrow-left-right"
        active={screen === "transakcije" && !moreOpen}
        onClick={() => go("transakcije")}
      />
      <div className="flex justify-center">
        <button
          type="button"
          aria-label="Nova transakcija"
          onClick={() => openModal("tx")}
          className="-mt-[22px] grid size-14 place-items-center rounded-full border-4 border-bg bg-primary text-white shadow-cta transition-[background-color,transform] duration-150 hover:bg-primary-hover active:scale-[.94]"
        >
          <Plus size={24} aria-hidden="true" />
        </button>
      </div>
      <BottomItem label="Budžeti" icon="piggy-bank" active={screen === "budzeti" && !moreOpen} onClick={() => go("budzeti")} />
      <BottomItem
        label="Više"
        icon="menu"
        active={moreOpen || MORE_SCREENS.has(screen)}
        expanded={moreOpen}
        onClick={() => setMoreOpen(!moreOpen)}
      />
    </nav>
  );
}

function MoreSheet() {
  const open = useFiluza((s) => s.moreOpen);
  const setOpen = useFiluza((s) => s.setMoreOpen);
  const screen = useFiluza((s) => s.screen);
  const go = useFiluza((s) => s.go);
  const logout = useLogout();
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const prev = opener();
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab") return;
      const items = Array.from(panel.current?.querySelectorAll<HTMLElement>("button") ?? []);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreFocus(prev);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const row =
    "flex h-[52px] w-full items-center gap-3.5 rounded-control px-3 text-left text-[16px] transition-colors duration-150 active:bg-soft-2/60";

  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-[rgba(81,38,23,.25)] animate-fz-fade tb:hidden"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Više"
        className="w-full rounded-t-[24px] bg-surface px-3 pt-2.5 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-modal animate-fz-pop"
      >
        <span aria-hidden="true" className="mx-auto mb-2 block h-1 w-10 rounded-full bg-soft-2" />
        {MORE.map((item) => {
          const active = screen === item.screen;
          return (
            <button
              key={item.screen}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => go(item.screen)}
              className={cn(row, active ? "bg-soft font-bold text-heading" : "font-medium text-ink hover:bg-soft")}
            >
              <Icon name={item.icon} size={20} weight={active ? "fill" : "regular"} className={active ? "text-accent" : "text-ink-2"} />
              {item.label}
            </button>
          );
        })}
        <div className="mt-1.5 border-t border-divider pt-1.5">
          <button type="button" onClick={logout} className={cn(row, "font-medium text-expense-strong hover:bg-expense-soft")}>
            <Icon name="log-out" size={20} />
            Odjavi se
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Sadržaj ───────────────────────── */

function ScreenSkeleton() {
  return (
    <div aria-busy="true" aria-label="Učitavanje" role="status" className="grid gap-5">
      <Skeleton className="h-16 rounded-section" />
      <div className="grid gap-4 min-[30rem]:grid-cols-2 min-[80rem]:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[150px] rounded-card" />
        ))}
      </div>
      <div className="grid gap-5 dk:grid-cols-[1.65fr_1fr]">
        <Skeleton className="h-[340px] rounded-card" />
        <Skeleton className="h-[340px] rounded-card" />
      </div>
    </div>
  );
}

function ActiveScreen({ screen }: { screen: Screen }) {
  switch (screen) {
    case "pregled":
      return <Pregled />;
    case "transakcije":
      return <Transakcije />;
    case "budzeti":
      return <Budzeti />;
    case "kategorije":
      return <Kategorije />;
    case "ciljevi":
      return <Ciljevi />;
    case "izvjestaji":
      return <Izvjestaji />;
    case "postavke":
      return <Postavke />;
    case "pomoc":
      return <Pomoc />;
    default:
      return null;
  }
}

export function AppShell() {
  const ready = useHydrated();
  const screen = useFiluza((s) => s.screen);
  const loading = useFiluza((s) => s.loading);
  const signedIn = useFiluza((s) => s.signedIn);
  const router = useRouter();

  // Bez prijave nema aplikacije: odjavljen korisnik ide na stranicu prijave.
  useEffect(() => {
    session.leaving = false;
  }, []);
  useEffect(() => {
    if (ready && !signedIn && !session.leaving) router.replace("/prijava#prijava");
  }, [ready, signedIn, router]);

  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileTop />
        <main className="mx-auto w-full max-w-[1480px] px-4 pt-5 pb-28 tb:p-6 dk:px-10 dk:py-7">
          {!ready || !signedIn || loading ? (
            <ScreenSkeleton />
          ) : (
            <div key={screen} className="animate-fz-in">
              <ActiveScreen screen={screen} />
            </div>
          )}
        </main>
      </div>
      <BottomNav />
      <MoreSheet />
      <NotifPopover />
      <ModalHost />
      <ConfirmDialog />
    </div>
  );
}
