"use client";

import { Moon, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useThemeStore, type ThemeMode } from "@/stores/themeStore";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{ value: ThemeMode; label: string; icon: typeof Moon }> = [
  { value: "dark", label: "ダーク", icon: Moon },
  { value: "light", label: "ライト", icon: Sun },
];

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-sm font-semibold">表示モード</p>
          <p className="text-[11px] text-muted-foreground">
            明るい場所ではライト、夜やジムではダークが見やすい設定です
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground active:bg-card/60",
                )}
              >
                <Icon className="size-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
