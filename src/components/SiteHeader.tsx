"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon, type IconName, Logo } from "./Icon";

const VOLUNTEER: { href: string; label: string; icon: IconName }[] = [
  { href: "/trials", label: "ค้นหางานวิจัย", icon: "search" },
  { href: "/screen", label: "คัดกรองเบื้องต้น", icon: "clipboard" },
  { href: "/map", label: "แผนที่", icon: "map" },
  { href: "/alerts", label: "แจ้งเตือน LINE", icon: "bell" },
  { href: "/learn", label: "ก่อนเข้าร่วม", icon: "book" },
];

const RESEARCH: { href: string; label: string; icon: IconName }[] = [
  { href: "/research", label: "ภาพรวม", icon: "chart" },
  { href: "/research/explore", label: "สำรวจข้อมูล", icon: "table" },
];

function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the theme applied before hydration
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      onClick={toggle}
      className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:text-ink"
      aria-label={dark ? "เปลี่ยนเป็นธีมสว่าง" : "เปลี่ยนเป็นธีมมืด"}
      title={dark ? "ธีมสว่าง" : "ธีมมืด"}
    >
      <Icon name={dark ? "sun" : "moon"} className="size-[18px]" />
    </button>
  );
}

export function SiteHeader() {
  const path = usePathname();
  const isResearch = path.startsWith("/research");
  const items = isResearch ? RESEARCH : VOLUNTEER;
  const active = (href: string) =>
    href === "/research" ? path === "/research" : path === href || path.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-[1000] border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-3 pb-2">
        <Link href={isResearch ? "/research" : "/"} className="flex shrink-0 items-center gap-2.5">
          <Logo />
          <span className="leading-tight">
            <span className="block text-[17px] font-bold tracking-tight">
              Clinical<span className="text-primary">Thai</span>
            </span>
            <span className="block text-xs text-muted">{isResearch ? "ข้อมูลสำหรับนักวิจัย" : "งานวิจัยเปิดรับอาสาสมัคร"}</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex shrink-0 rounded-xl border border-line bg-surface-2 p-1 text-sm">
            <Link
              href="/"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${!isResearch ? "bg-surface font-medium text-primary shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <Icon name="user" className="size-4" />
              <span className="hidden sm:inline">อาสาสมัคร</span>
            </Link>
            <Link
              href="/research"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${isResearch ? "bg-surface font-medium text-primary shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <Icon name="flask" className="size-4" />
              <span className="hidden sm:inline">นักวิจัย</span>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 text-[15px]">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              active(it.href) ? "bg-primary-soft font-medium text-primary" : "text-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            <Icon name={it.icon} className="size-4" />
            {it.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
