"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, PersonStanding, Plus, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/progress", label: "進捗", icon: TrendingUp },
  { href: "/workout/new", label: "記録", icon: Plus, isPrimary: true },
  { href: "/exercises", label: "種目", icon: BookOpen },
  { href: "/muscle-map", label: "マップ", icon: PersonStanding },
] as const;

/** 下部タブバー。中央の「記録」は最短導線としてアクセント色で隆起させる */
export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl pb-safe">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if ("isPrimary" in tab && tab.isPrimary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                className="relative -mt-5 flex min-w-16 flex-col items-center justify-start"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_24px_rgba(191,255,0,0.35)] transition-transform active:scale-90">
                  <Icon className="size-7" strokeWidth={2.5} />
                </span>
                <span className="mt-1 pb-2 text-[10px] font-medium text-muted-foreground">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={cn(
                "flex min-w-16 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon
                className={cn("size-6 transition-transform", isActive && "scale-105")}
              />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
