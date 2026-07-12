"use client";

import Link from "next/link";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Mascot } from "@/features/mascot/components/Mascot";
import { formatDateShort } from "@/utils/date";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useEvolutionDex } from "../hooks/useEvolutionDex";

function BackAction() {
  return (
    <Link
      href="/"
      aria-label="ホームへ戻る"
      className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground transition-colors active:bg-secondary"
    >
      <ArrowLeft className="size-5" />
    </Link>
  );
}

export function EvolutionDexView() {
  const mounted = useHasMounted();
  const { totalXp, levelInfo, stages, history, isLoading } = useEvolutionDex();

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader title="進化図鑑" subtitle="マッスーの成長記録" action={<BackAction />} />
        <div className="h-64 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="進化図鑑"
        subtitle="マッスーの成長記録"
        action={<BackAction />}
      />

      <Card className="mb-4 border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold">現在の成長</p>
              <p className="text-xs text-muted-foreground">
                Lv.{levelInfo.level} · {totalXp.toLocaleString()} XP
              </p>
            </div>
            <Badge variant="secondary">{history.length}回進化</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {stages.map(({ stage, unlocked, requiredXp, history: record }) => (
          <Card
            key={stage.id}
            className={cn(
              "border-border bg-card",
              !unlocked && "opacity-70",
            )}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div
                  className={cn(
                    "flex size-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ring-1 ring-border",
                    stage.accentClassName,
                  )}
                >
                  {unlocked ? (
                    <Mascot
                      variant={stage.id}
                      mood={stage.id === "legend" ? "cheering" : "happy"}
                      size={82}
                    />
                  ) : (
                    <Lock className="size-9 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-bold">{stage.name}</p>
                    {unlocked && <Sparkles className="size-4 text-primary" />}
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {stage.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed">{stage.message}</p>
                  <div className="mt-3 rounded-2xl bg-secondary/60 px-3 py-2 text-xs">
                    {unlocked ? (
                      <span>
                        {record
                          ? `${formatDateShort(record.evolvedAt)} に解放`
                          : "解放済み（次回表示時に履歴へ保存）"}
                      </span>
                    ) : (
                      <span>
                        解放条件: Lv.{stage.minLevel} / 必要XP{" "}
                        {requiredXp.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Link
        href="/workout/new"
        className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
      >
        XPを増やすために記録する
      </Link>
    </div>
  );
}
